const express = require("express");
const router = express.Router();

const { uploadFiles } = require("../middleware/upload.middleware");
const { protect, isAdmin, isSuperAdmin, isCustomer } = require("../middleware/auth.middleware");

const {
  uploadBook,
  approveBook,
  rejectBook,
  getAllBooks,
  getApprovedBooks,
  getBookById,
  getMyBooks,
  getPendingBooks,
  updateBook,
  deleteBook,
  getBookPreview,
  purchaseBook,
  getMyPurchasedBooks,
  readFullBook,
  checkPurchaseStatus,
  searchBooks,
  getBooksByCategory,
  getFeaturedBooks,
  getBestsellerBooks,
  getNewReleases,
  incrementViewCount,
  updateBookRating,
  getAllCategories,
  getPopularCategories
} = require("../controllers/book.controller");

// ================== 📘 PUBLIC ROUTES ==================
router.get("/get-all-books", getAllBooks);
router.get("/approved", getApprovedBooks);
router.get("/search", searchBooks);
router.get("/category/:category", getBooksByCategory);
router.get("/featured", getFeaturedBooks);
router.get("/bestsellers", getBestsellerBooks);
router.get("/new-releases", getNewReleases);
router.get("/get-book/:id", getBookById);
router.get("/:id/preview", getBookPreview);
router.patch("/:id/view", incrementViewCount);
router.get("/categories/all", getAllCategories);
router.get("/categories/popular", getPopularCategories);



// ================== 👤 AUTHENTICATED ROUTES ==================
router.use(protect); 
router.get("/:id/read", readFullBook);

// ================== 👩‍💼 ADMIN ROUTES ==================
router.post("/upload-book", isAdmin, uploadFiles, uploadBook);
router.get("/my/books", isAdmin, getMyBooks);
router.patch("/update/my/books/:id", isAdmin, updateBook);
router.delete("/my/books/:id", isAdmin, deleteBook);

// ================== 🧑‍⚖️ SUPERADMIN ROUTES ==================
router.post("/upload-book", isSuperAdmin, uploadFiles, uploadBook);
router.get("/admin/pending", isSuperAdmin, getPendingBooks);
router.patch("/admin/:id/approve", isSuperAdmin, approveBook);
router.patch("/admin/:id/reject", isSuperAdmin, rejectBook);

// ================== 👤 CUSTOMER ROUTES ==================
router.post("/:id/purchase", isCustomer, purchaseBook);
router.get("/my/purchases", isCustomer, getMyPurchasedBooks);
router.get("/:id/check-purchase", isCustomer, checkPurchaseStatus);
router.patch("/:id/rating", isCustomer, updateBookRating);

module.exports = router;