const express = require("express");
const router = express.Router();
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

const {
  createPage,
  updatePage,
  deletePage,
  getAllPages,
  getPageById,
  getPageBySlug,
  getPagesByType,
  togglePageStatus
} = require("../controllers/page.controller");

// ================== 📄 PUBLIC ROUTES ==================
router.get("/get-all-pages", getAllPages);
router.get("/:slug", getPageBySlug);
router.get("/type/:type", getPagesByType);
router.get("/get-page/:id", getPageById);

// ================== 🧑‍⚖️ SUPERADMIN ROUTES ==================
router.use(protect, isSuperAdmin);

router.post("/create-page", createPage);
router.patch("/update-page/:id", updatePage);
router.delete("/delete-page/:id", deletePage);
router.patch("/:id/toggle-status", togglePageStatus);

module.exports = router;