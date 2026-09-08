const Post = require("../models/Post");
const User = require("../models/User");
const Connection = require("../models/Connection");
const createNotification = require("../utils/createNotification");
const { isValidObjectId } = require("../middleware/validateObjectId");

// Helper: Extract hashtags and mentions
const extractHashtagsAndMentions = async (text) => {
  if (!text) return { tags: [], mentionUserIds: [] };

  // Hashtags
  const hashtagMatches = text.match(/#[a-zA-Z0-9_]+/g) || [];
  const tags = Array.from(
    new Set(hashtagMatches.map((t) => t.replace("#", "").toLowerCase().trim()))
  );

  // Mentions
  const mentionMatches = text.match(/@[a-zA-Z0-9_]+/g) || [];
  const usernames = Array.from(
    new Set(mentionMatches.map((m) => m.replace("@", "").toLowerCase().trim()))
  );

  let mentionUserIds = [];
  if (usernames.length > 0) {
    const mentionedUsers = await User.find({
      username: { $in: usernames }
    }).select("_id");
    mentionUserIds = mentionedUsers.map((u) => u._id);
  }

  return { tags, mentionUserIds };
};

// ==========================================
// CREATE POST
// ==========================================

const createPost = async (req, res) => {
  try {
    const {
      content,
      postType = "text",
      visibility = "public",
      projectRef,
      jobRef,
      image: imageUrl
    } = req.body;

    let image = imageUrl || "";
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post content is required"
      });
    }

    const { tags: extractedTags, mentionUserIds } =
      await extractHashtagsAndMentions(content);

    // Also merge any manually passed tags
    let allTags = extractedTags;
    if (req.body.tags) {
      const explicitTags = Array.isArray(req.body.tags)
        ? req.body.tags
        : String(req.body.tags).split(",");
      explicitTags.forEach((t) => {
        const clean = String(t).replace("#", "").toLowerCase().trim();
        if (clean && !allTags.includes(clean)) {
          allTags.push(clean);
        }
      });
    }

    let parsedProjectRef = null;
    if (projectRef) {
      try {
        parsedProjectRef =
          typeof projectRef === "string" ? JSON.parse(projectRef) : projectRef;
      } catch (_e) {
        parsedProjectRef = projectRef;
      }
    }

    let parsedJobRef = null;
    if (jobRef) {
      try {
        parsedJobRef =
          typeof jobRef === "string" ? JSON.parse(jobRef) : jobRef;
      } catch (_e) {
        parsedJobRef = jobRef;
      }
    }

    const allowedTypes = [
      "text",
      "image",
      "project",
      "career_update",
      "achievement",
      "job_related",
      "learning",
      "technical",
      "general"
    ];
    const normalizedType = allowedTypes.includes(postType) ? postType : "text";
    const allowedVisibility = ["public", "connections", "followers"];
    const normalizedVisibility = allowedVisibility.includes(visibility) ? visibility : "public";

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      postType: normalizedType,
      visibility: normalizedVisibility,
      image: image,
      tags: allTags,
      mentions: mentionUserIds,
      projectRef: parsedProjectRef,
      jobRef: parsedJobRef
    });

    // Notify mentioned users
    if (mentionUserIds.length > 0) {
      for (const recipientId of mentionUserIds) {
        if (recipientId.toString() !== req.user._id.toString()) {
          createNotification({
            recipient: recipientId,
            sender: req.user._id,
            type: "mention",
            message: `${req.user.name} mentioned you in a post`,
            relatedId: post._id
          });
        }
      }
    }

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name username profilePicture headline location")
      .populate("mentions", "name username profilePicture headline");

    // Real-time broadcast
    const io = global.io;
    if (io) {
      io.emit("new-post", { post: populatedPost });
    }

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
      data: {
        post: populatedPost
      }
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating post"
    });
  }
};

// ==========================================
// GET FEED
// ==========================================

