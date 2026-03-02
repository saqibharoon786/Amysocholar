const JudgmentCategory = require("../models/judgmentCategory.model");
const AppError = require("../utils/appError");

// List all judgment categories (saari DB categories)
const getJudgmentCategories = async (req, res, next) => {
  try {
    const categories = await JudgmentCategory.find().sort({ name: 1 }).select("name slug");
    const names = categories.map((c) => c.name);
    res.status(200).json({
      success: true,
      data: names,
      count: names.length,
    });
  } catch (error) {
    next(error);
  }
};

// Create judgment category (admin & superadmin only)
const createJudgmentCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return next(new AppError("Category name is required", 400));
    }
    const trimmed = String(name).trim();
    const existing = await JudgmentCategory.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, "i") } });
    if (existing) {
      return next(new AppError("Category already exists", 400));
    }
    const category = await JudgmentCategory.create({
      name: trimmed,
      slug: trimmed.toLowerCase().replace(/\s+/g, "-"),
    });
    res.status(201).json({
      success: true,
      message: "Judgment category added",
      data: { category: { _id: category._id, name: category.name } },
    });
  } catch (error) {
    next(error);
  }
};

// Delete judgment category (admin & superadmin only)
const deleteJudgmentCategory = async (req, res, next) => {
  try {
    const category = await JudgmentCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return next(new AppError("Category not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Judgment category deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJudgmentCategories,
  createJudgmentCategory,
  deleteJudgmentCategory,
};
