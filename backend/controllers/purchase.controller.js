const Purchase = require('../models/purchases.model');
const Book = require('../models/book.model');
const Judgment = require('../models/judgment.model');
const Payment = require('../models/payment.model');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

// In createPurchase function, update payment method validation:
const createPurchase = async (req, res, next) => {
  try {
    const { bookId, judgmentId, type, format, paymentMethod } = req.body;

    if (!type || (!bookId && !judgmentId) || !format || !paymentMethod) {
      return next(new AppError('Please provide all required fields', 400));
    }

    // Update payment method validation to include safepay
    if (!['safepay', 'jazzcash', 'easypaisa', 'bank'].includes(paymentMethod)) {
      return next(new AppError('Invalid payment method', 400));
    }

    
    const purchase = await Purchase.create({
      user: req.user.id,
      book: bookId,
      judgment: judgmentId,
      type,
      format,
      amount,
      seller: seller._id,
      sellerType,
      commission: {
        sellerAmount,
        superadminAmount,
        commissionPercentage: SUPERADMIN_COMMISSION
      },
      paymentMethod,
      paymentStatus: 'pending',
      transactionId: `${type.toUpperCase()}_${Date.now()}_${req.user.id}`,
      paymentDetails: {
        method: paymentMethod,
        amount,
        currency: item.currency || 'PKR',
        status: 'pending',
        timestamp: new Date(),
      },
    });

    // If payment method is safepay, create payment and return redirect URL
    if (paymentMethod === 'safepay') {
      const { createPaymentWithCommission } = require('../services/payment.service');
      
      let itemId, sellerId;
      if (type === 'book') {
        itemId = bookId;
        sellerId = item.uploader._id;
      } else {
        itemId = judgmentId;
        sellerId = item.uploader;
      }
      
      const paymentData = await createPaymentWithCommission(
        amount,
        req.user.id,
        itemId,
        sellerId,
        sellerType
      );
      
      // Update purchase with safepay details
      purchase.tracker = paymentData.tracker;
      purchase.safepayTracker = paymentData.tracker;
      await purchase.save();
      
      return res.status(201).json({
        success: true,
        message: 'Purchase initiated successfully',
        data: { 
          purchase,
          nextStep: 'Proceed to payment',
          paymentUrl: paymentData.paymentUrl,
          tracker: paymentData.tracker
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Purchase initiated successfully',
      data: { 
        purchase,
        nextStep: 'Proceed to payment'
      },
    });
  } catch (error) {
    next(error);
  }
};

// Complete purchase after JazzCash payment
const completePurchase = async (purchaseId, paymentId, jazzcashRef) => {
  try {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    
    // Update purchase with payment info
    purchase.payment = paymentId;
    purchase.paymentStatus = 'completed';
    purchase.jazzcashRef = jazzcashRef;
    purchase.paymentDetails.status = 'completed';
    purchase.paymentDetails.timestamp = new Date();
    
    await purchase.save();
    
    // Update item sales count
    if (purchase.type === 'book' && purchase.book) {
      await Book.findByIdAndUpdate(purchase.book, {
        $inc: { salesCount: 1 }
      });
    } else if (purchase.type === 'judgment' && purchase.judgment) {
      await Judgment.findByIdAndUpdate(purchase.judgment, {
        $inc: { purchases: 1 }
      });
    }
    
    // Distribute earnings
    await distributePurchaseEarnings(purchase);
    
    return purchase;
  } catch (error) {
    console.error('Complete purchase error:', error);
    throw error;
  }
};

// Distribute earnings for a purchase
const distributePurchaseEarnings = async (purchase) => {
  try {
    // Update seller's wallet
    const seller = await User.findById(purchase.seller);
    if (seller) {
      seller.wallet.totalEarnings += purchase.commission.sellerAmount;
      seller.wallet.pendingBalance += purchase.commission.sellerAmount;
      
      // Auto move to available balance after 24 hours
      setTimeout(async () => {
        if (seller.wallet.pendingBalance >= purchase.commission.sellerAmount) {
          seller.wallet.pendingBalance -= purchase.commission.sellerAmount;
          seller.wallet.availableBalance += purchase.commission.sellerAmount;
          await seller.save();
        }
      }, 24 * 60 * 60 * 1000);
      
      await seller.save();
    }
    
    // Update superadmin's wallet
    if (purchase.commission.superadminAmount > 0) {
      const superadmin = await User.findOne({ role: 'superadmin' });
      if (superadmin) {
        superadmin.wallet.totalEarnings += purchase.commission.superadminAmount;
        superadmin.wallet.pendingBalance += purchase.commission.superadminAmount;
        
        setTimeout(async () => {
          if (superadmin.wallet.pendingBalance >= purchase.commission.superadminAmount) {
            superadmin.wallet.pendingBalance -= purchase.commission.superadminAmount;
            superadmin.wallet.availableBalance += purchase.commission.superadminAmount;
            await superadmin.save();
          }
        }, 24 * 60 * 60 * 1000);
        
        await superadmin.save();
      }
    }
    
    // Update purchase earnings status
    purchase.earningsStatus = 'processed';
    await purchase.save();
    
    return true;
  } catch (error) {
    console.error('Distribute earnings error:', error);
    throw error;
  }
};

// Get all purchases (Superadmin only)
const getAllPurchases = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can view all purchases', 403));
    }
    
    const { page = 1, limit = 20, type, paymentStatus, userId, sellerId } = req.query;

    const query = {};
    if (type) query.type = type;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (userId) query.user = userId;
    if (sellerId) query.seller = sellerId;

    const purchases = await Purchase.find(query)
      .populate('user', 'firstName lastName email')
      .populate('book judgment seller')
      .populate('payment')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Purchase.countDocuments(query);

    res.status(200).json({
      success: true,
      data: { purchases },
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

// Get user purchases
const getUserPurchases = async (req, res, next) => {
  try {
    const { type, format, page = 1, limit = 10, paymentStatus } = req.query;

    const query = { user: req.user.id };
    if (type) query.type = type;
    if (format) query.format = format;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const purchases = await Purchase.find(query)
      .populate('book judgment seller')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Purchase.countDocuments(query);

    res.status(200).json({
      success: true,
      data: { purchases },
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

// Get seller purchases (for admin/superadmin)
const getSellerPurchases = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, paymentStatus } = req.query;

    const query = { seller: req.user.id, paymentStatus: 'completed' };
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const purchases = await Purchase.find(query)
      .populate('user', 'firstName lastName email')
      .populate('book judgment')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Purchase.countDocuments(query);

    // Calculate total earnings
    const totalEarnings = purchases.reduce((sum, purchase) => {
      return sum + purchase.commission.sellerAmount;
    }, 0);

    res.status(200).json({
      success: true,
      data: { 
        purchases,
        totalEarnings,
        totalSales: total
      },
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

// Get purchase by ID
const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('book judgment seller')
      .populate('payment');

    if (!purchase) {
      return next(new AppError('Purchase not found', 404));
    }

    // Users can only see their own purchases unless superadmin
    if (req.user.role !== 'superadmin' && 
        purchase.user._id.toString() !== req.user.id &&
        purchase.seller._id.toString() !== req.user.id) {
      return next(new AppError('Access denied', 403));
    }

    res.status(200).json({
      success: true,
      data: { purchase },
    });
  } catch (error) {
    next(error);
  }
};

// Update payment status (Superadmin only)
const updatePaymentStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can update payment status', 403));
    }
    
    const { paymentStatus } = req.body;

    if (!['pending', 'completed', 'failed', 'refunded'].includes(paymentStatus)) {
      return next(new AppError('Invalid payment status', 400));
    }

    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus,
        'paymentDetails.status': paymentStatus,
        'paymentDetails.timestamp': new Date(),
      },
      { new: true }
    ).populate('book judgment user seller');

    if (!purchase) {
      return next(new AppError('Purchase not found', 404));
    }

    // If payment completed, distribute earnings
    if (paymentStatus === 'completed' && purchase.earningsStatus === 'pending') {
      await distributePurchaseEarnings(purchase);
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: { purchase },
    });
  } catch (error) {
    next(error);
  }
};

