const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/auth.middleware");
const {
  getJudgmentCategories,
  createJudgmentCategory,
  deleteJudgmentCategory,
} = require("../controllers/judgmentCategory.controller");

// Public: list judgment categories for dropdowns
router.get("/", getJudgmentCategories);

// Admin & Superadmin: add / delete
router.use(protect);
router.post("/", isAdmin, createJudgmentCategory);
router.delete("/:id", isAdmin, deleteJudgmentCategory);

module.exports = router;
