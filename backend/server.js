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

// ENV Values
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET || "fallbacksecret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const MONGO_URI = process.env.MONGO;

// ===== Validate required env values =====
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO is missing in .env");
  process.exit(1);
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
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// ===== Body Parsers =====
app.use(express.json({ limit: "15mb" }));
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
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Export for testing
module.exports = app;
