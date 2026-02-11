const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendVerificationCode, sendPasswordResetCode } = require('../utils/2FA/sendVerificationCode');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// ===================== Helper Functions =====================

// Generate JWT Token
const signToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Create and send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user: user.getProfile ? user.getProfile() : user,
    },
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ===================== Controller Functions =====================

// REGISTER
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, verificationMethod = "email", role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email address.',
      });
    }

    console.log('Creating user and sending verification code...', email, verificationMethod);
    // Generate OTP
    const verificationCode = generateOTP();

    // Try sending OTP FIRST
    await sendVerificationCode(
      verificationMethod,
      verificationCode,
      `${firstName} ${lastName}`,
      email,
      phone
    );

    // ONLY create user if email/SMS succeeds
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      emailVerificationToken: crypto
        .createHash('sha256')
        .update(verificationCode)
        .digest('hex'),
      emailVerificationExpires: Date.now() + 10 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Verification code sent successfully.',
      data: {
        user: newUser,
        verificationMethod,
        expiresIn: '10 minutes',
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.',
    });
  }
};


// VERIFY EMAIL WITH OTP
const verifyEmail = async (req, res, next) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(verificationCode).digest('hex');

    const user = await User.findOne({
      email,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code.',
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Create and send token after successful verification
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// RESEND VERIFICATION OTP
const resendVerification = async (req, res, next) => {
  try {
    const { email, verificationMethod = "email" } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.emailVerified)
      return res.status(400).json({ success: false, message: 'Email already verified.' });

    // Generate new OTP
    const verificationCode = generateOTP();

    // Store new OTP
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationCode)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Resend OTP
    try {
      const result = await sendVerificationCode(
        verificationMethod,
        verificationCode,
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.phone,
        res
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      res.status(200).json({
        success: true,
        message: result.message,
        expiresIn: '10 minutes'
      });

    } catch (err) {
      console.error('Resend verification code failed:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to resend verification code. Please try again.',
      });
    }

  } catch (error) {
    next(error);
  }
};

// LOGIN (Remains the same, but you might want to add OTP verification for login too)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password)))
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password.',
      });

    if (!user.isActive)
      return res.status(401).json({
        success: false,
        message: 'Your account is deactivated. Please contact support.',
      });

    // Optional: Add 2FA for login
    if (!user.emailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// FORGOT PASSWORD (You can also implement OTP here)
const forgotPassword = async (req, res, next) => {
  try {
    const { email, verificationMethod = "email" } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found.' });

    // Generate OTP for password reset
    const resetCode = generateOTP();
    user.passwordResetToken = crypto.createHash('sha256').update(resetCode).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP for password reset
    try {
      const result = await sendVerificationCode(
        verificationMethod,
        resetCode,
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.phone,
        res
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      res.status(200).json({
        success: true,
        message: result.message,
        expiresIn: '10 minutes'
      });

    } catch (err) {
      console.error('Password reset code sending failed:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset code. Please try again.',
      });
    }

  } catch (error) {
    next(error);
  }
};

// RESET PASSWORD WITH OTP
const resetPassword = async (req, res, next) => {
  try {
    const { email, verificationCode, password } = req.body;

    if (!email || !verificationCode || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, verification code and new password.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(verificationCode).digest('hex');

    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code.',
      });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Other functions remain the same...
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(currentPassword, user.password)))
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });

    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// GET CURRENT USER
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Remove token on client side.',
  });
};

// ===================== Exports =====================
module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  logout,
};