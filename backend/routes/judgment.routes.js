const express = require("express");
const router = express.Router();
const { protect, isSuperAdmin, isCustomer } = require("../middleware/auth.middleware");
const { uploadFiles } = require("../middleware/upload.middleware");

const {
  uploadJudgment,
  getAllJudgments,
//   getJudgmentById,
//   updateJudgment,
//   deleteJudgment,
//   getJudgmentsByCourt,
//   getJudgmentsByYear,
//   getJudgmentsByCategory,
//   searchJudgments,
  getFeaturedJudgments,
//   purchaseJudgment,
//   readJudgment,
//   getMyPurchasedJudgments
} = require("../controllers/judgment.controller");

// ================== ⚖️ PUBLIC ROUTES ==================
router.get("/get-all-judgment", getAllJudgments);
router.get("/featured", getFeaturedJudgments);
// router.get("/search", searchJudgments);
// router.get("/court/:court", getJudgmentsByCourt);
// router.get("/year/:year", getJudgmentsByYear);
// router.get("/category/:category", getJudgmentsByCategory);
// router.get("/:id", getJudgmentById);

// ================== 🧑‍⚖️ SUPERADMIN ROUTES ==================
router.use(protect, isSuperAdmin);

router.post("/upload-judgment-book", uploadFiles, uploadJudgment);
// router.patch("/:id", updateJudgment);
// router.delete("/:id", deleteJudgment);

// ================== 👤 CUSTOMER ROUTES ==================
// router.post("/:id/purchase", protect, isCustomer, purchaseJudgment);
// router.get("/:id/read", protect, isCustomer, readJudgment);
// router.get("/my-purchases/judgments", protect, isCustomer, getMyPurchasedJudgments); 

module.exports = router;