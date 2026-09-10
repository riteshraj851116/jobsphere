const express = require("express");

const {
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
} = require("../controllers/postController");

const { protect, optionalAuth } = require("../middleware/authMiddleware");
const upload = require("../utils/upload");

const router = express.Router();

// Resilient post upload handler that allows request to proceed gracefully
const handlePostImageUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.warn("Post media upload notice:", err.message);
    }
    next();
  });
};

// Create post
router.post("/", protect, handlePostImageUpload, createPost);

// Feed & Discovery
router.get("/", optionalAuth, getFeed);
router.get("/feed", optionalAuth, getFeed);
router.get("/saved", protect, getSavedPosts);
router.get("/tags/trending", getTrendingHashtags);
router.get("/tag/:tag", optionalAuth, getPostsByHashtag);

// User posts
router.get("/user/:userId", optionalAuth, getUserPosts);

// Single post operations
router.get("/:id", optionalAuth, getPostById);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

// Likes & Shares
router.post("/:id/like", protect, likePost);
router.put("/:id/like", protect, likePost);
router.get("/:id/likes", getPostLikes);
router.post("/:id/share", protect, sharePost);
router.post("/:id/save", protect, toggleSavePost);
router.delete("/:id/save", protect, toggleSavePost);

// Comments
router.post("/:id/comment", protect, addComment);
router.put("/:id/comment/:commentId", protect, editComment);
router.delete("/:id/comment/:commentId", protect, deleteComment);
router.post("/:id/comment/:commentId/like", protect, likeComment);

// Comment replies
router.post("/:id/comment/:commentId/reply", protect, addCommentReply);
router.delete("/:id/comment/:commentId/reply/:replyId", protect, deleteCommentReply);
router.post("/:id/comment/:commentId/reply/:replyId/like", protect, likeCommentReply);

module.exports = router;