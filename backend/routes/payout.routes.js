const express = require('express');
const router = express.Router();
const {
  updatePaymentInfo,
  getPaymentInfo,
  requestPayout,
  getMyPayoutRequests,
  cancelPayoutRequest,
  getPayoutStats,
  
  getPendingPayoutRequests,
  approvePayoutRequest,
  completePayoutRequest,
  rejectPayoutRequest,
  getAllPayoutHistory
} = require('../controllers/payout.controller');

// const {
//   getPendingCNICVerifications,
//   verifyCNIC,
//   rejectCNIC,
//   getPendingPaymentVerifications,
//   verifyJazzCash,
//   verifyEasyPaisa,
//   verifyBankAccount
// } = require('../controllers/payout.controller');

const { protect, isAdmin, isSuperAdmin } = require("../middleware/auth.middleware");
const { uploadPayoutScreenshot } = require('../middleware/upload.middleware');

// ======================
// USER ROUTES (For Admins)
// ======================

// Payment information
router.put('/payment-info', protect, isAdmin, updatePaymentInfo);
router.get('/payment-info', protect, isAdmin, getPaymentInfo);

// Payout requests
router.post('/request', protect, isAdmin, requestPayout);
router.get('/my-requests', protect, isAdmin, getMyPayoutRequests);
router.delete('/cancel/:requestId', protect, isAdmin, cancelPayoutRequest);
router.get('/stats', protect, isAdmin, getPayoutStats);

// ======================
// SUPERVISOR ROUTES (For Superadmin)
// ======================

// Payout management
router.get('/pending-requests', protect, isSuperAdmin, getPendingPayoutRequests);
router.put('/approve/:requestId', protect, isSuperAdmin, approvePayoutRequest);
router.put('/complete/:requestId', protect, isSuperAdmin,uploadPayoutScreenshot, completePayoutRequest);
router.put('/reject/:requestId', protect, isSuperAdmin, rejectPayoutRequest);
router.get('/history', protect, isSuperAdmin, getAllPayoutHistory);

module.exports = router;