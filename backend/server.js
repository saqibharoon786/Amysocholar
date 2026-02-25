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
const SESSION_SECRET = process.env.SESSION_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const MONGO_URI = process.env.MONGO;
const NODE_ENV = process.env.NODE_ENV || "development";

// ===== Validate required env values =====
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO is missing in .env");
  process.exit(1);
}

if (NODE_ENV === "production") {
  const required = [
    ["SESSION_SECRET", SESSION_SECRET],
    ["JWT_SECRET", process.env.JWT_SECRET],
    ["FRONTEND_URL", FRONTEND_URL],
  ];
  const missing = required.filter(([, v]) => !v || String(v).trim() === "");
  if (missing.length) {
    console.error("❌ ERROR: In production these env vars are required:", missing.map(([k]) => k).join(", "));
    process.exit(1);
  }
  if (!FRONTEND_URL.startsWith("https://")) {
    console.warn("⚠️  WARNING: FRONTEND_URL should use https:// in production.");
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
// Allow cross-origin loading of uploads (images, etc.) so frontend on different port can display them
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ===== CORS =====
// Allow FRONTEND_URL and both www / non-www so "Network Error" na aaye (origin mismatch = CORS block)
const allowedOrigins = [FRONTEND_URL].filter(Boolean);
if (FRONTEND_URL) {
  try {
    const u = new URL(FRONTEND_URL);
    if (u.hostname.startsWith("www.")) {
      allowedOrigins.push(u.origin.replace("www.", ""));
    } else {
      allowedOrigins.push(u.origin.replace(u.hostname, "www." + u.hostname));
    }
  } catch (_) {}
}

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