const getFeed = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      filter = "all",
      hashtag,
      postType,
      search
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const itemsPerPage = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (currentPage - 1) * itemsPerPage;

    let feedFilter = {};

    let currentUser = null;
    let blockedIds = [];
    let connectionIds = [];
    let followingIds = [];

    if (req.user?._id) {
      currentUser = await User.findById(req.user._id).select(
        "connections following followers blockedUsers savedPosts"
      );

      if (currentUser) {
        blockedIds = (currentUser.blockedUsers || []).map((id) => id.toString());
        connectionIds = (currentUser.connections || []).map((id) => id.toString());
        followingIds = (currentUser.following || []).map((id) => id.toString());
      }
    }

    // Exclude posts from blocked users and users who blocked current user
    if (blockedIds.length > 0) {
      feedFilter.author = { $nin: blockedIds };
    }

    // Filter by network / following / saved / type
    if (filter === "saved" && currentUser) {
      feedFilter._id = { $in: currentUser.savedPosts || [] };
    } else if (filter === "network" && currentUser) {
      const allowedAuthors = [
        req.user._id,
        ...connectionIds,
        ...followingIds
      ];
      feedFilter.author = { $in: allowedAuthors };
    }

    // Hashtag filter
    if (hashtag) {
      const cleanTag = hashtag.replace("#", "").toLowerCase().trim();
      feedFilter.tags = cleanTag;
    }

    // Post type filter
    if (postType && postType !== "all") {
      feedFilter.postType = postType;
    }

    // Text search query
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      feedFilter.$or = [
        { content: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Visibility logic:
    // If user is not logged in: only public posts
    // If user is logged in: public OR (connections only AND author in connections) OR (followers only AND author in following) OR own posts
    if (!currentUser) {
      feedFilter.visibility = "public";
    } else {
      const visibilityConditions = [
        { visibility: "public" },
        { author: req.user._id }
      ];

      if (connectionIds.length > 0) {
        visibilityConditions.push({
          visibility: "connections",
          author: { $in: connectionIds }
        });
      }

      if (followingIds.length > 0) {
        visibilityConditions.push({
          visibility: "followers",
          author: { $in: followingIds }
        });
      }

      feedFilter.$and = feedFilter.$and || [];
      feedFilter.$and.push({ $or: visibilityConditions });
    }

    const [posts, totalPosts] = await Promise.all([
      Post.find(feedFilter)
        .populate("author", "name username profilePicture headline location")
        .populate("originalPost")
        .populate({
          path: "originalPost",
          populate: {
            path: "author",
            select: "name username profilePicture headline location"
          }
        })
        .populate("comments.user", "name username profilePicture headline")
        .populate("comments.replies.user", "name username profilePicture headline")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),

      Post.countDocuments(feedFilter)
    ]);

    const currentUserId = req.user?._id ? req.user._id.toString() : null;
    const savedPostSet = new Set((currentUser?.savedPosts || []).map((id) => id.toString()));

    const formattedPosts = posts.map((post) => {
      const postObject = post.toObject();

      postObject.likeCount = post.likes ? post.likes.length : 0;
      postObject.commentCount = post.comments
        ? post.comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0)
        : 0;

      postObject.isLiked = currentUserId
        ? (post.likes || []).some((id) => id.toString() === currentUserId)
        : false;

      postObject.isSaved = currentUserId
        ? savedPostSet.has(post._id.toString())
        : false;

      // Enhance comments with isLiked state
      if (postObject.comments && currentUserId) {
        postObject.comments = postObject.comments.map((c) => ({
          ...c,
          likeCount: (c.likes || []).length,
          isLiked: (c.likes || []).some((id) => id.toString() === currentUserId),
          replies: (c.replies || []).map((r) => ({
            ...r,
            likeCount: (r.likes || []).length,
            isLiked: (r.likes || []).some((id) => id.toString() === currentUserId)
          }))
        }));
      }

      return postObject;
    });

    res.status(200).json({
      success: true,
      posts: formattedPosts,
      data: {
        posts: formattedPosts,
        pagination: {
          currentPage,
          totalPages: Math.ceil(totalPosts / itemsPerPage),
          totalPosts,
          hasNextPage: currentPage * itemsPerPage < totalPosts
        }
      }
    });
  } catch (error) {
    console.error("Get Feed Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching feed"
    });
  }
};