// Get purchase stats (Superadmin only)
const getPurchaseStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can view purchase stats', 403));
    }
    
    const totalPurchases = await Purchase.countDocuments();
    const completedPurchases = await Purchase.countDocuments({ paymentStatus: 'completed' });
    const pendingPurchases = await Purchase.countDocuments({ paymentStatus: 'pending' });
    
    const totalRevenue = await Purchase.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const bookPurchases = await Purchase.countDocuments({ type: 'book', paymentStatus: 'completed' });
    const judgmentPurchases = await Purchase.countDocuments({ type: 'judgment', paymentStatus: 'completed' });

    // Monthly revenue
    const monthlyRevenue = await Purchase.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    
    // Commission breakdown
    const commissionStats = await Purchase.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { 
        $group: { 
          _id: null, 
          totalSellerCommission: { $sum: '$commission.sellerAmount' },
          totalSuperadminCommission: { $sum: '$commission.superadminAmount' }
        } 
      },
    ]);
    
    // Top selling books
    const topBooks = await Purchase.aggregate([
      { $match: { type: 'book', paymentStatus: 'completed' } },
      { $group: { _id: '$book', totalSales: { $sum: 1 }, totalRevenue: { $sum: '$amount' } } },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' },
      { $project: { 
        bookId: '$_id',
        bookTitle: '$book.title',
        totalSales: 1,
        totalRevenue: 1
      }}
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPurchases,
        completedPurchases,
        pendingPurchases,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        bookPurchases,
        judgmentPurchases,
        commission: {
          totalSellerCommission: commissionStats[0]?.totalSellerCommission || 0,
          totalSuperadminCommission: commissionStats[0]?.totalSuperadminCommission || 0,
          totalCommission: (commissionStats[0]?.totalSellerCommission || 0) + 
                          (commissionStats[0]?.totalSuperadminCommission || 0)
        },
        topBooks
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user purchase stats
const getUserPurchaseStats = async (req, res, next) => {
  try {
    const userPurchases = await Purchase.find({ 
      user: req.user.id,
      paymentStatus: 'completed'
    });
    
    const totalSpent = userPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    const totalBooks = userPurchases.filter(p => p.type === 'book').length;
    const totalJudgments = userPurchases.filter(p => p.type === 'judgment').length;
    
    res.status(200).json({
      success: true,
      data: {
        totalPurchases: userPurchases.length,
        totalSpent,
        totalBooks,
        totalJudgments
      }
    });
  } catch (error) {
    next(error);
  }
};

// Check if user has purchased item
const checkPurchaseStatus = async (req, res, next) => {
  try {
    const { bookId, judgmentId, type } = req.query;
    
    if (!type || (!bookId && !judgmentId)) {
      return next(new AppError('Please provide type and item ID', 400));
    }
    
    const query = {
      user: req.user.id,
      paymentStatus: 'completed'
    };
    
    if (type === 'book') {
      query.book = bookId;
    } else if (type === 'judgment') {
      query.judgment = judgmentId;
    }
    
    const purchase = await Purchase.findOne(query)
      .populate('book judgment');
    
    res.status(200).json({
      success: true,
      data: {
        hasPurchased: !!purchase,
        purchase: purchase || null,
        canDownload: !!purchase && purchase.paymentStatus === 'completed'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchase,
  completePurchase,
  getAllPurchases,
  getUserPurchases,
  getSellerPurchases,
  getPurchaseById,
  updatePaymentStatus,
  getPurchaseStats,
  getUserPurchaseStats,
  checkPurchaseStatus,
  distributePurchaseEarnings
};