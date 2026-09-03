const express = require("express");

const {
  createPost,
  getFeed,
  getUserPosts,
  likePost,
  addComment,
  deletePost,
  deleteComment
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../utils/upload");

const router = express.Router();

// Create post
router.post(
  "/",
  protect,
  upload.single('image'),
  createPost
);

// Get feed
router.get(
  "/",
  protect,
  getFeed
);

router.get(
  "/feed",
  protect,
  getFeed
);

// Get user's posts
router.get(
  "/user/:userId",
  protect,
  getUserPosts
);

// Like / unlike post
router.post(
  "/:id/like",
  protect,
  likePost
);

// Add comment
router.post(
  "/:id/comment",
  protect,
  addComment
);

// Delete comment
router.delete(
  "/:id/comment/:commentId",
  protect,
  deleteComment
);

// Delete post
router.delete(
  "/:id",
  protect,
  deletePost
);

module.exports = router;