// ==========================================
// GET SINGLE POST BY ID
// ==========================================

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID"
      });
    }

    const post = await Post.findById(id)
      .populate("author", "name username profilePicture headline location")
      .populate("originalPost")
      .populate({
        path: "originalPost",
        populate: {
          path: "author",
          select: "name username profilePicture headline location"
        }
      })
      .populate("comments.user", "name username profilePicture headline")
      .populate("comments.replies.user", "name username profilePicture headline");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const currentUserId = req.user?._id ? req.user._id.toString() : null;
    const postObject = post.toObject();

    postObject.likeCount = post.likes ? post.likes.length : 0;
    postObject.commentCount = post.comments ? post.comments.length : 0;
    postObject.isLiked = currentUserId
      ? (post.likes || []).some((uid) => uid.toString() === currentUserId)
      : false;

    res.status(200).json({
      success: true,
      data: {
        post: postObject
      }
    });
  } catch (error) {
    console.error("Get Post By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching post"
    });
  }
};

// ==========================================
// GET USER POSTS
// ==========================================

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const posts = await Post.find({
      author: userId
    })
      .populate("author", "name username profilePicture headline")
      .populate("originalPost")
      .populate({
        path: "originalPost",
        populate: {
          path: "author",
          select: "name username profilePicture headline"
        }
      })
      .populate("comments.user", "name username profilePicture")
      .populate("comments.replies.user", "name username profilePicture")
      .sort({ createdAt: -1 });

    const currentUserId = req.user?._id ? req.user._id.toString() : null;

    const formattedPosts = posts.map((post) => {
      const p = post.toObject();
      p.likeCount = post.likes ? post.likes.length : 0;
      p.commentCount = post.comments ? post.comments.length : 0;
      p.isLiked = currentUserId
        ? (post.likes || []).some((id) => id.toString() === currentUserId)
        : false;
      return p;
    });

    res.status(200).json({
      success: true,
      data: {
        posts: formattedPosts,
        total: formattedPosts.length
      }
    });
  } catch (error) {
    console.error("Get User Posts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user posts"
    });
  }
};

// ==========================================
// UPDATE POST
// ==========================================

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, postType, visibility } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID"
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own posts"
      });
    }

    if (content !== undefined) {
      post.content = content.trim();
      const { tags, mentionUserIds } = await extractHashtagsAndMentions(content);
      post.tags = tags;
      post.mentions = mentionUserIds;
    }

    if (postType) post.postType = postType;
    if (visibility) post.visibility = visibility;

    await post.save();

    const updated = await Post.findById(id)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name username profilePicture");

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: {
        post: updated
      }
    });
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating post"
    });
  }
};

// ==========================================
// LIKE / UNLIKE POST
// ==========================================

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const userId = req.user._id.toString();

    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    // Create notification when liked
    if (!alreadyLiked) {
      createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: "post_like",
        message: `${req.user.name} liked your post`,
        relatedId: post._id
      });
    }

    // Socket emission
    const io = global.io;
    if (io) {
      io.emit("post-like-updated", {
        postId: post._id,
        likeCount: post.likes.length,
        userId: req.user._id,
        isLiked: !alreadyLiked
      });
    }

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked" : "Post liked",
      data: {
        likeCount: post.likes.length,
        isLiked: !alreadyLiked
      }
    });
  } catch (error) {
    console.error("Like Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while liking post"
    });
  }
};

// ==========================================
// GET POST LIKES (USERS WHO LIKED)
// ==========================================

const getPostLikes = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "likes",
      "name username profilePicture headline location skills"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        likes: post.likes || [],
        total: (post.likes || []).length
      }
    });
  } catch (error) {
    console.error("Get Post Likes Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching post likes"
    });
  }
};

