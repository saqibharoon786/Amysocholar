// models/page.model.js
const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["privacy", "terms", "about", "contact", "faq", "help"],
      required: true,
    },
    metaTitle: String,
    metaDescription: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
pageSchema.index({ slug: 1 });
pageSchema.index({ type: 1 });

module.exports = mongoose.model("Page", pageSchema);