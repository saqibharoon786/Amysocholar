const Category = require("../models/category.model");
const AppError = require("../utils/appError");

const DEFAULT_CATEGORIES = [
  "Law Books", "Academic", "Reference", "Fiction", "Non-Fiction", "Science", "Technology", "History",
  "Biography", "Self-Help", "Business", "Religion",
  "Contract Law", "Property Law", "Tort Law", "Criminal Law", "Constitutional Law", "Family Law", "Corporate Law", "Tax Law", "Labor Law",
];

// List all categories (for book & judgment dropdowns – public or auth)
const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find().sort({ name: 1 }).select("name slug");
    if (categories.length === 0) {
      await Category.insertMany(
        DEFAULT_CATEGORIES.map((name) => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
        }))
      );
      categories = await Category.find().sort({ name: 1 }).select("name slug");
    }
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

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
};
