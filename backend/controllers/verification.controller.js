const User = require('../models/user.model');
const AppError = require('../utils/appError');

// ======================
// CNIC VERIFICATION CONTROLLERS
// ======================

// Superadmin: Get all pending CNIC verifications
const getPendingCNICVerifications = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can view pending CNIC verifications', 403));
    }
    
    const users = await User.find({
      'cnic.number': { $ne: null },
      'cnic.verified': false,
      role: { $in: ['admin', 'customer'] }
    }).select('firstName lastName email phone cnic profileImage role createdAt');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Superadmin: Verify CNIC
const verifyCNIC = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can verify CNIC', 403));
    }
    
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Check if CNIC information exists
    if (!user.cnic.number) {
      return next(new AppError('CNIC number not found', 400));
    }
    
    // Check if front and back images exist
    if (!user.cnic.frontImage || !user.cnic.backImage) {
      return next(new AppError('CNIC images are missing', 400));
    }
    

    
    await user.verifyCNIC(req.user.id);
    return res.send( verifyCNIC(req.user.id) )
    // Refresh the user document to get updated data
    const updatedUser = await User.findById(userId);
    
    res.status(200).json({
      success: true,
      message: 'CNIC verified successfully',
      data: {
        userId: updatedUser._id,
        fullName: updatedUser.fullName,
        cnic: {
          number: updatedUser.cnic.number,
          verified: updatedUser.cnic.verified,
          verifiedAt: updatedUser.cnic.verifiedAt,
          verifiedBy: updatedUser.cnic.verifiedBy,
        },
        isVerified: updatedUser.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// Superadmin: Reject CNIC
const rejectCNIC = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can reject CNIC', 403));
    }
    
    const { userId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return next(new AppError('Rejection reason is required', 400));
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    await user.rejectCNIC(req.user.id, reason);
    
    res.status(200).json({
      success: true,
      message: 'CNIC rejected',
      data: {
        userId: user._id,
        fullName: user.fullName,
        cnicVerified: user.cnic.verified,
        rejectionReason: reason
      }
    });
  } catch (error) {
    next(error);
  }
};

// ======================
// PAYMENT METHOD VERIFICATION CONTROLLERS
// ======================

// Superadmin: Get all pending payment method verifications
const getPendingPaymentVerifications = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can view pending payment verifications', 403));
    }
    
    const users = await User.find({
      $or: [
        { 
          'wallet.paymentInfo.jazzcashNumber': { $ne: '' },
          'wallet.paymentInfo.jazzcashVerified': false
        },
        { 
          'wallet.paymentInfo.easypaisaNumber': { $ne: '' },
          'wallet.paymentInfo.easypaisaVerified': false
        },
        { 
          'wallet.paymentInfo.bankAccount.accountNumber': { $ne: '' },
          'wallet.paymentInfo.bankAccount.verified': false
        }
      ],
      'cnic.verified': true,
      role: { $in: ['admin', 'customer'] }
    }).select('firstName lastName email phone wallet.paymentInfo cnic.verified role');
    
    const pendingVerifications = [];
    
    users.forEach(user => {
      if (user.wallet.paymentInfo.jazzcashNumber && !user.wallet.paymentInfo.jazzcashVerified) {
        pendingVerifications.push({
          userId: user._id,
          fullName: user.fullName,
          email: user.email,
          method: 'jazzcash',
          number: user.wallet.paymentInfo.jazzcashNumber,
          verified: false
        });
      }
      
      if (user.wallet.paymentInfo.easypaisaNumber && !user.wallet.paymentInfo.easypaisaVerified) {
        pendingVerifications.push({
          userId: user._id,
          fullName: user.fullName,
          email: user.email,
          method: 'easypaisa',
          number: user.wallet.paymentInfo.easypaisaNumber,
          verified: false
        });
      }
      
      if (user.wallet.paymentInfo.bankAccount.accountNumber && !user.wallet.paymentInfo.bankAccount.verified) {
        pendingVerifications.push({
          userId: user._id,
          fullName: user.fullName,
          email: user.email,
          method: 'bank',
          bankName: user.wallet.paymentInfo.bankAccount.bankName,
          accountTitle: user.wallet.paymentInfo.bankAccount.accountTitle,
          accountNumber: user.wallet.paymentInfo.bankAccount.accountNumber,
          verified: false
        });
      }
    });
    
    res.status(200).json({
      success: true,
      count: pendingVerifications.length,
      data: pendingVerifications
    });
  } catch (error) {
    next(error);
  }
};

// Superadmin: Verify JazzCash number
const verifyJazzCash = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can verify payment methods', 403));
    }
    
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    if (!user.wallet.paymentInfo.jazzcashNumber) {
      return next(new AppError('JazzCash number not found', 400));
    }
    
    await user.verifyJazzCash(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'JazzCash number verified successfully',
      data: {
        userId: user._id,
        fullName: user.fullName,
        jazzcashNumber: user.wallet.paymentInfo.jazzcashNumber,
        verified: user.wallet.paymentInfo.jazzcashVerified,
        verifiedBy: req.user.id,
        verifiedAt: user.wallet.paymentInfo.jazzcashVerifiedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Superadmin: Verify EasyPaisa number
const verifyEasyPaisa = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can verify payment methods', 403));
    }
    
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    if (!user.wallet.paymentInfo.easypaisaNumber) {
      return next(new AppError('EasyPaisa number not found', 400));
    }
    
    await user.verifyEasyPaisa(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'EasyPaisa number verified successfully',
      data: {
        userId: user._id,
        fullName: user.fullName,
        easypaisaNumber: user.wallet.paymentInfo.easypaisaNumber,
        verified: user.wallet.paymentInfo.easypaisaVerified,
        verifiedBy: req.user.id,
        verifiedAt: user.wallet.paymentInfo.easypaisaVerifiedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Superadmin: Verify Bank Account
const verifyBankAccount = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return next(new AppError('Only superadmin can verify payment methods', 403));
    }
    
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    if (!user.wallet.paymentInfo.bankAccount.accountNumber) {
      return next(new AppError('Bank account not found', 400));
    }
    
    await user.verifyBankAccount(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Bank account verified successfully',
      data: {
        userId: user._id,
        fullName: user.fullName,
        bankAccount: user.wallet.paymentInfo.bankAccount,
        verified: user.wallet.paymentInfo.bankAccount.verified,
        verifiedBy: req.user.id,
        verifiedAt: user.wallet.paymentInfo.bankAccount.verifiedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingCNICVerifications,
  verifyCNIC,
  rejectCNIC,
  getPendingPaymentVerifications,
  verifyJazzCash,
  verifyEasyPaisa,
  verifyBankAccount
};