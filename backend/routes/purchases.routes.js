const express = require("express");
const router = express.Router();
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

const {
  createPurchase,
  getAllPurchases,
  getUserPurchases,
  getSellerPurchases,
  getPurchaseById,
  updatePaymentStatus,
  getPurchaseStats,
  getUserPurchaseStats,
  checkPurchaseStatus
} = require("../controllers/purchase.controller");

// ================== 🔐 PROTECTED ROUTES ==================
router.use(protect);

// User purchase routes
router.get("/my-purchases", getUserPurchases);
router.get("/my-purchases/stats", getUserPurchaseStats);
router.get("/check-purchase", checkPurchaseStatus);
router.post("/create", createPurchase);

// Seller routes (for admins/superadmin)
router.get("/seller/sales", getSellerPurchases);

// ================== 🧑‍⚖️ SUPERADMIN ONLY ==================
router.get("/all", isSuperAdmin, getAllPurchases);
router.get("/stats", isSuperAdmin, getPurchaseStats);
router.get("/:id", isSuperAdmin, getPurchaseById);
router.patch("/:id/status", isSuperAdmin, updatePaymentStatus);

module.exports = router;