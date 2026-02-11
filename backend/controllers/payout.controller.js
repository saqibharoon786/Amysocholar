const User = require('../models/user.model');
const AppError = require('../utils/appError');

// ======================
// USER PAYOUT CONTROLLERS (For Admins)
// ======================

// User: Update payment information
const updatePaymentInfo = async (req, res, next) => {
  try {
    const { jazzcashNumber, easypaisaNumber, bankAccount } = req.body;
    
    // Validate at least one field is provided
    if (!jazzcashNumber && !easypaisaNumber && !bankAccount) {
      return next(new AppError('Please provide at least one payment method to update', 400));
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Prepare payment info object
    const paymentInfo = {};
    
    // Only include fields that are provided
    if (jazzcashNumber !== undefined) {
      if (jazzcashNumber === '' || jazzcashNumber === null) {
        // Clear JazzCash number
        paymentInfo.jazzcashNumber = '';
      } else if (/^03\d{9}$/.test(jazzcashNumber)) {
        paymentInfo.jazzcashNumber = jazzcashNumber;
      } else {
        return next(new AppError('JazzCash number must be 11 digits starting with 03', 400));
      }
    }
    
    if (easypaisaNumber !== undefined) {
      if (easypaisaNumber === '' || easypaisaNumber === null) {
        // Clear EasyPaisa number
        paymentInfo.easypaisaNumber = '';
      } else if (/^03\d{9}$/.test(easypaisaNumber)) {
        paymentInfo.easypaisaNumber = easypaisaNumber;
      } else {
        return next(new AppError('EasyPaisa number must be 11 digits starting with 03', 400));
      }
    }
    
    if (bankAccount !== undefined) {
      if (bankAccount === null) {
        // Clear bank account
        paymentInfo.bankAccount = {
          accountTitle: '',
          accountNumber: '',
          bankName: '',
          iban: ''
        };
      } else {
        // Validate bank account object
        if (typeof bankAccount !== 'object') {
          return next(new AppError('Bank account must be an object', 400));
        }
        
        paymentInfo.bankAccount = {
          accountTitle: bankAccount.accountTitle || '',
          accountNumber: bankAccount.accountNumber || '',
          bankName: bankAccount.bankName || '',
          iban: bankAccount.iban || ''
        };
        
        // Validate if account number is provided, title should also be provided
        if (paymentInfo.bankAccount.accountNumber && !paymentInfo.bankAccount.accountTitle) {
          return next(new AppError('Account title is required when providing account number', 400));
        }
      }
    }
    
    console.log('Updating payment info with:', paymentInfo);
    
    // Update user's payment info
    await user.updatePaymentInfo(paymentInfo);
    
    // Refresh user data
    const updatedUser = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Payment information updated successfully',
      data: {
        paymentInfo: updatedUser.wallet.paymentInfo,
        isPayoutEligible: updatedUser.isPayoutEligible
      }
    });
  } catch (error) {
    console.error('Error updating payment info:', error);
    next(new AppError(error.message || 'Failed to update payment information', 500));
  }
};

// User: Get payment information
const getPaymentInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('wallet.paymentInfo payoutSettings');
    
    res.status(200).json({
      success: true,
      data: {
        paymentInfo: user.wallet.paymentInfo,
        payoutSettings: user.payoutSettings,
        isPayoutEligible: user.isPayoutEligible
      }
    });
  } catch (error) {
    next(error);
  }
};

// User: Request payout
const requestPayout = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    if (!amount || !paymentMethod) {
      return next(new AppError('Amount and payment method are required', 400));
    }
    
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'admin') {
      return next(new AppError('Only admins can request payouts', 403));
    }
    
    const result = await user.requestPayout(parseFloat(amount), paymentMethod);
    
    res.status(200).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// User: Get my payout requests
const getMyPayoutRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('wallet.payoutRequests wallet.availableBalance wallet.totalWithdrawn');
    
    res.status(200).json({
      success: true,
      data: {
        payoutRequests: user.wallet.payoutRequests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)),
        availableBalance: user.wallet.availableBalance,
        totalWithdrawn: user.wallet.totalWithdrawn
      }
    });
  } catch (error) {
    next(error);
  }
};

