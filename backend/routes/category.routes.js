const express = require("express");
const router = express.Router();
const { protect, isAdmin, isSuperAdmin } = require("../middleware/auth.middleware");
const { getCategories, createCategory, deleteCategory, removeDefaultCategories } = require("../controllers/category.controller");

// Public: list categories for dropdowns
router.get("/", getCategories);

// Admin & Superadmin: add / delete category
router.use(protect);
router.post("/", isAdmin, createCategory);
router.delete("/:id", isAdmin, deleteCategory);
router.post("/remove-defaults", isSuperAdmin, removeDefaultCategories);

module.exports = router;
