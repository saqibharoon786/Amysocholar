// models/favorite.model.js
const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
    judgment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Judgment",
    },
    type: {
      type: String,
      enum: ["book", "judgment"],
      required: true,
    }
  },
  { timestamps: true }
);

// Prevent duplicates
favoriteSchema.index({ user: 1, book: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ user: 1, judgment: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Favorite", favoriteSchema);