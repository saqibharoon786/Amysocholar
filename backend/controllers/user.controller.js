const User = require('../models/user.model');
const { request } = require('express');
// const Book = require('../models/book.model');
// const Purchase = require('../models/purchase.model');
const AppError = require('../utils/appError');

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: { user: user.getPublicProfile() },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'dateOfBirth', 'gender',
      'profession', 'qualification', 'experience', 'bio', 'address'
    ];
    
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: { user: user.getPublicProfile() },
    });
  } catch (error) {
    next(error);
  }
};

// Update password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
console.log("The user is", user)
    if (!(await user.correctPassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile image
const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: req.file.path },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: { user: user.getPublicProfile() },
    });
  } catch (error) {
    next(error);
  }
};

// Verify CNIC
const verifyCNIC = async (req, res, next) => {
  try {
    const { cnicNumber } = req.body;

    // These are the REAL field names multer is expecting
    if (!req.files?.cnicFront?.[0] || !req.files?.cnicBack?.[0]) {
      return next(new AppError("Both CNIC front and back images are required", 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'cnic.number': cnicNumber,
        'cnic.frontImage': req.files.cnicFront[0].path,    // ← changed
        'cnic.backImage': req.files.cnicBack[0].path,      // ← changed
        'cnic.verified': false,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'CNIC submitted for verification',
      data: { user: user.getPublicProfile() },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (Superadmin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password -otp -otpExpires')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: { users },
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

// // Get user by ID (Superadmin only)
// const getUserById = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.params.id).select('-password -otp -otpExpires');
    
//     if (!user) {
//       return next(new AppError('User not found', 404));
//     }

//     res.status(200).json({
//       success: true,
//       data: { user },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Update user (Superadmin only)
// const updateUser = async (req, res, next) => {
//   try {
//     const { role, isActive, isVerified, cnic } = req.body;
    
//     const updateData = {};
//     if (role) updateData.role = role;
//     if (isActive !== undefined) updateData.isActive = isActive;
//     if (isVerified !== undefined) updateData.isVerified = isVerified;
//     if (cnic?.verified !== undefined) updateData['cnic.verified'] = cnic.verified;

//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true, runValidators: true }
//     ).select('-password -otp -otpExpires');

//     if (!user) {
//       return next(new AppError('User not found', 404));
//     }

//     res.status(200).json({
//       success: true,
//       data: { user },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Delete user (Superadmin only)
// const deleteUser = async (req, res, next) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
    
//     if (!user) {
//       return next(new AppError('User not found', 404));
//     }

//     res.status(200).json({
//       success: true,
//       message: 'User deleted successfully',
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Deactivate user (Superadmin only)
// const deactivateUser = async (req, res, next) => {
//   try {
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       { isActive: false },
//       { new: true }
//     ).select('-password -otp -otpExpires');

//     if (!user) {
//       return next(new AppError('User not found', 404));
//     }

//     res.status(200).json({
//       success: true,
//       message: 'User deactivated successfully',
//       data: { user },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get admin stats
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const pendingVerifications = await User.countDocuments({ 'cnic.verified': false });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalCustomers,
        pendingVerifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// // Get customer stats
// const getCustomerStats = async (req, res, next) => {
//   try {
//     const totalPurchases = await Purchase.countDocuments({ user: req.user.id });
//     const totalFavorites = await require('../models/favorite.model').countDocuments({ user: req.user.id });
    
//     // Calculate total spent
//     const purchases = await Purchase.find({ user: req.user.id, paymentStatus: 'completed' });
//     const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

//     res.status(200).json({
//       success: true,
//       data: {
//         totalPurchases,
//         totalFavorites,
//         totalSpent,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  uploadProfileImage,
  verifyCNIC,
  getAllUsers,
//   getUserById,
//   updateUser,
//   deleteUser,
//   deactivateUser,
  getAdminStats,
//   getCustomerStats,
};