// ==========================================
// SHARE / REPOST
// ==========================================

const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentary = "" } = req.body;

    const original = await Post.findById(id);

    if (!original) {
      return res.status(404).json({
        success: false,
        message: "Original post not found"
      });
    }

    // Root original post in case of nested repost
    const rootPostId = original.originalPost || original._id;

    const repost = await Post.create({
      author: req.user._id,
      content: commentary.trim() || `Reposted from ${original.author}`,
      originalPost: rootPostId,
      repostCommentary: commentary.trim(),
      postType: "career_update",
      visibility: "public"
    });

    // Update original post share counter
    await Post.findByIdAndUpdate(rootPostId, {
      $inc: { repostCount: 1 },
      $addToSet: { shares: req.user._id }
    });

    // Notify original author
    createNotification({
      recipient: original.author,
      sender: req.user._id,
      type: "post_share",
      message: `${req.user.name} shared your post`,
      relatedId: repost._id
    });

    const populatedRepost = await Post.findById(repost._id)
      .populate("author", "name username profilePicture headline")
      .populate({
        path: "originalPost",
        populate: {
          path: "author",
          select: "name username profilePicture headline"
        }
      });

    res.status(201).json({
      success: true,
      message: "Post shared successfully",
      data: {
        post: populatedRepost
      }
    });
  } catch (error) {
    console.error("Share Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sharing post"
    });
  }
};

// ==========================================
// SAVE / UNSAVE POST
// ==========================================

const toggleSavePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.savedPosts = user.savedPosts || [];
    const postIndex = user.savedPosts.findIndex(
      (p) => p && p.toString() === id.toString()
    );

    let isSaved = false;
    if (postIndex === -1) {
      user.savedPosts.push(id);
      isSaved = true;
    } else {
      user.savedPosts.splice(postIndex, 1);
      isSaved = false;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isSaved ? "Post saved to your bookmarks" : "Post removed from bookmarks",
      data: {
        isSaved
      }
    });
  } catch (error) {
    console.error("Toggle Save Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving post"
    });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedPosts",
      populate: [
        { path: "author", select: "name username profilePicture headline location" },
        { path: "originalPost", populate: { path: "author", select: "name username profilePicture headline" } }
      ]
    });

    const posts = (user.savedPosts || []).filter(Boolean).map((p) => {
      const obj = p.toObject();
      obj.isSaved = true;
      obj.likeCount = p.likes ? p.likes.length : 0;
      obj.commentCount = p.comments ? p.comments.length : 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      data: {
        posts,
        total: posts.length
      }
    });
  } catch (error) {
    console.error("Get Saved Posts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching saved posts"
    });
  }
};

// ==========================================
// ADD COMMENT
// ==========================================

const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required"
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
      likes: [],
      replies: []
    });

    await post.save();

    // Create comment notification
    createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: "post_comment",
      message: `${req.user.name} commented on your post`,
      relatedId: post._id
    });

    // Check for mentions in comment
    const { mentionUserIds } = await extractHashtagsAndMentions(text);
    for (const mId of mentionUserIds) {
      if (mId.toString() !== req.user._id.toString()) {
        createNotification({
          recipient: mId,
          sender: req.user._id,
          type: "mention",
          message: `${req.user.name} mentioned you in a comment`,
          relatedId: post._id
        });
      }
    }

    const updatedPost = await Post.findById(post._id)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name username profilePicture headline")
      .populate("comments.replies.user", "name username profilePicture headline");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: {
        post: updatedPost
      }
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding comment"
    });
  }
};

// ==========================================
// EDIT COMMENT
// ==========================================

const editComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required"
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments"
      });
    }

    comment.text = text.trim();
    comment.isEdited = true;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: {
        comment
      }
    });
  } catch (error) {
    console.error("Edit Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while editing comment"
    });
  }
};

// ==========================================
// DELETE COMMENT
// ==========================================

