const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    isEdited: {
      type: Boolean,
      default: false
    },

    replies: [replySchema]
  },
  {
    timestamps: true
  }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },

    postType: {
      type: String,
      enum: [
        "text",
        "image",
        "project",
        "career_update",
        "achievement",
        "job_related",
        "learning",
        "technical"
      ],
      default: "text"
    },

    image: {
      type: String,
      default: ""
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],

    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    visibility: {
      type: String,
      enum: ["public", "connections", "followers"],
      default: "public"
    },

    // Repost / Share references
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null
    },

    repostCommentary: {
      type: String,
      trim: true,
      default: ""
    },

    repostCount: {
      type: Number,
      default: 0
    },

    shares: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    // Metadata references for specialized post types
    projectRef: {
      title: { type: String, trim: true },
      link: { type: String, trim: true },
      github: { type: String, trim: true },
      tech: [{ type: String, trim: true }]
    },

    jobRef: {
      title: { type: String, trim: true },
      company: { type: String, trim: true },
      location: { type: String, trim: true },
      link: { type: String, trim: true }
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    comments: [commentSchema]
  },
  {
    timestamps: true
  }
);

postSchema.index({
  author: 1,
  createdAt: -1
});

postSchema.index({
  createdAt: -1
});

postSchema.index({
  tags: 1
});

postSchema.index({
  visibility: 1,
  createdAt: -1
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;