const Favorite = require('../models/favorite.model');
const AppError = require('../utils/appError');

// Add to favorites
const addToFavorites = async (req, res, next) => {
  try {
    const { bookId, judgmentId, type } = req.body;

    if (!type || (!bookId && !judgmentId)) {
      return next(new AppError('Please provide type and either bookId or judgmentId', 400));
    }

    if (type === 'book' && !bookId) {
      return next(new AppError('Book ID is required for book type', 400));
    }

    if (type === 'judgment' && !judgmentId) {
      return next(new AppError('Judgment ID is required for judgment type', 400));
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      ...(type === 'book' ? { book: bookId } : { judgment: judgmentId }),
    });

    if (existingFavorite) {
      return next(new AppError('Item already in favorites', 400));
    }

    const favorite = await Favorite.create({
      user: req.user.id,
      book: bookId,
      judgment: judgmentId,
      type,
    });

    await favorite.populate('book judgment');

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: { favorite },
    });
  } catch (error) {
    next(error);
  }
};

// Remove from favorites
const removeFromFavorites = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!favorite) {
      return next(new AppError('Favorite not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

// Get user favorites
const getUserFavorites = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };
    if (type) query.type = type;

    const favorites = await Favorite.find(query)
      .populate('book judgment')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Favorite.countDocuments(query);

    res.status(200).json({
      success: true,
      data: { favorites },
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        results: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Check favorite status
const checkFavoriteStatus = async (req, res, next) => {
  try {
    const { bookId, judgmentId, type } = req.query;

    if (!type || (!bookId && !judgmentId)) {
      return next(new AppError('Please provide type and either bookId or judgmentId', 400));
    }

    const favorite = await Favorite.findOne({
      user: req.user.id,
      ...(type === 'book' ? { book: bookId } : { judgment: judgmentId }),
    });

    res.status(200).json({
      success: true,
      data: {
        isFavorite: !!favorite,
        favoriteId: favorite?._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkFavoriteStatus,
};