const Category = require("../models/category.model");
const AppError = require("../utils/appError");

// Dummy/legacy names – in ko na to API me bhejo na dropdown me dikhao (sirf superadmin-created dikhen)
const LEGACY_DEFAULT_NAMES = [
  "Law Books", "Academic", "Biography", "Business", "Constitutional Law", "Contract Law", "Corporate Law",
  "Criminal Law", "Family Law", "Fiction", "History", "Labor Law", "Non-Fiction", "Property Law", "Reference",
  "Religion", "Science", "Self-Help", "Tax Law", "Technology", "Tort Law", "book", "law",
];

// List all categories – sirf wohi jo superadmin ne create ki; dummy/legacy names filter out
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).select("name slug");
    const names = categories
      .map((c) => c.name)
      .filter((name) => !LEGACY_DEFAULT_NAMES.includes(name));
    res.status(200).json({
      success: true,
      data: names,
      count: names.length,
    });
  } catch (error) {
    next(error);
  }
};

// Create category (admin & superadmin only)
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return next(new AppError("Category name is required", 400));
    }
    const trimmed = String(name).trim();
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, "i") } });
    if (existing) {
      return next(new AppError("Category already exists", 400));
    }
    const category = await Category.create({
      name: trimmed,
      slug: trimmed.toLowerCase().replace(/\s+/g, "-"),
    });
    res.status(201).json({
      success: true,
      message: "Category added",
      data: { category: { _id: category._id, name: category.name } },
    });
  } catch (error) {
    next(error);
  }
};

// Delete category (admin & superadmin only) – optional
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return next(new AppError("Category not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    next(error);
  }
};

const removeDefaultCategories = async (req, res, next) => {
  try {
    const result = await Category.deleteMany({ name: { $in: LEGACY_DEFAULT_NAMES } });
    res.status(200).json({
      success: true,
      message: "Default categories removed. Only superadmin-created categories remain.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
  removeDefaultCategories,
};
