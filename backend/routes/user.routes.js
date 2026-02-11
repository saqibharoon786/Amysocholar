const express = require("express");
const router = express.Router();
const { protect, isAdmin, isSuperAdmin, isCustomer } = require("../middleware/auth.middleware");
const { uploadProfile, uploadCNIC } = require("../middleware/upload.middleware");
const {
  getProfile,
  updateProfile,
  updatePassword,
  uploadProfileImage,
  verifyCNIC,
  getAllUsers,
//   getUserById,
//   updateUser,
//   deleteUser,
//   deactivateUser,
  getAdminStats,
//   getCustomerStats
} = require("../controllers/user.controller");

// ================== 👤 USER ROUTES ==================
router.use(protect);

router.get("/profile", getProfile);
router.patch("/update-profile", updateProfile);
router.patch("/change-password", updatePassword);
router.patch("/upload-profile-image", uploadProfile, uploadProfileImage);
router.post("/upload-cnic", uploadCNIC, verifyCNIC);

// ================== 🧑‍⚖️ SUPERADMIN ROUTES ==================
router.get("/get-users", isSuperAdmin, getAllUsers);
router.get("/stats", isSuperAdmin, getAdminStats);
// router.get("/:id", isSuperAdmin, getUserById);
// router.patch("/:id", isSuperAdmin, updateUser);
// router.delete("/:id", isSuperAdmin, deleteUser);
// router.patch("/:id/deactivate", isSuperAdmin, deactivateUser);

// // ================== 📊 CUSTOMER STATS ==================
// router.get("/customer/stats", isCustomer, getCustomerStats);

module.exports = router;