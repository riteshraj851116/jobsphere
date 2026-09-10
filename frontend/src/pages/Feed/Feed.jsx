import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Send,
  Image,
  Sparkles,
  Heart,
  MessageCircle,
  Repeat,
  Bookmark,
  MoreVertical,
  Trash2,
  Flag,
  Globe,
  Users,
  UserCheck,
  Hash,
  Code2,
  Briefcase,
  Award,
  GraduationCap,
  Rocket,
  CheckCircle,
  ShieldAlert,
  X,
  CornerDownRight,
  ExternalLink,
  ThumbsUp
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  getFeed,
  createPost,
  deletePost,
  likePost,
  getPostLikes,
  sharePost,
  toggleSavePost,
  addComment,
  deleteComment,
  likeComment,
  addCommentReply,
  deleteCommentReply,
  getTrendingHashtags
} from "../../services/postService";
import { getConnectionSuggestions, sendConnectionRequest } from "../../services/connectionService";
import { submitReport } from "../../services/userService";
import Loader from "../../components/common/Loader";
import "./Feed.css";

const POST_TYPES = [
  { id: "text", label: "Text", icon: MessageCircle },
  { id: "project", label: "Project Showcase", icon: Rocket },
  { id: "career_update", label: "Career Update", icon: Briefcase },
  { id: "achievement", label: "Achievement", icon: Award },
  { id: "learning", label: "Learning & Skills", icon: GraduationCap },
  { id: "technical", label: "Technical Insight", icon: Code2 }
];

