const express = require("express");
const router = express.Router();
const { protect, isCustomer } = require("../middleware/auth.middleware");

const {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkFavoriteStatus
} = require("../controllers/favorite.controller");

// ================== ❤️ CUSTOMER ROUTES ==================
router.use(protect, isCustomer);

router.get("/get-all-favorite-books", getUserFavorites);
router.post("/add-to-favorite", addToFavorites);
router.delete("/remove-book/:id", removeFromFavorites);
router.get("/check", checkFavoriteStatus);

module.exports = router;