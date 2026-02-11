const express = require("express");
const { 
  createPayment, 
  safepayReturn, 
  verifyPayment,
  safepayWebhook 
} = require("../controllers/payment.controller");
const { protect, isCustomer } = require("../middleware/auth.middleware");

const router = express.Router();


// ================== 🌐 PUBLIC ROUTES (No Auth Required) ==================
// Safepay return URL (callback from Safepay)
router.get("/safepay/return", safepayReturn);
router.post("/safepay/return", safepayReturn);
// Safepay webhook (server-to-server notifications)
router.post("/safepay/webhook", safepayWebhook);

// ================== 🔐 PROTECTED ROUTES (Require Auth) ==================
router.use(protect); // All routes below require authentication

// Create JazzCash payment (Customer only)
router.post("/create", isCustomer, createPayment);

// Verify payment status
router.get("/verify/:paymentId", verifyPayment);



module.exports = router;