// User: Cancel payout request
const cancelPayoutRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    
    const user = await User.findById(req.user.id);
    
    const result = await user.cancelPayoutRequest(requestId);
    
    if (!result.success) {
      return next(new AppError('Failed to cancel payout request', 400));
    }
    
    res.status(200).json({
      success: true,
      message: 'Payout request cancelled successfully',
      data: {
        availableBalance: user.wallet.availableBalance,
        amountReturned: result.amount
      }
    });
  } catch (error) {
    next(error);
  }
};

// User: Get payout statistics
const getPayoutStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('wallet');
    
    const stats = {
      totalEarnings: user.wallet.totalEarnings,
      availableBalance: user.wallet.availableBalance,
      pendingBalance: user.wallet.pendingBalance,
      totalWithdrawn: user.wallet.totalWithdrawn,
      payoutRequests: {
        total: user.wallet.payoutRequests.length,
        pending: user.wallet.payoutRequests.filter(req => req.status === 'pending').length,
        approved: user.wallet.payoutRequests.filter(req => req.status === 'approved').length,
        completed: user.wallet.payoutRequests.filter(req => req.status === 'completed').length,
        rejected: user.wallet.payoutRequests.filter(req => req.status === 'rejected').length
      },
      lastPayoutDate: user.wallet.lastPayoutDate,
      isPayoutEligible: user.isPayoutEligible
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// SUPERVISOR PAYOUT CONTROLLERS (For Superadmin)
// ======================

// Superadmin: Get all pending payout requests
const getPendingPayoutRequests = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can view all payout requests', 403));
    }
    
    const users = await User.find({
      'wallet.payoutRequests': {
        $elemMatch: { status: 'pending' }
      },
      role: 'admin'
    }).select('firstName lastName email phone wallet.paymentInfo wallet.payoutRequests wallet.availableBalance cnic.verified');
    
    const pendingRequests = [];
    
    users.forEach(user => {
      const pendingUserRequests = user.wallet.payoutRequests.filter(
        req => req.status === 'pending'
      );
      
      pendingUserRequests.forEach(request => {
        pendingRequests.push({
          requestId: request.requestId,
          userId: user._id,
          userName: user.fullName,
          userEmail: user.email,
          userPhone: user.phone,
          amount: request.amount,
          paymentMethod: request.paymentMethod,
          requestedAt: request.requestedAt,
          cnicVerified: user.cnic.verified,
          paymentInfo: user.wallet.paymentInfo,
          availableBalance: user.wallet.availableBalance
        });
      });
    });
    
    // Sort by requested date (oldest first)
    pendingRequests.sort((a, b) => new Date(a.requestedAt) - new Date(b.requestedAt));
    
    res.status(200).json({
      success: true,
      count: pendingRequests.length,
      data: pendingRequests
    });
  } catch (error) {
    next(error);
  }
};

