const mongoose = require("mongoose");

const judgmentCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

judgmentCategorySchema.index({ name: 1 });

module.exports = mongoose.model("JudgmentCategory", judgmentCategorySchema);
