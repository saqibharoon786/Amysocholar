const express = require("express");
const router = express.Router();
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

const {
  getMyCommissions,
  getAllCommissions,
  getCommissionStats,
  getCommissionById,
  getCommissionsByBook,
  getDailyCommissionReport,
  getCommissionSummary,
  exportCommissionsToCSV,
  updateCommissionStatus
} = require("../controllers/commission.controller");

// ================== 🔐 PROTECTED ROUTES ==================
router.use(protect);

// -------- USER ROUTES --------
router.get("/my-commissions", getMyCommissions);
router.get("/summary", getCommissionSummary);
router.get("/by-book/:bookId", getCommissionsByBook);

// -------- SUPERADMIN ROUTES --------
router.get("/all", isSuperAdmin, getAllCommissions);
router.get("/stats", isSuperAdmin, getCommissionStats);
router.get("/daily-report", isSuperAdmin, getDailyCommissionReport);
router.get("/export/csv", isSuperAdmin, exportCommissionsToCSV);
router.patch("/:commissionId/status", isSuperAdmin, updateCommissionStatus);

// -------- DYNAMIC ROUTES (LAST) --------
router.get("/:id", getCommissionById);

module.exports = router;
