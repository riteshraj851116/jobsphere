const Post = require("../models/Post");
const Connection = require("../models/Connection");
const createNotification = require("../utils/createNotification");


// ==========================================
// CREATE POST
// ==========================================

const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let image = "";

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post content is required"
      });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      image: image
    });

    const populatedPost =
      await Post.findById(post._id)
        .populate(
          "author",
          "name username profilePicture headline"
        );

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
      data: {
        post: populatedPost
      }
    });

  } catch (error) {
    console.error(
      "Create Post Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating post"
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
      limit = 10
    } = req.query;

    const currentPage = Math.max(
      Number(page),
      1
    );

    const itemsPerPage = Math.min(
      Math.max(Number(limit), 1),
      50
    );

    const skip =
      (currentPage - 1) *
      itemsPerPage;

    const connections =
      await Connection.find({
        $or: [
          {
            sender: req.user._id,
            status: "accepted"
          },
          {
            receiver: req.user._id,
            status: "accepted"
          }
        ]
      });

    const connectionIds =
      connections.map((connection) => {
        if (
          connection.sender.toString() ===
          req.user._id.toString()
        ) {
          return connection.receiver;
        }

        return connection.sender;
      });

    const feedUserIds = [
      req.user._id,
      ...connectionIds
    ];

    const [
      posts,
      totalPosts
    ] = await Promise.all([
      Post.find({
        author: {
          $in: feedUserIds
        }
      })
        .populate(
          "author",
          "name username profilePicture headline"
        )
        .populate(
          "comments.user",
          "name username profilePicture"
        )
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(itemsPerPage),

      Post.countDocuments({
        author: {
          $in: feedUserIds
        }
      })
    ]);

    const formattedPosts =
      posts.map((post) => {
        const postObject =
          post.toObject();

        postObject.likeCount =
          post.likes.length;

        postObject.commentCount =
          post.comments.length;

        postObject.isLiked =
          post.likes.some(
            (id) =>
              id.toString() ===
              req.user._id.toString()
          );

        return postObject;
      });

    res.status(200).json({
      success: true,
      posts: formattedPosts,
      data: {
        posts: formattedPosts,
        pagination: {
          currentPage,
          totalPages: Math.ceil(
            totalPosts /
              itemsPerPage
          ),
          totalPosts,
          hasNextPage:
            currentPage * itemsPerPage <
            totalPosts
        }
      }
    });

  } catch (error) {
    console.error(
      "Get Feed Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching feed"
    });
  }
};


// ==========================================
// GET USER POSTS
// ==========================================

const getUserPosts = async (req, res) => {
  try {
    const posts =
      await Post.find({
        author: req.params.userId
      })
        .populate(
          "author",
          "name username profilePicture headline"
        )
        .populate(
          "comments.user",
          "name username profilePicture"
        )
        .sort({
          createdAt: -1
        });

    res.status(200).json({
      success: true,
      data: {
        posts
      }
    });

  } catch (error) {
    console.error(
      "Get User Posts Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching user posts"
    });
  }
};


// ==========================================
// LIKE / UNLIKE POST
// ==========================================

const likePost = async (req, res) => {
  try {
    const post =
      await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const userId =
      req.user._id.toString();

    const alreadyLiked =
      post.likes.some(
        (id) =>
          id.toString() === userId
      );

    if (alreadyLiked) {
      post.likes =
        post.likes.filter(
          (id) =>
            id.toString() !== userId
        );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    // Create notification when liked
    if (!alreadyLiked) {
      await createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: "post_like",
        message: `${req.user.name} liked your post`,
        relatedId: post._id
      });
    }

    res.status(200).json({
      success: true,
      message: alreadyLiked
        ? "Post unliked"
        : "Post liked",
      data: {
        likeCount: post.likes.length,
        isLiked: !alreadyLiked
      }
    });

  } catch (error) {
    console.error(
      "Like Post Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while liking post"
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

    const post =
      await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim()
    });

    await post.save();

    // Create comment notification
    await createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: "post_comment",
      message: `${req.user.name} commented on your post`,
      relatedId: post._id
    });

    const updatedPost =
      await Post.findById(post._id)
        .populate(
          "author",
          "name username profilePicture headline"
        )
        .populate(
          "comments.user",
          "name username profilePicture"
        );

    res.status(201).json({
      success: true,
      message:
        "Comment added successfully",
      data: {
        post: updatedPost
      }
    });

  } catch (error) {
    console.error(
      "Add Comment Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while adding comment"
    });
  }
};


// ==========================================
// DELETE POST
// ==========================================

const deletePost = async (req, res) => {
  try {
    const post =
      await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    if (
      post.author.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own posts"
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Post deleted successfully"
    });

  } catch (error) {
    console.error(
      "Delete Post Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while deleting post"
    });
  }
};


// ==========================================
// DELETE COMMENT
// ==========================================

const deleteComment = async (req, res) => {
  try {
    const post =
      await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const comment =
      post.comments.id(
        req.params.commentId
      );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    if (
      comment.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own comments"
      });
    }

    comment.deleteOne();

    await post.save();

    res.status(200).json({
      success: true,
      message:
        "Comment deleted successfully"
    });

  } catch (error) {
    console.error(
      "Delete Comment Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while deleting comment"
    });
  }
};


module.exports = {
  createPost,
  getFeed,
  getUserPosts,
  likePost,
  addComment,
  deletePost,
  deleteComment
};