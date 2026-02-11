// ====================================================
//              SERVER.JS – STABLE VERSION
// ====================================================

// Load environment variables
require("dotenv").config();

// ===== Global crash handlers (prevent silent Nodemon crash) =====
process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ UNHANDLED REJECTION:", reason);
});

// Core imports
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const InitializeSuperAdmin = require("./utils/initilalization/superadminInitialize");
// Custom routes
const IndexRouter = require("./routes/index.routes");
// DB connection
const connectDB = require("./loaders/connectionDB");

// Custom error handlers
const { notFound, errorHandler } = require("./middleware/errorHandler");

// ENV Values (production: no hardcoded secrets)
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const MONGO_URI = process.env.MONGO;
const isProduction = process.env.NODE_ENV === "production";

// ===== Validate required env =====
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO is missing in .env");
  process.exit(1);
}
if (!SESSION_SECRET) {
  console.error("❌ ERROR: SESSION_SECRET is missing in .env");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is missing in .env");
  process.exit(1);
}
if (isProduction && process.env.SAFEPAY_SECRET_KEY) {
  const hasSuccess = process.env.SAFEPAY_SUCCESS_URL || process.env.BASE_URL;
  const hasCancel = process.env.SAFEPAY_CANCEL_URL || process.env.FRONTEND_URL;
  if (!hasSuccess || !hasCancel) {
    console.error("❌ ERROR: For production Safepay set BASE_URL & FRONTEND_URL (or SAFEPAY_SUCCESS_URL & SAFEPAY_CANCEL_URL) in .env");
    process.exit(1);
  }
  if (!process.env.SAFEPAY_WEBHOOK_SECRET) {
    console.error("❌ ERROR: SAFEPAY_WEBHOOK_SECRET is required in production for webhook verification");
    process.exit(1);
  }
}

// Create express app
const app = express();

InitializeSuperAdmin();

// ===== CONNECT DATABASE =====
(async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
})();

// ===== Security Middleware =====
app.use(helmet());

// ===== CORS =====
const corsOptions = {
  origin: isProduction && process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
    : "*",
  credentials: true,
};
app.use(cors(corsOptions));

// ===== Body Parsers =====
// Safepay webhook needs raw body for signature verification
app.use("/api/payments/safepay/webhook", express.raw({ type: "application/json" }), (req, res, next) => {
  req.rawBody = req.body;
  try {
    req.body = req.body && req.body.length ? JSON.parse(req.body.toString()) : {};
  } catch (e) {
    req.body = {};
  }
  next();
});
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/safepay/webhook" && req.method === "POST") return next();
  express.json({ limit: "15mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// ===== Compression =====
app.use(compression());

// ===== Logging =====
app.use(
  morgan(process.env.NODE_ENV === "development" ? "dev" : "combined")
);

// ===== Session Setup (Crash-safe) =====
try {
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: MONGO_URI,
        collectionName: "sessions",
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
    })
  );
} catch (err) {
  console.error("❌ Session setup error:", err);
}

// ===== Passport =====
app.use(passport.initialize());
app.use(passport.session());

// ===== Static Uploads =====
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Health Check =====
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ===== Routes =====
app.use("/api", IndexRouter);

// ===== Error Handling (last middleware) =====
app.use(notFound);
app.use(errorHandler);

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || "development"})`);
});

// Export for testing
module.exports = app;
