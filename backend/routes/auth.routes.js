const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const {protect} = require('../middleware/auth.middleware');
const rateLimit = require('../middleware/rateLimit');
const multer = require('../config/multer');

// Public routes
router.post(
  '/register',
//   rateLimit.authLimiter,
  authController.register
);

router.post(
  '/login',
  // rateLimit.authLimiter,
  authController.login
);

router.post(
  '/verify-email',
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  // rateLimit.authLimiter,
  authController.resendVerification
);

router.post(
  '/forgot-password',
  // rateLimit.authLimiter,
  authController.forgotPassword
);

router.patch(
  '/reset-password',
  // rateLimit.strictLimiter,
  authController.resetPassword
);

// // Protected routes (require authentication)
router.use(protect);

router.get(
  '/me',
  authController.getMe
);


// router.patch(
//   '/change-password',
//   rateLimit.strictLimiter,
//   authController.changePassword
// );


router.post(
  '/logout',
  authController.logout
);

module.exports = router;