const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // User can delete their own comment, or post author can delete comments on their post
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment"
      });
    }

    comment.deleteOne();
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting comment"
    });
  }
};

// ==========================================
// LIKE / UNLIKE COMMENT
// ==========================================

const likeComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const userId = req.user._id.toString();
    comment.likes = comment.likes || [];
    const alreadyLiked = comment.likes.some((uid) => uid.toString() === userId);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((uid) => uid.toString() !== userId);
    } else {
      comment.likes.push(req.user._id);
      createNotification({
        recipient: comment.user,
        sender: req.user._id,
        type: "comment_like",
        message: `${req.user.name} liked your comment`,
        relatedId: post._id
      });
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Comment unliked" : "Comment liked",
      data: {
        likeCount: comment.likes.length,
        isLiked: !alreadyLiked
      }
    });
  } catch (error) {
    console.error("Like Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while liking comment"
    });
  }
};

// ==========================================
// COMMENT REPLIES
// ==========================================

const addCommentReply = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply text is required"
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    comment.replies = comment.replies || [];
    comment.replies.push({
      user: req.user._id,
      text: text.trim(),
      likes: []
    });

    await post.save();

    // Notify comment author
    createNotification({
      recipient: comment.user,
      sender: req.user._id,
      type: "comment_reply",
      message: `${req.user.name} replied to your comment`,
      relatedId: post._id
    });

    const updatedPost = await Post.findById(id)
      .populate("comments.user", "name username profilePicture headline")
      .populate("comments.replies.user", "name username profilePicture headline");

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: {
        post: updatedPost
      }
    });
  } catch (error) {
    console.error("Add Reply Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while replying to comment"
    });
  }
};

const deleteCommentReply = async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found"
      });
    }

    if (
      reply.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this reply"
      });
    }

    reply.deleteOne();
    await post.save();

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully"
    });
  } catch (error) {
    console.error("Delete Reply Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting reply"
    });
  }
};

const likeCommentReply = async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found"
      });
    }

    const userId = req.user._id.toString();
    reply.likes = reply.likes || [];
    const alreadyLiked = reply.likes.some((uid) => uid.toString() === userId);

    if (alreadyLiked) {
      reply.likes = reply.likes.filter((uid) => uid.toString() !== userId);
    } else {
      reply.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Reply unliked" : "Reply liked",
      data: {
        likeCount: reply.likes.length,
        isLiked: !alreadyLiked
      }
    });
  } catch (error) {
    console.error("Like Reply Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while liking reply"
    });
  }
};

// ==========================================
// DELETE POST
// ==========================================

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts"
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting post"
    });
  }
};

// ==========================================
// HASHTAGS: TRENDING & SEARCH
// ==========================================

const getTrendingHashtags = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await Post.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const hashtags = result.map((r) => ({
      tag: r._id,
      count: r.count
    }));

    res.status(200).json({
      success: true,
      data: {
        hashtags
      }
    });
  } catch (error) {
    console.error("Get Trending Hashtags Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching trending hashtags"
    });
  }
};

const getPostsByHashtag = async (req, res) => {
  try {
    const { tag } = req.params;
    const cleanTag = String(tag).replace("#", "").toLowerCase().trim();

    const posts = await Post.find({
      tags: cleanTag,
      visibility: "public"
    })
      .populate("author", "name username profilePicture headline location")
      .populate("originalPost")
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: {
        tag: cleanTag,
        posts,
        total: posts.length
      }
    });
  } catch (error) {
    console.error("Get Posts By Hashtag Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching posts by hashtag"
    });
  }
};

module.exports = {
  createPost,
  getFeed,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  likePost,
  getPostLikes,
  sharePost,
  toggleSavePost,
  getSavedPosts,
  addComment,
  editComment,
  deleteComment,
  likeComment,
  addCommentReply,
  deleteCommentReply,
  likeCommentReply,
  getTrendingHashtags,
  getPostsByHashtag
};