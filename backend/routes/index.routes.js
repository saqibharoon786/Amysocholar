const express = require("express");
const router = express.Router();

// Import all routes
const authRoutes = require("./auth.routes");
const bookRoutes = require("./book.routes");
const userRoutes = require("./user.routes");
const pagesRoutes = require("./page.routes");
const judgmentRoutes = require("./judgment.routes");
const favoriteRoutes = require("./favorite.routes");
const paymentRoutes = require("./payment.routes");
const payoutRoutes = require("./payout.routes");
const commissionRoutes = require("./commission.routes");
const verificationRoutes = require("./verification.routes")

// API BASE PATHS
router.use("/auth", authRoutes);
router.use("/book", bookRoutes);
router.use("/users", userRoutes);
router.use("/pages", pagesRoutes);
router.use("/judgments", judgmentRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/payments", paymentRoutes);
router.use("/payouts", payoutRoutes);
router.use("/commissions", commissionRoutes);
router.use("/verification", verificationRoutes)

module.exports = router;