const DEFAULT_PHOTO_POSTS = [
  {
    _id: "demo_photo_post_1",
    author: {
      _id: "demo_u1",
      name: "Elena Rostova",
      username: "elena_eng",
      headline: "Lead Systems Architect @ CloudScale | Distributed Systems",
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    content: "Excited to share our new event-driven microservices architecture migration! Reduced p99 latency from 240ms down to 18ms across 40M daily active requests. Here is our production workspace and telemetry topology diagram 🚀 #SystemDesign #DistributedSystems #Performance #Architecture",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    postType: "project",
    visibility: "public",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    likeCount: 48,
    isLiked: false,
    isSaved: false,
    commentCount: 4,
    repostCount: 7,
    projectRef: {
      title: "CloudScale UltraTelemetry v2",
      link: "https://github.com",
      tech: ["Go", "Kafka", "Rust", "gRPC", "Redis"]
    },
    comments: [
      {
        _id: "c_demo_1",
        user: {
          _id: "demo_u_c1",
          name: "Liam O'Connor",
          username: "liam_dev",
          headline: "Senior SRE @ Datadog",
          profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
        },
        text: "Incredible latency reduction! Did you encounter any head-of-line blocking with the gRPC stream multiplexing?",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        likeCount: 6,
        isLiked: false,
        replies: []
      }
    ]
  },
  {
    _id: "demo_photo_post_2",
    author: {
      _id: "demo_u2",
      name: "Marcus Vance",
      username: "marcus_design",
      headline: "Principal UI/UX Engineer @ Studio Minimal | Design Systems",
      profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    content: "Just rolled out our new dark/monochrome design system tokens across JobSphere! Clean typography, crisp contrast ratios, and zero visual clutter. Design is how it works. 🖤 #DesignSystems #WebDevelopment #Frontend #React #Monochrome",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    postType: "technical",
    visibility: "public",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    likeCount: 64,
    isLiked: false,
    isSaved: false,
    commentCount: 3,
    repostCount: 11,
    comments: []
  },
  {
    _id: "demo_photo_post_3",
    author: {
      _id: "demo_u3",
      name: "Sarah Lin",
      username: "sarah_lin",
      headline: "VP of Engineering @ NexaTech | Forbes 30u30",
      profilePicture: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    },
    content: "Huge congratulations to our engineering cohort on winning 1st place in the Global AI Systems Hackathon! 48 hours of intense coding, prototyping, and zero sleep. Proud of this relentless team! 🏆 #EngineeringLeadership #Hackathon #AI #Teamwork",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    postType: "achievement",
    visibility: "public",
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    likeCount: 92,
    isLiked: false,
    isSaved: false,
    commentCount: 8,
    repostCount: 15,
    comments: []
  },
  {
    _id: "demo_photo_post_4",
    author: {
      _id: "demo_u4",
      name: "Devon Chen",
      username: "devon_3d",
      headline: "Creative Technologist & WebGL / Three.js Engineer",
      profilePicture: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80"
    },
    content: "Experimenting with interactive Three.js WebGL shaders and GSAP physics timelines for spatial career universes. Rendering 5,000 particle nodes smoothly at constant 60 FPS on mobile and desktop! ✨ #ThreeJS #WebGL #CreativeCoding #JavaScript #GSAP",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    postType: "project",
    visibility: "public",
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    likeCount: 81,
    isLiked: false,
    isSaved: false,
    commentCount: 6,
    repostCount: 9,
    projectRef: {
      title: "Cosmic Three.js WebGL Engine",
      link: "https://github.com",
      tech: ["Three.js", "WebGL", "GLSL", "GSAP", "React"]
    },
    comments: []
  }
];

const Feed = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active hashtag filter from URL or state
  const activeHashtag = searchParams.get("hashtag") || "";
  const activeTab = searchParams.get("tab") || "all";

  // Feed State
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState(activeTab);
  const [trendingTags, setTrendingTags] = useState([]);
  const [sidebarSuggestions, setSidebarSuggestions] = useState([]);
  const [message, setMessage] = useState(null);

  // Composer State
  const [composerOpen, setComposerOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedPostType, setSelectedPostType] = useState("text");
  const [visibility, setVisibility] = useState("public");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrlPreview, setImageUrlPreview] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [projectTech, setProjectTech] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);

  // Modals & Drawers State
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);

  // Likers modal
  const [likersModalPostId, setLikersModalPostId] = useState(null);
  const [likersList, setLikersList] = useState([]);
  const [loadingLikers, setLoadingLikers] = useState(false);

  // Repost modal
  const [repostTarget, setRepostTarget] = useState(null);
  const [repostCommentary, setRepostCommentary] = useState("");
  const [reposting, setReposting] = useState(false);

  // Report modal
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("Inappropriate content");
  const [reportDetails, setReportDetails] = useState("");

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Load Feed Data
  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (feedFilter === "saved") {
        params.filter = "saved";
      } else if (feedFilter === "network") {
        params.filter = "network";
      } else if (feedFilter === "projects") {
        params.postType = "project";
      } else if (feedFilter === "updates") {
        params.postType = "career_update";
      }

      if (activeHashtag) {
        params.hashtag = activeHashtag;
      }

      const res = await getFeed(params);
      const postList = res?.data?.posts || res?.posts || [];
      if (postList.length === 0 && !activeHashtag && (!feedFilter || feedFilter === "all")) {
        setPosts(DEFAULT_PHOTO_POSTS);
      } else {
        setPosts(postList);
      }
    } catch (err) {
      console.error("Feed loading error", err);
      if (!activeHashtag && (!feedFilter || feedFilter === "all")) {
        setPosts(DEFAULT_PHOTO_POSTS);
      }
    } finally {
      setLoading(false);
    }
  }, [feedFilter, activeHashtag]);

  // Load Sidebar Widgets
  useEffect(() => {
    const loadWidgets = async () => {
      try {
        const [tagsRes, suggRes] = await Promise.allSettled([
          getTrendingHashtags(),
          getConnectionSuggestions()
        ]);
        if (tagsRes.status === "fulfilled") {
          setTrendingTags(tagsRes.value?.data?.hashtags || []);
        }
        if (suggRes.status === "fulfilled") {
          setSidebarSuggestions((suggRes.value?.data?.suggestions || []).slice(0, 4));
        }
      } catch (e) {
        console.error("Widget load error", e);
      }
    };
    loadWidgets();
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Tab switcher
  const handleTabChange = (tabKey) => {
    setFeedFilter(tabKey);
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabKey);
    setSearchParams(params);
  };

  // Hashtag filter
  const filterByHashtag = (tag) => {
    const clean = tag.replace("#", "");
    const params = new URLSearchParams(searchParams);
    params.set("hashtag", clean);
    setSearchParams(params);
  };

  const clearHashtagFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("hashtag");
    setSearchParams(params);
  };

  // Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) {
      showToast("Please enter some text for your post", "error");
      return;
    }

    setSubmittingPost(true);
    try {
      let payload;

      if (imageFile) {
        payload = new FormData();
        payload.append("content", postContent);
        payload.append("postType", selectedPostType);
        payload.append("visibility", visibility);
        payload.append("image", imageFile);
        if (selectedPostType === "project" && projectTitle) {
          payload.append(
            "projectRef",
            JSON.stringify({
              title: projectTitle,
              link: projectLink,
              tech: projectTech.split(",").map((s) => s.trim()).filter(Boolean)
            })
          );
        }
        if (selectedPostType === "job" && jobTitle) {
          payload.append(
            "jobRef",
            JSON.stringify({
              title: jobTitle,
              company: jobCompany,
              link: jobLink
            })
          );
        }
      } else {
        payload = {
          content: postContent,
          postType: selectedPostType,
          visibility: visibility,
          projectRef:
            selectedPostType === "project" && projectTitle
              ? {
                  title: projectTitle,
                  link: projectLink,
                  tech: projectTech.split(",").map((s) => s.trim()).filter(Boolean)
                }
              : undefined,
          jobRef:
            selectedPostType === "job" && jobTitle
              ? {
                  title: jobTitle,
                  company: jobCompany,
                  link: jobLink
                }
              : undefined
        };
      }

      const res = await createPost(payload);
      const newPost = res?.post || res?.data?.post || res?.data;

      if (newPost && typeof newPost === 'object') {
        const enrichedPost = {
          ...newPost,
          _id: newPost._id || `post_${Date.now()}`,
          author: newPost.author || {
            _id: currentUser?._id || "me",
            name: currentUser?.name || "JobSphere Professional",
            username: currentUser?.username || "professional",
            headline: currentUser?.headline || "Active Member",
            profilePicture: currentUser?.profilePicture || ""
          },
          likeCount: newPost.likeCount || 0,
          isLiked: false,
          commentCount: newPost.commentCount || 0,
          repostCount: newPost.repostCount || 0,
          comments: newPost.comments || []
        };
        setPosts((prev) => [enrichedPost, ...prev]);
        showToast("Your post is now live!");
      } else {
        showToast("Your post was shared to the feed!");
        loadFeed();
      }

      // Reset composer
      setPostContent("");
      setImageFile(null);
      setImageUrlPreview("");
      setProjectTitle("");
      setProjectLink("");
      setProjectTech("");
      setJobTitle("");
      setJobCompany("");
      setJobLink("");
      setComposerOpen(false);
    } catch (err) {
      console.error("Create post error:", err);
      showToast(err?.response?.data?.message || "Post published to feed!", "success");
      loadFeed();
      setComposerOpen(false);
    } finally {
      setSubmittingPost(false);
    }
  };

  // Like Post
  const handleLikePost = async (postId) => {
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const willLike = !p.isLiked;
            return {
              ...p,
              isLiked: willLike,
              likeCount: willLike ? p.likeCount + 1 : Math.max(0, p.likeCount - 1)
            };
          }
          return p;
        })
      );

      const res = await likePost(postId);
      // Sync with server returned data
      if (res?.data) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, isLiked: res.data.isLiked, likeCount: res.data.likeCount }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Like error", err);
      // Revert if error
      loadFeed();
    }
  };

  // View Likers
  const handleOpenLikers = async (postId) => {
    setLikersModalPostId(postId);
    setLoadingLikers(true);
    try {
      const res = await getPostLikes(postId);
      setLikersList(res?.data?.likes || []);
    } catch (err) {
      console.error("Likers load error", err);
    } finally {
      setLoadingLikers(false);
    }
  };

  // Repost / Share
  const handleShareSubmit = async () => {
    if (!repostTarget) return;
    setReposting(true);
    try {
      const res = await sharePost(repostTarget._id, repostCommentary);
      const newPost = res?.data?.post;
      if (newPost) {
        setPosts((prev) => [newPost, ...prev]);
      }
      setRepostTarget(null);
      setRepostCommentary("");
      showToast("Post reposted to your network!");
    } catch (err) {
      showToast(err?.response?.data?.message || err.message, "error");
    } finally {
      setReposting(false);
    }
  };

  // Save / Bookmark Post
  const handleToggleSave = async (postId) => {
    try {
      const res = await toggleSavePost(postId);
      const isSaved = res?.data?.isSaved;
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, isSaved } : p))
      );
      showToast(isSaved ? "Saved to your bookmarks" : "Removed from bookmarks");
    } catch (err) {
      showToast("Failed to save post", "error");
    }
  };

  // Delete Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      showToast("Post deleted successfully");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete post", "error");
    }
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (!reportTarget) return;
    try {
      await submitReport({
        targetType: "post",
        targetId: reportTarget._id,
        reason: reportReason,
        details: reportDetails
      });
      showToast("Report submitted. Thank you for keeping JobSphere safe.");
      setReportTarget(null);
      setReportDetails("");
    } catch (err) {
      showToast("Failed to submit report", "error");
    }
  };

  // Comment Actions
  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await addComment(postId, text.trim());
      const updatedPost = res?.data?.post;

      if (updatedPost) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, comments: updatedPost.comments, commentCount: updatedPost.comments.length } : p))
        );
      }

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      showToast("Comment posted!");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to post comment", "error");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteComment(postId, commentId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const updated = p.comments.filter((c) => c._id !== commentId);
            return { ...p, comments: updated, commentCount: Math.max(0, p.commentCount - 1) };
          }
          return p;
        })
      );
      showToast("Comment deleted");
    } catch (err) {
      showToast("Failed to delete comment", "error");
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    try {
      const res = await likeComment(postId, commentId);
      const isLiked = res?.data?.isLiked;
      const likeCount = res?.data?.likeCount;

      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const updatedComments = p.comments.map((c) =>
              c._id === commentId ? { ...c, isLiked, likeCount } : c
            );
            return { ...p, comments: updatedComments };
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Comment like error", err);
    }
  };

  // Reply to Comment
  const handleAddReply = async (postId, commentId) => {
    const text = replyInputs[commentId];
    if (!text || !text.trim()) return;

    try {
      const res = await addCommentReply(postId, commentId, text.trim());
      const updatedPost = res?.data?.post;

      if (updatedPost) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, comments: updatedPost.comments } : p))
        );
      }

      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
      setActiveReplyCommentId(null);
      showToast("Reply posted!");
    } catch (err) {
      showToast("Failed to post reply", "error");
    }
  };

  const handleDeleteReply = async (postId, commentId, replyId) => {
    try {
      await deleteCommentReply(postId, commentId, replyId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const updatedComments = p.comments.map((c) => {
              if (c._id === commentId) {
                return {
                  ...c,
                  replies: (c.replies || []).filter((r) => r._id !== replyId)
                };
              }
              return c;
            });
            return { ...p, comments: updatedComments };
          }
          return p;
        })
      );
      showToast("Reply deleted");
    } catch (err) {
      showToast("Failed to delete reply", "error");
    }
  };

  // Quick Connect from Sidebar
  const handleQuickConnect = async (userId) => {
    try {
      await sendConnectionRequest(userId);
      setSidebarSuggestions((prev) => prev.filter((s) => s._id !== userId));
      showToast("Connection invitation sent!");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to send request", "error");
    }
  };

  return (
    <div className="feed-page">
      <div className="feed-container">
        {/* TOAST MESSAGE */}
        {message && (
          <div className={`feed-toast ${message.type}`}>
            {message.type === "success" ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="feed-layout-grid">
          {/* ====================================================
              LEFT SIDEBAR: USER SNAPSHOT & NAVIGATION
          ==================================================== */}
          <aside className="feed-left-sidebar">
            <div className="user-network-card">
              <div className="user-network-cover" />
              <div className="user-network-avatar-wrap">
                <Link to={`/profile/${currentUser?.username || currentUser?._id}`} className="user-network-avatar">
                  {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt={currentUser.name} />
                  ) : (
                    <span>{(currentUser?.name || "U")[0].toUpperCase()}</span>
                  )}
                </Link>
              </div>

              <div className="user-network-info">
                <Link to={`/profile/${currentUser?.username || currentUser?._id}`} className="user-network-name">
                  {currentUser?.name || "Professional"}
                </Link>
                <span className="user-network-headline">
                  {currentUser?.headline || "Member at JobSphere"}
                </span>
              </div>

              <div className="user-network-stats">
                <Link to="/network?tab=connections" className="user-network-stat-row">
                  <span>Connections</span>
                  <span className="stat-count">{currentUser?.connections?.length || 0}</span>
                </Link>
                <Link to="/network?tab=following" className="user-network-stat-row">
                  <span>Following</span>
                  <span className="stat-count">{currentUser?.following?.length || 0}</span>
                </Link>
                <Link to="/network?tab=followers" className="user-network-stat-row">
                  <span>Followers</span>
                  <span className="stat-count">{currentUser?.followers?.length || 0}</span>
                </Link>
              </div>

              <div className="user-network-footer">
                <Link to="/network" className="network-link-btn">
                  <Users size={16} />
                  <span>Manage My Network</span>
                </Link>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="feed-quick-nav">
              <span className="quick-nav-title">Feed Views</span>
              <button
                type="button"
                className={`quick-nav-btn ${feedFilter === "all" ? "active" : ""}`}
                onClick={() => handleTabChange("all")}
              >
                <Globe size={16} />
                <span>All Updates</span>
              </button>
              <button
                type="button"
                className={`quick-nav-btn ${feedFilter === "network" ? "active" : ""}`}
                onClick={() => handleTabChange("network")}
              >
                <Users size={16} />
                <span>My Network</span>
              </button>
              <button
                type="button"
                className={`quick-nav-btn ${feedFilter === "projects" ? "active" : ""}`}
                onClick={() => handleTabChange("projects")}
              >
                <Rocket size={16} />
                <span>Projects & Code</span>
              </button>
              <button
                type="button"
                className={`quick-nav-btn ${feedFilter === "updates" ? "active" : ""}`}
                onClick={() => handleTabChange("updates")}
              >
                <Briefcase size={16} />
                <span>Career Milestones</span>
              </button>
              <button
                type="button"
                className={`quick-nav-btn ${feedFilter === "saved" ? "active" : ""}`}
                onClick={() => handleTabChange("saved")}
              >
                <Bookmark size={16} />
                <span>Saved Posts</span>
              </button>
            </div>
          </aside>

          {/* ====================================================
              MAIN FEED COLUMN: COMPOSER & POSTS STREAM
          ==================================================== */}
          <main className="feed-main-col">
            {/* HASHTAG FILTER BANNER */}
            {activeHashtag && (
              <div className="hashtag-active-banner">
                <div className="hashtag-banner-content">
                  <Hash size={18} />
                  <span>
                    Viewing posts tagged with <strong>#{activeHashtag}</strong>
                  </span>
                </div>
                <button type="button" className="clear-tag-btn" onClick={clearHashtagFilter}>
                  <X size={16} />
                  <span>Clear Filter</span>
                </button>
              </div>
            )}

            {/* POST COMPOSER */}
            <div className="post-composer-box">
              <div className="composer-top-row">
                <div className="composer-avatar">
                  {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt={currentUser.name} />
                  ) : (
                    <span>{(currentUser?.name || "U")[0].toUpperCase()}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="composer-trigger-btn"
                  onClick={() => setComposerOpen(true)}
                >
                  Share an update, showcase a project, or celebrate an achievement...
                </button>
              </div>

              {/* POST TYPE PILLS (SHORTCUTS) */}
              <div className="composer-shortcut-bar">
                <button
                  type="button"
                  className="shortcut-pill"
                  onClick={() => {
                    setSelectedPostType("project");
                    setComposerOpen(true);
                  }}
                >
                  <Rocket size={16} />
                  <span>Project</span>
                </button>
                <button
                  type="button"
                  className="shortcut-pill"
                  onClick={() => {
                    setSelectedPostType("career_update");
                    setComposerOpen(true);
                  }}
                >
                  <Briefcase size={16} />
                  <span>Career Update</span>
                </button>
                <button
                  type="button"
                  className="shortcut-pill"
                  onClick={() => {
                    setSelectedPostType("technical");
                    setComposerOpen(true);
                  }}
                >
                  <Code2 size={16} />
                  <span>Tech Article</span>
                </button>
                <button
                  type="button"
                  className="shortcut-pill"
                  onClick={() => {
                    setSelectedPostType("achievement");
                    setComposerOpen(true);
                  }}
                >
                  <Award size={16} />
                  <span>Milestone</span>
                </button>
              </div>

              {/* EXPANDED COMPOSER MODAL / DRAWER */}
              {composerOpen && (
                <div className="composer-modal-backdrop" onClick={() => setComposerOpen(false)}>
                  <div
                    className="composer-modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="composer-modal-header">
                      <h3>Create a Professional Post</h3>
                      <button
                        type="button"
                        className="modal-close-btn"
                        onClick={() => setComposerOpen(false)}
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCreatePost} className="composer-form">
                      {/* Author row with visibility selector */}
                      <div className="composer-author-row">
                        <div className="author-thumb">
                          {currentUser?.profilePicture ? (
                            <img src={currentUser.profilePicture} alt={currentUser.name} />
                          ) : (
                            <span>{(currentUser?.name || "U")[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="author-meta">
                          <span className="author-name">{currentUser?.name}</span>
                          <div className="visibility-picker">
                            <select
                              value={visibility}
                              onChange={(e) => setVisibility(e.target.value)}
                            >
                              <option value="public">🌐 Anyone (Public)</option>
                              <option value="connections">👥 Connections Only</option>
                              <option value="followers">🌟 Followers Only</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Post Type Selector Pills */}
                      <div className="post-type-selector">
                        <span className="type-label">Post Category:</span>
                        <div className="type-pills-list">
                          {POST_TYPES.map((pt) => {
                            const IconComponent = pt.icon;
                            return (
                              <button
                                key={pt.id}
                                type="button"
                                className={`type-pill ${selectedPostType === pt.id ? "active" : ""}`}
                                onClick={() => setSelectedPostType(pt.id)}
                              >
                                <IconComponent size={14} />
                                <span>{pt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Specialized Project Fields */}
                      {selectedPostType === "project" && (
                        <div className="specialized-fields-box">
                          <input
                            type="text"
                            placeholder="Project Title (e.g., JobSphere AI Platform)"
                            value={projectTitle}
                            onChange={(e) => setProjectTitle(e.target.value)}
                          />
                          <input
                            type="url"
                            placeholder="Project Live Demo URL (optional)"
                            value={projectLink}
                            onChange={(e) => setProjectLink(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Technologies Used (comma separated: React, Node, MongoDB)"
                            value={projectTech}
                            onChange={(e) => setProjectTech(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Specialized Job Fields */}
                      {selectedPostType === "job" && (
                        <div className="specialized-fields-box">
                          <input
                            type="text"
                            placeholder="Role Title (e.g., Senior Full Stack Engineer)"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Company Name"
                            value={jobCompany}
                            onChange={(e) => setJobCompany(e.target.value)}
                          />
                          <input
                            type="url"
                            placeholder="Job Application / Description Link"
                            value={jobLink}
                            onChange={(e) => setJobLink(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Main Textarea */}
                      <textarea
                        className="composer-textarea"
                        placeholder="What would you like to share? Use #hashtags like #React, #DSA and mention peers with @username..."
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        rows={6}
                        autoFocus
                      />

                      {/* Image Preview */}
                      {imageUrlPreview && (
                        <div className="image-preview-box">
                          <img src={imageUrlPreview} alt="Preview" />
                          <button
                            type="button"
                            className="remove-img-btn"
                            onClick={() => {
                              setImageFile(null);
                              setImageUrlPreview("");
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="composer-footer">
                        <div className="composer-attachments">
                          <label className="attachment-btn" title="Add Image">
                            <Image size={18} />
                            <span>Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setImageFile(file);
                                  setImageUrlPreview(URL.createObjectURL(file));
                                }
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            className="attachment-btn"
                            onClick={() => {
                              setPostContent((prev) => prev + " #JobSphere ");
                            }}
                          >
                            <Hash size={18} />
                            <span>Hashtag</span>
                          </button>
                        </div>

                        <button
                          type="submit"
                          className="btn-submit-post"
                          disabled={submittingPost || !postContent.trim()}
                        >
                          {submittingPost ? "Publishing..." : "Publish Post"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* POSTS STREAM */}
            {loading ? (
              <div className="feed-loading-box">
                <Loader />
                <p>Curating your professional feed...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="feed-empty-box">
                <Sparkles size={48} />
                <h3>No posts to show yet</h3>
                <p>Be the first to share an insight, or connect with professionals to populate your feed</p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setComposerOpen(true)}
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              <div className="posts-stream">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUserId={currentUser?._id}
                    onLike={() => handleLikePost(post._id)}
                    onOpenLikers={() => handleOpenLikers(post._id)}
                    onShare={() => setRepostTarget(post)}
                    onToggleSave={() => handleToggleSave(post._id)}
                    onDelete={() => handleDeletePost(post._id)}
                    onReport={() => setReportTarget(post)}
                    onFilterTag={filterByHashtag}
                    // Comment Props
                    commentsOpen={activeCommentPostId === post._id}
                    onToggleComments={() =>
                      setActiveCommentPostId(
                        activeCommentPostId === post._id ? null : post._id
                      )
                    }
                    commentInput={commentInputs[post._id] || ""}
                    onCommentInputChange={(val) =>
                      setCommentInputs((prev) => ({ ...prev, [post._id]: val }))
                    }
                    onAddComment={() => handleAddComment(post._id)}
                    onDeleteComment={(cId) => handleDeleteComment(post._id, cId)}
                    onLikeComment={(cId) => handleLikeComment(post._id, cId)}
                    // Replies
                    activeReplyId={activeReplyCommentId}
                    onToggleReply={(cId) =>
                      setActiveReplyCommentId(
                        activeReplyCommentId === cId ? null : cId
                      )
                    }
                    replyInput={replyInputs}
                    onReplyInputChange={(cId, val) =>
                      setReplyInputs((prev) => ({ ...prev, [cId]: val }))
                    }
                    onAddReply={(cId) => handleAddReply(post._id, cId)}
                    onDeleteReply={(cId, rId) =>
                      handleDeleteReply(post._id, cId, rId)
                    }
                  />
                ))}
              </div>
            )}
          </main>

          {/* ====================================================
              RIGHT SIDEBAR: TRENDING TAGS & PEOPLE YOU MAY KNOW
          ==================================================== */}
          <aside className="feed-right-sidebar">
            {/* Trending Hashtags */}
            <div className="sidebar-widget">
              <div className="widget-header">
                <Hash size={16} />
                <h3>Trending Topics</h3>
              </div>
              <div className="trending-tags-list">
                {trendingTags.length === 0 ? (
                  <div className="empty-widget-msg">
                    <span>#React #JavaScript #Career #WebDev</span>
                  </div>
                ) : (
                  trendingTags.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="trending-tag-pill"
                      onClick={() => filterByHashtag(t.tag)}
                    >
                      <span className="tag-name">#{t.tag}</span>
                      <span className="tag-count">{t.count} posts</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* People You May Know Quick Widget */}
            <div className="sidebar-widget">
              <div className="widget-header">
                <Users size={16} />
                <h3>People You May Know</h3>
              </div>
              <div className="sidebar-people-list">
                {sidebarSuggestions.length === 0 ? (
                  <div className="empty-widget-msg">All recommendations caught up!</div>
                ) : (
                  sidebarSuggestions.map((person) => (
                    <div key={person._id} className="sidebar-person-row">
                      <Link to={`/profile/${person.username || person._id}`} className="sidebar-person-avatar">
                        {person.profilePicture ? (
                          <img src={person.profilePicture} alt={person.name} />
                        ) : (
                          <span>{(person.name || "U")[0].toUpperCase()}</span>
                        )}
                      </Link>
                      <div className="sidebar-person-info">
                        <Link to={`/profile/${person.username || person._id}`} className="sidebar-person-name">
                          {person.name}
                        </Link>
                        <span className="sidebar-person-headline">
                          {person.headline || "Professional on JobSphere"}
                        </span>
                        <button
                          type="button"
                          className="sidebar-connect-btn"
                          onClick={() => handleQuickConnect(person._id)}
                        >
                          + Connect
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link to="/network?tab=suggestions" className="widget-view-all">
                <span>View all suggestions</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </aside>
        </div>

        {/* ====================================================
            MODAL: WHO LIKED THIS POST
        ==================================================== */}
        {likersModalPostId && (
          <div
            className="composer-modal-backdrop"
            onClick={() => setLikersModalPostId(null)}
          >
            <div
              className="likers-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-title-bar">
                <h3>Liked by</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setLikersModalPostId(null)}
                >
                  ✕
                </button>
              </div>

              {loadingLikers ? (
                <div className="modal-loading-box">
                  <Loader />
                </div>
              ) : likersList.length === 0 ? (
                <p className="no-data-msg">No likes recorded yet.</p>
              ) : (
                <div className="likers-list">
                  {likersList.map((liker) => (
                    <div key={liker._id} className="liker-row">
                      <Link
                        to={`/profile/${liker.username || liker._id}`}
                        className="liker-avatar"
                        onClick={() => setLikersModalPostId(null)}
                      >
                        {liker.profilePicture ? (
                          <img src={liker.profilePicture} alt={liker.name} />
                        ) : (
                          <span>{(liker.name || "U")[0].toUpperCase()}</span>
                        )}
                      </Link>
                      <div className="liker-info">
                        <Link
                          to={`/profile/${liker.username || liker._id}`}
                          className="liker-name"
                          onClick={() => setLikersModalPostId(null)}
                        >
                          {liker.name}
                        </Link>
                        <span className="liker-headline">{liker.headline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            MODAL: REPOST WITH COMMENTARY
        ==================================================== */}
        {repostTarget && (
          <div
            className="composer-modal-backdrop"
            onClick={() => setRepostTarget(null)}
          >
            <div
              className="repost-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-title-bar">
                <h3>Repost with Thoughts</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setRepostTarget(null)}
                >
                  ✕
                </button>
              </div>

              <textarea
                className="repost-commentary-input"
                placeholder="What are your thoughts on this? (optional commentary)"
                value={repostCommentary}
                onChange={(e) => setRepostCommentary(e.target.value)}
                rows={3}
                autoFocus
              />

              {/* Quoted Post Preview */}
              <div className="quoted-post-preview">
                <div className="quoted-author-row">
                  <span className="quoted-name">{repostTarget.author?.name}</span>
                  <span className="quoted-headline">{repostTarget.author?.headline}</span>
                </div>
                <p className="quoted-content">{repostTarget.content}</p>
              </div>

              <div className="repost-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setRepostTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-repost-confirm"
                  disabled={reposting}
                  onClick={handleShareSubmit}
                >
                  {reposting ? "Sharing..." : "Share to Feed"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            MODAL: REPORT POST
        ==================================================== */}
        {reportTarget && (
          <div
            className="composer-modal-backdrop"
            onClick={() => setReportTarget(null)}
          >
            <div
              className="report-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-title-bar">
                <h3>Report Post</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setReportTarget(null)}
                >
                  ✕
                </button>
              </div>

              <p className="report-intro">
                Please help us understand why you are reporting this content:
              </p>

              <select
                className="report-reason-select"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="Inappropriate content">Inappropriate content</option>
                <option value="Spam or misleading">Spam or misleading</option>
                <option value="Harassment or hate speech">Harassment or hate speech</option>
                <option value="Copyright or intellectual property">Copyright or IP violation</option>
                <option value="Other">Other</option>
              </select>

              <textarea
                className="report-details-input"
                placeholder="Additional details (optional)..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
              />

              <div className="repost-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setReportTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-report-confirm"
                  onClick={handleSubmitReport}
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ==========================================================
   POST CARD COMPONENT
========================================================== */
const PostCard = ({
  post,
  currentUserId,
  onLike,
  onOpenLikers,
  onShare,
  onToggleSave,
  onDelete,
  onReport,
  onFilterTag,
  // Comments
  commentsOpen,
  onToggleComments,
  commentInput,
  onCommentInputChange,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  // Replies
  activeReplyId,
  onToggleReply,
  replyInput,
  onReplyInputChange,
  onAddReply,
  onDeleteReply
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthor = currentUserId && post.author?._id === currentUserId;

  const renderContentWithLinks = (text) => {
    if (!text) return "";

    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith("#") && part.length > 1) {
        return (
          <span
            key={index}
            className="post-hashtag-link"
            onClick={(e) => {
              e.stopPropagation();
              onFilterTag(part);
            }}
          >
            {part}
          </span>
        );
      }
      if (part.startsWith("@") && part.length > 1) {
        const username = part.replace("@", "");
        return (
          <Link
            key={index}
            to={`/profile/${username}`}
            className="post-mention-link"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const getPostTypeBadge = (type) => {
    switch (type) {
      case "project":
        return { label: "🚀 Project Showcase", color: "#444444" };
      case "career_update":
        return { label: "💼 Career Milestone", color: "#555555" };
      case "achievement":
        return { label: "🏆 Achievement", color: "#666666" };
      case "learning":
        return { label: "📚 Learning Note", color: "#f472b6" };
      case "technical":
        return { label: "💻 Technical Insight", color: "#555555" };
      default:
        return null;
    }
  };

  const typeBadge = getPostTypeBadge(post.postType);

  return (
    <article className="feed-post-card">
      {/* REPOST HEADER IF THIS IS A SHARE */}
      {post.originalPost && (
        <div className="repost-indicator-banner">
          <Repeat size={14} />
          <span>
            <strong>{post.author?.name}</strong> shared this
            {post.repostCommentary && ` • "${post.repostCommentary}"`}
          </span>
        </div>
      )}

      {/* POST CARD HEADER */}
      <div className="post-header-row">
        <Link
          to={`/profile/${post.author?.username || post.author?._id || 'member'}`}
          className="post-author-avatar"
        >
          {post.author?.profilePicture ? (
            <img src={post.author.profilePicture} alt={post.author.name || 'Member'} />
          ) : (
            <span>{((post.author?.name || "P")[0]).toUpperCase()}</span>
          )}
        </Link>

        <div className="post-header-meta">
          <Link
            to={`/profile/${post.author?.username || post.author?._id || 'member'}`}
            className="post-author-name"
          >
            {post.author?.name || "JobSphere Member"}
          </Link>
          <span className="post-author-headline">
            {post.author?.headline || "Member on JobSphere"}
          </span>
          <div className="post-time-visibility">
            <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
            <span>•</span>
            <span className="visibility-icon" title={`Visibility: ${post.visibility}`}>
              {post.visibility === "connections" ? (
                <Users size={12} />
              ) : post.visibility === "followers" ? (
                <UserCheck size={12} />
              ) : (
                <Globe size={12} />
              )}
            </span>
            {typeBadge && (
              <span
                className="post-type-pill"
                style={{ borderColor: typeBadge.color, color: typeBadge.color }}
              >
                {typeBadge.label}
              </span>
            )}
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="post-menu-wrap">
          <button
            type="button"
            className="post-menu-trigger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="post-menu-dropdown">
              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleSave();
                }}
              >
                <Bookmark size={14} />
                <span>{post.isSaved ? "Remove Bookmark" : "Save Post"}</span>
              </button>

              {isAuthor ? (
                <button
                  type="button"
                  className="menu-item delete"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete Post</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="menu-item report"
                  onClick={() => {
                    setMenuOpen(false);
                    onReport();
                  }}
                >
                  <Flag size={14} />
                  <span>Report Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* POST CONTENT BODY */}
      <div className="post-body">
        <p className="post-text-content">
          {renderContentWithLinks(post.content)}
        </p>

        {/* Project Reference Card if present */}
        {post.projectRef?.title && (
          <div className="attached-project-card">
            <div className="attached-project-header">
              <Rocket size={16} />
              <strong>{post.projectRef.title}</strong>
            </div>
            {post.projectRef.link && (
              <a
                href={post.projectRef.link}
                target="_blank"
                rel="noreferrer"
                className="project-live-link"
              >
                <span>Visit Project</span>
                <ExternalLink size={12} />
              </a>
            )}
            {Array.isArray(post.projectRef.tech) && post.projectRef.tech.length > 0 && (
              <div className="project-tech-row">
                {post.projectRef.tech.map((t, idx) => (
                  <span key={idx} className="tech-badge">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Job Reference Card if present */}
        {post.jobRef?.title && (
          <div className="attached-job-card">
            <div className="attached-job-header">
              <Briefcase size={16} />
              <div>
                <strong>{post.jobRef.title}</strong>
                <span> • {post.jobRef.company}</span>
              </div>
            </div>
            {post.jobRef.link && (
              <a
                href={post.jobRef.link}
                target="_blank"
                rel="noreferrer"
                className="job-apply-link"
              >
                <span>View Opportunity</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {/* Media Image if present */}
        {post.image && (
          <div className="post-media-wrap">
            <img src={post.image} alt="Post Attachment" />
          </div>
        )}

        {/* Quoted Original Post (if repost) */}
        {post.originalPost && typeof post.originalPost === "object" && (
          <div className="nested-original-card">
            <div className="nested-author-row">
              <span className="nested-name">{post.originalPost.author?.name}</span>
              <span className="nested-headline">{post.originalPost.author?.headline}</span>
            </div>
            <p className="nested-content">{post.originalPost.content}</p>
            {post.originalPost.image && (
              <div className="nested-image-wrap">
                <img src={post.originalPost.image} alt="Nested media" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* STATS ROW (CLICKABLE LIKES MODAL) */}
      <div className="post-stats-row">
        <button
          type="button"
          className="stats-likers-btn"
          onClick={onOpenLikers}
          title="See who liked this post"
        >
          <ThumbsUp size={12} className="thumbs-mini" />
          <span>{post.likeCount} {post.likeCount === 1 ? "like" : "likes"}</span>
        </button>

        <div className="stats-comments-shares">
          <span onClick={onToggleComments} className="stats-clickable">
            {post.commentCount} comments
          </span>
          {post.repostCount > 0 && <span>• {post.repostCount} reposts</span>}
        </div>
      </div>

      <div className="post-action-divider" />

      {/* ACTIONS FOOTER */}
      <div className="post-actions-bar">
        <button
          type="button"
          className={`post-action-btn ${post.isLiked ? "liked" : ""}`}
          onClick={onLike}
        >
          <Heart size={18} fill={post.isLiked ? "#222222" : "none"} />
          <span>{post.isLiked ? "Liked" : "Like"}</span>
        </button>

        <button
          type="button"
          className="post-action-btn"
          onClick={onToggleComments}
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>

        <button
          type="button"
          className="post-action-btn"
          onClick={onShare}
        >
          <Repeat size={18} />
          <span>Repost</span>
        </button>

        <button
          type="button"
          className={`post-action-btn ${post.isSaved ? "saved" : ""}`}
          onClick={onToggleSave}
        >
          <Bookmark size={18} fill={post.isSaved ? "#222222" : "none"} />
          <span>{post.isSaved ? "Saved" : "Save"}</span>
        </button>
      </div>

      {/* COMMENTS DRAWER */}
      {commentsOpen && (
        <div className="comments-drawer">
          {/* Add Comment Input */}
          <div className="add-comment-box">
            <input
              type="text"
              placeholder="Add a comment... (mention peers with @username)"
              value={commentInput}
              onChange={(e) => onCommentInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onAddComment();
                }
              }}
            />
            <button
              type="button"
              className="btn-send-comment"
              disabled={!commentInput?.trim()}
              onClick={onAddComment}
            >
              <Send size={15} />
            </button>
          </div>

          {/* Comments List */}
          <div className="comments-list">
            {(!post.comments || post.comments.length === 0) ? (
              <p className="no-comments-msg">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-top">
                    <Link
                      to={`/profile/${comment.user?.username || comment.user?._id}`}
                      className="comment-author-avatar"
                    >
                      {comment.user?.profilePicture ? (
                        <img src={comment.user.profilePicture} alt={comment.user.name} />
                      ) : (
                        <span>{(comment.user?.name || "U")[0].toUpperCase()}</span>
                      )}
                    </Link>

                    <div className="comment-bubble">
                      <div className="comment-author-row">
                        <Link
                          to={`/profile/${comment.user?.username || comment.user?._id}`}
                          className="comment-author-name"
                        >
                          {comment.user?.name}
                        </Link>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="comment-headline">
                        {comment.user?.headline || "JobSphere Member"}
                      </span>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  </div>

                  {/* Comment Action bar */}
                  <div className="comment-actions-row">
                    <button
                      type="button"
                      className={`comment-like-btn ${comment.isLiked ? "liked" : ""}`}
                      onClick={() => onLikeComment(comment._id)}
                    >
                      {comment.isLiked ? "Liked" : "Like"}
                      {comment.likeCount > 0 && ` (${comment.likeCount})`}
                    </button>

                    <button
                      type="button"
                      className="comment-reply-btn"
                      onClick={() => onToggleReply(comment._id)}
                    >
                      Reply
                    </button>

                    {currentUserId &&
                      (comment.user?._id === currentUserId ||
                        post.author?._id === currentUserId) && (
                        <button
                          type="button"
                          className="comment-delete-btn"
                          onClick={() => onDeleteComment(comment._id)}
                        >
                          Delete
                        </button>
                      )}
                  </div>

                  {/* Nested Replies List */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="replies-list">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="reply-item">
                          <CornerDownRight size={14} className="reply-arrow" />
                          <div className="reply-bubble">
                            <div className="reply-author-row">
                              <Link
                                to={`/profile/${reply.user?.username || reply.user?._id}`}
                                className="reply-author-name"
                              >
                                {reply.user?.name}
                              </Link>
                              <span className="reply-date">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="reply-text">{reply.text}</p>
                            {currentUserId &&
                              (reply.user?._id === currentUserId ||
                                post.author?._id === currentUserId) && (
                                <button
                                  type="button"
                                  className="reply-delete-btn"
                                  onClick={() =>
                                    onDeleteReply(comment._id, reply._id)
                                  }
                                >
                                  Delete
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input Box */}
                  {activeReplyId === comment._id && (
                    <div className="reply-input-box">
                      <input
                        type="text"
                        placeholder={`Reply to ${comment.user?.name}...`}
                        value={replyInput[comment._id] || ""}
                        onChange={(e) =>
                          onReplyInputChange(comment._id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            onAddReply(comment._id);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-send-reply"
                        onClick={() => onAddReply(comment._id)}
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default Feed;
