const express = require('express');
const router = express.Router();
const {
  getPendingCNICVerifications,
  verifyCNIC,
  rejectCNIC,
  getPendingPaymentVerifications,
  verifyJazzCash,
  verifyEasyPaisa,
  verifyBankAccount
} = require('../controllers/verification.controller');


const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

// CNIC Verification
router.get('/cnic/pending', protect, isSuperAdmin, getPendingCNICVerifications);
router.put('/cnic/verify/:userId', protect, isSuperAdmin, verifyCNIC);
router.put('/cnic/reject/:userId', protect, isSuperAdmin, rejectCNIC);

// Payment Method Verification
router.get('/payment/pending', protect, isSuperAdmin, getPendingPaymentVerifications);
router.put('/payment/jazzcash/:userId', protect, isSuperAdmin, verifyJazzCash);
router.put('/payment/easypaisa/:userId', protect, isSuperAdmin, verifyEasyPaisa);
router.put('/payment/bank/:userId', protect, isSuperAdmin, verifyBankAccount);

module.exports = router;