// Superadmin: Approve payout request
const approvePayoutRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can approve payout requests', 403));
    }
    
    const { requestId } = req.params;
    
    // Find user with this pending request
    const user = await User.findOne({
      'wallet.payoutRequests.requestId': requestId,
      'wallet.payoutRequests.status': 'pending'
    });
    
    if (!user) {
      return next(new AppError('Payout request not found or already processed', 404));
    }
    
    const request = await user.approvePayoutRequest(requestId, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Payout request approved',
      data: {
        requestId: request.requestId,
        userId: user._id,
        userName: user.fullName,
        amount: request.amount,
        paymentMethod: request.paymentMethod,
        status: request.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// Superadmin: Complete payout request (after manual payment)
const completePayoutRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can complete payout requests', 403));
    }
    const { requestId } = req.params;
    const { transactionRef, paymentScreenshot, notes } = req.body;
    console.log ("The body is", req.body)
    // if (!transactionRef || !paymentScreenshot) {
    //   return next(new AppError('Transaction reference and payment screenshot are required', 400));
    // }
    
    // Find user with this approved request
    const user = await User.findOne({
      'wallet.payoutRequests.requestId': requestId,
      'wallet.payoutRequests.status': 'approved'
    });
    
    if (!user) {
      return next(new AppError('Approved payout request not found', 404));
    }
    
    const request = await user.completePayoutRequest(
      requestId, 
      transactionRef, 
      paymentScreenshot, 
      notes, 
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: 'Payout completed successfully',
      data: {
        requestId: request.requestId,
        userId: user._id,
        userName: user.fullName,
        amount: request.amount,
        paymentMethod: request.paymentMethod,
        transactionRef: request.transactionRef,
        processedAt: request.processedAt,
        totalWithdrawn: user.wallet.totalWithdrawn,
        availableBalance: user.wallet.availableBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

// Superadmin: Reject payout request
const rejectPayoutRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can reject payout requests', 403));
    }
    
    const { requestId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return next(new AppError('Rejection reason is required', 400));
    }
    
    // Find user with this pending request
    const user = await User.findOne({
      'wallet.payoutRequests.requestId': requestId,
      'wallet.payoutRequests.status': 'pending'
    });
    
    if (!user) {
      return next(new AppError('Payout request not found', 404));
    }
    
    const request = await user.rejectPayoutRequest(requestId, reason, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Payout request rejected',
      data: {
        requestId: request.requestId,
        userId: user._id,
        userName: user.fullName,
        amount: request.amount,
        rejectedReason: request.rejectedReason,
        availableBalance: user.wallet.availableBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

// Superadmin: Get all payout history
const getAllPayoutHistory = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can view all payout history', 403));
    }
    
    const { startDate, endDate, status, paymentMethod } = req.query;
    
    const users = await User.find({
      role: 'admin',
      'wallet.payoutRequests': { $exists: true, $ne: [] }
    }).select('firstName lastName email wallet.payoutRequests');
    
    const allPayouts = [];
    
    users.forEach(user => {
      user.wallet.payoutRequests.forEach(request => {
        // Apply filters
        if (startDate && new Date(request.requestedAt) < new Date(startDate)) return;
        if (endDate && new Date(request.requestedAt) > new Date(endDate)) return;
        if (status && request.status !== status) return;
        if (paymentMethod && request.paymentMethod !== paymentMethod) return;
        
        allPayouts.push({
          requestId: request.requestId,
          userId: user._id,
          userName: user.fullName,
          userEmail: user.email,
          amount: request.amount,
          paymentMethod: request.paymentMethod,
          status: request.status,
          requestedAt: request.requestedAt,
          processedAt: request.processedAt,
          transactionRef: request.transactionRef,
          processedBy: request.processedBy,
          rejectedReason: request.rejectedReason
        });
      });
    });
    
    // Sort by processed date or requested date (newest first)
    allPayouts.sort((a, b) => {
      const dateA = a.processedAt || a.requestedAt;
      const dateB = b.processedAt || b.requestedAt;
      return new Date(dateB) - new Date(dateA);
    });
    
    // Calculate statistics
    const stats = {
      totalPayouts: allPayouts.length,
      totalAmount: allPayouts.reduce((sum, payout) => sum + payout.amount, 0),
      pendingCount: allPayouts.filter(p => p.status === 'pending').length,
      approvedCount: allPayouts.filter(p => p.status === 'approved').length,
      completedCount: allPayouts.filter(p => p.status === 'completed').length,
      rejectedCount: allPayouts.filter(p => p.status === 'rejected').length
    };
    
    res.status(200).json({
      success: true,
      stats,
      count: allPayouts.length,
      data: allPayouts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // User controllers
  updatePaymentInfo,
  getPaymentInfo,
  requestPayout,
  getMyPayoutRequests,
  cancelPayoutRequest,
  getPayoutStats,
  
  // Superadmin controllers
  getPendingPayoutRequests,
  approvePayoutRequest,
  completePayoutRequest,
  rejectPayoutRequest,
  getAllPayoutHistory
};