const Commission = require('../models/commission.model');
const Payment = require('../models/payment.model');
const User = require('../models/user.model');
const Book = require('../models/book.model');
const AppError = require('../utils/appError');

/**
 * Get my commissions (for sellers)
 */
const getMyCommissions = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { seller: req.user.id };
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get commissions with pagination
    const commissions = await Commission.find(query)
      .populate('book', 'title coverImages price')
      .populate('buyer', 'firstName lastName email')
      .populate('payout')
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Commission.countDocuments(query);

    // Calculate summary statistics
    const summary = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: 1 },
          totalSellerAmount: { $sum: '$sellerAmount' },
          totalSuperadminAmount: { $sum: '$superadminAmount' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'PROCESSED'] }, 1, 0] }
          },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$status', 'PAID_OUT'] }, 1, 0] }
          }
        }
      }
    ]);

    const summaryData = summary[0] || {
      totalCommissions: 0,
      totalSellerAmount: 0,
      totalSuperadminAmount: 0,
      pendingCount: 0,
      paidCount: 0
    };

    res.status(200).json({
      success: true,
      data: {
        commissions,
        summary: {
          ...summaryData,
          availableBalance: summaryData.totalSellerAmount - (summaryData.paidCount * summaryData.totalSellerAmount / summaryData.totalCommissions || 0)
        }
      },
      pagination: {
        current: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all commissions (Superadmin only)
 */
const getAllCommissions = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can view all commissions', 403));
    }
    const { 
      page = 1, 
      limit = 20, 
      sellerId, 
      status, 
      sellerType,
      startDate,
      endDate,
      search
    } = req.query;

    const query = {};
    
    // Filter by seller
    if (sellerId) {
      query.seller = sellerId;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by seller type
    if (sellerType) {
      query.sellerType = sellerType;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Search by book title or buyer name
    if (search) {
      query.$or = [
        { 'book.title': { $regex: search, $options: 'i' } },
        { 'buyer.firstName': { $regex: search, $options: 'i' } },
        { 'buyer.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    // Get commissions with population
    const commissions = await Commission.find(query)
      .populate('seller', 'firstName lastName email role')
      .populate('buyer', 'firstName lastName email')
      .populate('book', 'title price')
      .populate('payout', 'status amount')
      .populate('payment', 'transactionRef status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Commission.countDocuments(query);

    // Get commission statistics
    const stats = await getCommissionStatsInternal(query);

    res.status(200).json({
      success: true,
      data: {
        commissions,
        stats
      },
      pagination: {
        current: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get commission statistics (Superadmin only)
 */
const getCommissionStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can view commission stats', 403));
    }

    const { startDate, endDate, sellerType } = req.query;

    const query = {};
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Filter by seller type
    if (sellerType) {
      query.sellerType = sellerType;
    }

    const stats = await getCommissionStatsInternal(query);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get commission by ID
 */
const getCommissionById = async (req, res, next) => {
  try {
    const commission = await Commission.findById(req.params.id)
      .populate('seller', 'firstName lastName email wallet')
      .populate('buyer', 'firstName lastName email')
      .populate('book', 'title author price coverImages')
      .populate('payment', 'transactionRef jazzcashResponse')
      .populate('payout', 'status amount externalRef');

    if (!commission) {
      return next(new AppError('Commission not found', 404));
    }

    // Check permissions
    if (req.user.role !== 'superadmin' && 
        commission.seller._id.toString() !== req.user.id) {
      return next(new AppError('You are not authorized to view this commission', 403));
    }

    // Get related commissions for the same book/seller
    const relatedCommissions = await Commission.find({
      seller: commission.seller._id,
      book: commission.book._id,
      _id: { $ne: commission._id }
    })
    .limit(5)
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        commission,
        relatedCommissions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get commissions by book
 */
const getCommissionsByBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = { book: bookId };
    
    // If not superadmin, only show their own commissions
    if (req.user.role !== 'superadmin') {
      query.seller = req.user.id;
    }

    const commissions = await Commission.find(query)
      .populate('seller', 'firstName lastName')
      .populate('buyer', 'firstName lastName')
      .populate('payout', 'status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Commission.countDocuments(query);

    // Get book details
    const book = await Book.findById(bookId).select('title author price');

    // Calculate book earnings
    const earnings = await Commission.aggregate([
      { $match: { book: bookId } },
      {
        $group: {
          _id: '$seller',
          totalSales: { $sum: 1 },
          totalEarnings: { $sum: '$sellerAmount' },
          superadminCommission: { $sum: '$superadminAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        book,
        commissions,
        earnings
      },
      pagination: {
        current: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get daily commission report
 */
const getDailyCommissionReport = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can view daily reports', 403));
    }

    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get commissions for the day
    const dailyCommissions = await Commission.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    .populate('seller', 'firstName lastName email')
    .populate('book', 'title')
    .sort({ createdAt: -1 });

    // Calculate daily totals
    const dailyStats = await Commission.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalSellerAmount: { $sum: '$sellerAmount' },
          totalSuperadminAmount: { $sum: '$superadminAmount' },
          bySellerType: {
            $push: {
              sellerType: '$sellerType',
              sellerAmount: '$sellerAmount',
              superadminAmount: '$superadminAmount'
            }
          }
        }
      }
    ]);

    // Get top sellers for the day
    const topSellers = await Commission.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: '$seller',
          totalSales: { $sum: 1 },
          totalEarnings: { $sum: '$sellerAmount' }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 }
    ]);

    // Populate seller details for top sellers
    const topSellersWithDetails = await Promise.all(
      topSellers.map(async (seller) => {
        const sellerDetails = await User.findById(seller._id)
          .select('firstName lastName email phone');
        return {
          ...seller,
          seller: sellerDetails
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        date: startOfDay.toISOString().split('T')[0],
        commissions: dailyCommissions,
        summary: dailyStats[0] || {
          totalCommissions: 0,
          totalAmount: 0,
          totalSellerAmount: 0,
          totalSuperadminAmount: 0
        },
        topSellers: topSellersWithDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get commission summary for dashboard
 */
const getCommissionSummary = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'day':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const query = { createdAt: { $gte: startDate, $lte: endDate } };
    
    // If not superadmin, only show their own data
    if (req.user.role !== 'superadmin') {
      query.seller = req.user.id;
    }

    // Get summary statistics
    const summary = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalSellerAmount: { $sum: '$sellerAmount' },
          totalSuperadminAmount: { $sum: '$superadminAmount' },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'PROCESSED'] }, '$sellerAmount', 0]
            }
          },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'PAID_OUT'] }, '$sellerAmount', 0]
            }
          }
        }
      }
    ]);

    // Get commission trend by day
    const dailyTrend = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          sellerAmount: { $sum: '$sellerAmount' },
          superadminAmount: { $sum: '$superadminAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top performing books
    const topBooks = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$book',
          salesCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          sellerEarnings: { $sum: '$sellerAmount' }
        }
      },
      { $sort: { salesCount: -1 } },
      { $limit: 5 }
    ]);

    // Populate book details
    const topBooksWithDetails = await Promise.all(
      topBooks.map(async (book) => {
        const bookDetails = await Book.findById(book._id)
          .select('title author coverImages price');
        return {
          ...book,
          book: bookDetails
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        period,
        summary: summary[0] || {
          totalCommissions: 0,
          totalAmount: 0,
          totalSellerAmount: 0,
          totalSuperadminAmount: 0,
          pendingAmount: 0,
          paidAmount: 0
        },
        dailyTrend,
        topBooks: topBooksWithDetails,
        startDate,
        endDate
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export commissions to CSV (Superadmin only)
 */
const exportCommissionsToCSV = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can export commissions', 403));
    }

    const { startDate, endDate, sellerId, status } = req.query;

    const query = {};
    
    // Apply filters
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    if (sellerId) {
      query.seller = sellerId;
    }
    
    if (status) {
      query.status = status;
    }

    // Get commissions with necessary data
    const commissions = await Commission.find(query)
      .populate('seller', 'firstName lastName email')
      .populate('buyer', 'firstName lastName email')
      .populate('book', 'title')
      .populate('payout', 'status')
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvData = [
      [
        'ID',
        'Date',
        'Seller',
        'Buyer',
        'Book',
        'Total Amount',
        'Seller Amount',
        'Superadmin Amount',
        'Status',
        'Payout Status',
        'Commission Percentage'
      ]
    ];

    commissions.forEach(commission => {
      csvData.push([
        commission._id,
        commission.createdAt.toISOString(),
        `${commission.seller?.firstName || ''} ${commission.seller?.lastName || ''}`,
        `${commission.buyer?.firstName || ''} ${commission.buyer?.lastName || ''}`,
        commission.book?.title || '',
        commission.totalAmount,
        commission.sellerAmount,
        commission.superadminAmount,
        commission.status,
        commission.payout?.status || 'N/A',
        `${commission.commissionPercentage}%`
      ]);
    });

    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');

    // Set headers for file download
    const filename = `commissions_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.status(200).send(csvString);
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get commission statistics
 */
const getCommissionStatsInternal = async (query = {}) => {
  try {
    // Overall statistics
    const overallStats = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalSellerAmount: { $sum: '$sellerAmount' },
          totalSuperadminAmount: { $sum: '$superadminAmount' },
          averageCommission: { $avg: '$commissionPercentage' }
        }
      }
    ]);

    // Statistics by status
    const statusStats = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$sellerAmount' }
        }
      }
    ]);

    // Statistics by seller type
    const sellerTypeStats = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$sellerType',
          count: { $sum: 1 },
          totalSellerAmount: { $sum: '$sellerAmount' },
          totalSuperadminAmount: { $sum: '$superadminAmount' }
        }
      }
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Commission.aggregate([
      {
        $match: {
          ...query,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          sellerAmount: { $sum: '$sellerAmount' },
          superadminAmount: { $sum: '$superadminAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top sellers
    const topSellers = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$seller',
          totalSales: { $sum: 1 },
          totalEarnings: { $sum: '$sellerAmount' },
          avgSaleAmount: { $avg: '$sellerAmount' }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 }
    ]);

    // Top books
    const topBooks = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$book',
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 }
    ]);

    return {
      overall: overallStats[0] || {
        totalCommissions: 0,
        totalAmount: 0,
        totalSellerAmount: 0,
        totalSuperadminAmount: 0,
        averageCommission: 0
      },
      byStatus: statusStats,
      bySellerType: sellerTypeStats,
      monthlyTrend,
      topSellers,
      topBooks
    };
  } catch (error) {
    console.error('Error getting commission stats:', error);
    throw error;
  }
};

/**
 * Update commission status (Superadmin only)
 */
const updateCommissionStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can update commission status', 403));
    }

    const { commissionId } = req.params;
    const { status, notes } = req.body;

    if (!['PROCESSED', 'PAID_OUT'].includes(status)) {
      return next(new AppError('Invalid status. Must be PROCESSED or PAID_OUT', 400));
    }

    const commission = await Commission.findById(commissionId);
    
    if (!commission) {
      return next(new AppError('Commission not found', 404));
    }

    // Update commission
    commission.status = status;
    
    if (status === 'PAID_OUT') {
      commission.paidOutAt = new Date();
    }
    
    if (notes) {
      commission.notes = notes;
    }

    await commission.save();

    // If marking as paid out, update seller's wallet
    if (status === 'PAID_OUT') {
      const seller = await User.findById(commission.seller);
      if (seller) {
        seller.wallet.availableBalance = Math.max(0, seller.wallet.availableBalance - commission.sellerAmount);
        await seller.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Commission status updated to ${status}`,
      data: { commission }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCommissions,
  getAllCommissions,
  getCommissionStats,
  getCommissionById,
  getCommissionsByBook,
  getDailyCommissionReport,
  getCommissionSummary,
  exportCommissionsToCSV,
  updateCommissionStatus
};