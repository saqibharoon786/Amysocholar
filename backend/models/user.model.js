const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: { 
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },

    // Role and Status
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'customer'],
      default: 'customer',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Profile Information
    profileImage: {
      url: { type: String, default: null },
      filename: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
    },

    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },

    // Professional Information
    profession: String,
    qualification: String,
    experience: Number,
    bio: {
      type: String,
      maxlength: 500,
    },

    // CNIC Verification (ENHANCED FOR SUPERVISION)
    cnic: {
      number: { 
        type: String, 
        trim: true, 
        default: null,
        validate: {
          validator: function(v) {
            return !v || /^\d{5}-\d{7}-\d{1}$/.test(v) || /^\d{13}$/.test(v);
          },
          message: 'CNIC must be 13 digits or in format 12345-1234567-1'
        }
      },
      frontImage: {
        url: { type: String, default: null },
        filename: { type: String, default: null },
        verified: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: null },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: Date,
        verificationNotes: String
      },
      backImage: {
        url: { type: String, default: null },
        filename: { type: String, default: null },
        verified: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: null },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: Date,
        verificationNotes: String
      },
      verified: { type: Boolean, default: false },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: Date,
      verificationNotes: String,
      rejectionReason: String
    },

    // Address Information
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: 'Pakistan' },
      zipCode: { type: String, trim: true },
    },

    // Wallet System (SIMPLIFIED for manual payouts)
    wallet: {
      // Earnings tracking
      totalEarnings: { type: Number, default: 0 },
      availableBalance: { type: Number, default: 0 },
      pendingBalance: { type: Number, default: 0 },
      totalWithdrawn: { type: Number, default: 0 },
      lastPayoutDate: Date,
      
      // Payment information for superadmin
      paymentInfo: {
        jazzcashNumber: { 
          type: String, 
          default: '',
          validate: {
            validator: function(v) {
              return !v || /^03\d{9}$/.test(v);
            },
            message: 'JazzCash number must be 11 digits starting with 03'
          }
        },
        jazzcashVerified: { type: Boolean, default: false },
        jazzcashVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        jazzcashVerifiedAt: Date,
        
        easypaisaNumber: { 
          type: String, 
          default: '',
          validate: {
            validator: function(v) {
              return !v || /^03\d{9}$/.test(v);
            },
            message: 'EasyPaisa number must be 11 digits starting with 03'
          }
        },
        easypaisaVerified: { type: Boolean, default: false },
        easypaisaVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        easypaisaVerifiedAt: Date,
        
        bankAccount: {
          accountTitle: { type: String, default: '' },
          accountNumber: { type: String, default: '' },
          bankName: { type: String, default: '' },
          iban: { type: String, default: '' },
          verified: { type: Boolean, default: false },
          verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          verifiedAt: Date
        }
      },
      
      // Payout requests tracking
      payoutRequests: [{
        requestId: String,
        amount: Number,
        paymentMethod: { 
          type: String, 
          enum: ['jazzcash', 'easypaisa', 'bank'] 
        },
        requestedAt: Date,
        status: { 
          type: String, 
          enum: ['pending', 'approved', 'completed', 'rejected', 'cancelled'] 
        },
        // Superadmin fills these
        transactionRef: String,
        paymentScreenshot: String,
        processedAt: Date,
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: String,
        rejectedReason: String
      }]
    },

    // Payout Settings (SIMPLIFIED)
    payoutSettings: {
      preferredMethod: { 
        type: String, 
        enum: ['jazzcash', 'easypaisa', 'bank'], 
        default: 'jazzcash'
      },
      minimumPayout: { type: Number, default: 1000 }
    },

    // Statistics
    totalBooksUploaded: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },

    // Security
    lastLogin: { type: Date, default: null },
    lastPasswordChange: Date,
    loginAttempts: { type: Number, default: 0 },
    accountLockedUntil: Date,

    // OTP Verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Fields
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin' || this.role === 'superadmin';
});

userSchema.virtual('isSuperAdmin').get(function () {
  return this.role === 'superadmin';
});

userSchema.virtual('isPayoutEligible').get(function () {
  // Check if user has verified CNIC and payment method
  if (!this.cnic.verified) return false;
  
  const preferredMethod = this.payoutSettings.preferredMethod;
  if (preferredMethod === 'jazzcash') {
    return this.wallet.paymentInfo.jazzcashVerified;
  } else if (preferredMethod === 'easypaisa') {
    return this.wallet.paymentInfo.easypaisaVerified;
  } else if (preferredMethod === 'bank') {
    return this.wallet.paymentInfo.bankAccount.verified;
  }
  return false;
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'wallet.availableBalance': -1 });
userSchema.index({ 'cnic.verified': 1 });
userSchema.index({ 'wallet.paymentInfo.jazzcashVerified': 1 });
userSchema.index({ 'wallet.payoutRequests.status': 1 });

// Password Encryption
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.lastPasswordChange = Date.now();
  next();
});

// Instance Methods
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.lastPasswordChange) {
    const changedTimestamp = parseInt(this.lastPasswordChange.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.methods.getPublicProfile = function () {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.otp;
  delete userObj.otpExpires;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpires;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;
  delete userObj.loginAttempts;
  delete userObj.accountLockedUntil;
  return userObj;
};

// ======================
// CNIC VERIFICATION METHODS
// ======================

userSchema.methods.uploadCNIC = async function(cnicData, frontImage, backImage) {
  this.cnic.number = cnicData.number;
  this.cnic.frontImage = {
    url: frontImage.url,
    filename: frontImage.filename,
    uploadedAt: new Date()
  };
  this.cnic.backImage = {
    url: backImage.url,
    filename: backImage.filename,
    uploadedAt: new Date()
  };
  this.cnic.verified = false;
  await this.save();
  return this;
};

userSchema.methods.verifyCNIC = async function(verifiedBy) {
  try {
    // Ensure frontImage and backImage are objects
    if (typeof this.cnic.frontImage === 'string') {
      this.cnic.frontImage = {
        url: this.cnic.frontImage,
        filename: this.cnic.frontImage.split('/').pop(),
        uploadedAt: new Date()
      };
    }
    
    if (typeof this.cnic.backImage === 'string') {
      this.cnic.backImage = {
        url: this.cnic.backImage,
        filename: this.cnic.backImage.split('/').pop(),
        uploadedAt: new Date()
      };
    }
    
    // Now update all verification fields
    this.cnic.verified = true;
    this.cnic.verifiedBy = verifiedBy;
    this.cnic.verifiedAt = new Date();
    
    // Update front image verification
    if (this.cnic.frontImage) {
      this.cnic.frontImage.verified = true;
      this.cnic.frontImage.verifiedBy = verifiedBy;
      this.cnic.frontImage.verifiedAt = new Date();
    }
    
    // Update back image verification
    if (this.cnic.backImage) {
      this.cnic.backImage.verified = true;
      this.cnic.backImage.verifiedBy = verifiedBy;
      this.cnic.backImage.verifiedAt = new Date();
    }
    
    this.isVerified = true;
    
    await this.save();
    return this;
  } catch (error) {
    console.error('Error in verifyCNIC:', error);
    throw error;
  }
};

userSchema.methods.rejectCNIC = async function(verifiedBy, reason) {
  this.cnic.verified = false;
  this.cnic.rejectionReason = reason;
  await this.save();
  return this;
};

// ======================
// PAYMENT METHOD VERIFICATION METHODS
// ======================

userSchema.methods.updatePaymentInfo = async function(paymentInfo) {
  try {
    
    
    // Update JazzCash
    if (paymentInfo.jazzcashNumber !== undefined) {
      // Validate JazzCash number format
      if (paymentInfo.jazzcashNumber && !/^03\d{9}$/.test(paymentInfo.jazzcashNumber)) {
        throw new Error('JazzCash number must be 11 digits starting with 03');
      }
      this.wallet.paymentInfo.jazzcashNumber = paymentInfo.jazzcashNumber || '';
      this.wallet.paymentInfo.jazzcashVerified = false; // Reset verification when number changes
    }
    
    // Update EasyPaisa
    if (paymentInfo.easypaisaNumber !== undefined) {
      // Validate EasyPaisa number format
      if (paymentInfo.easypaisaNumber && !/^03\d{9}$/.test(paymentInfo.easypaisaNumber)) {
        throw new Error('EasyPaisa number must be 11 digits starting with 03');
      }
      this.wallet.paymentInfo.easypaisaNumber = paymentInfo.easypaisaNumber || '';
      this.wallet.paymentInfo.easypaisaVerified = false; // Reset verification when number changes
    }
    
    // Update Bank Account
    if (paymentInfo.bankAccount) {
      const { accountTitle, accountNumber, bankName, iban } = paymentInfo.bankAccount;
      
      // Validate required fields for bank account
      if (accountNumber && !accountTitle) {
        throw new Error('Account title is required when adding bank account');
      }
      
      if (accountTitle) {
        this.wallet.paymentInfo.bankAccount.accountTitle = accountTitle || '';
      }
      if (accountNumber !== undefined) {
        this.wallet.paymentInfo.bankAccount.accountNumber = accountNumber || '';
      }
      if (bankName !== undefined) {
        this.wallet.paymentInfo.bankAccount.bankName = bankName || '';
      }
      if (iban !== undefined) {
        this.wallet.paymentInfo.bankAccount.iban = iban || '';
      }
      
      // Reset verification if any bank details changed
      if (accountNumber || accountTitle || bankName || iban) {
        this.wallet.paymentInfo.bankAccount.verified = false;
      }
      
    }
    
    await this.save();
    
    return this;
  } catch (error) {
    console.error('Error updating payment info:', error);
    throw error;
  }
};

userSchema.methods.verifyJazzCash = async function(verifiedBy) {
  this.wallet.paymentInfo.jazzcashVerified = true;
  this.wallet.paymentInfo.jazzcashVerifiedBy = verifiedBy;
  this.wallet.paymentInfo.jazzcashVerifiedAt = new Date();
  await this.save();
  return this;
};

userSchema.methods.verifyEasyPaisa = async function(verifiedBy) {
  this.wallet.paymentInfo.easypaisaVerified = true;
  this.wallet.paymentInfo.easypaisaVerifiedBy = verifiedBy;
  this.wallet.paymentInfo.easypaisaVerifiedAt = new Date();
  await this.save();
  return this;
};

userSchema.methods.verifyBankAccount = async function(verifiedBy) {
  this.wallet.paymentInfo.bankAccount.verified = true;
  this.wallet.paymentInfo.bankAccount.verifiedBy = verifiedBy;
  this.wallet.paymentInfo.bankAccount.verifiedAt = new Date();
  await this.save();
  return this;
};

// ======================
// WALLET EARNINGS METHODS
// ======================

userSchema.methods.addEarnings = async function(amount, commissionId = null) {
  try {
    // ✅ Prevent double processing
    if (commissionId) {
      const existingCommission = await mongoose.model('Commission').findById(commissionId);
      if (existingCommission && existingCommission.earningsProcessed) {
        return this;
      }
    }

    
    // ✅ Add to total earnings
    this.wallet.totalEarnings += amount;
    
    // ✅ IMMEDIATELY add to available balance (NO 24-hour hold)
    this.wallet.availableBalance += amount;
    
    await this.save();

    
    // ✅ Mark commission as processed
    if (commissionId) {
      await mongoose.model('Commission').findByIdAndUpdate(commissionId, {
        earningsProcessed: true,
        processedAt: new Date()
      });
    }
    
  
    
    return this;
  } catch (error) {
    console.error('❌ Error in addEarnings:', error);
    throw error;
  }
};

// ======================
// PAYOUT REQUEST METHODS
// ======================

userSchema.methods.requestPayout = async function(amount, paymentMethod) {
  // Check eligibility
  if (!this.isPayoutEligible) {
    throw new Error('User is not eligible for payout. Verify CNIC and payment method first.');
  }
  
  if (amount > this.wallet.availableBalance) {
    throw new Error('Insufficient available balance');
  }
  
  if (amount < this.payoutSettings.minimumPayout) {
    throw new Error(`Minimum payout is ${this.payoutSettings.minimumPayout}`);
  }
  
  // Check if payment method is verified
  if (paymentMethod === 'jazzcash' && !this.wallet.paymentInfo.jazzcashVerified) {
    throw new Error('JazzCash number not verified');
  }
  if (paymentMethod === 'easypaisa' && !this.wallet.paymentInfo.easypaisaVerified) {
    throw new Error('EasyPaisa number not verified');
  }
  if (paymentMethod === 'bank' && !this.wallet.paymentInfo.bankAccount.verified) {
    throw new Error('Bank account not verified');
  }
  
  // Deduct from available balance
  this.wallet.availableBalance -= amount;
  
  // Create payout request
  const requestId = `PAYOUT_${Date.now()}_${this._id.toString().substring(0, 8)}`;
  
  this.wallet.payoutRequests.push({
    requestId,
    amount,
    paymentMethod,
    requestedAt: new Date(),
    status: 'pending'
  });
  
  await this.save();
  
  return {
    success: true,
    requestId,
    amount,
    availableBalance: this.wallet.availableBalance
  };
};

userSchema.methods.approvePayoutRequest = async function(requestId, processedBy) {
  const requestIndex = this.wallet.payoutRequests.findIndex(
    req => req.requestId === requestId && req.status === 'pending'
  );
  
  if (requestIndex === -1) {
    throw new Error('Pending payout request not found');
  }
  
  this.wallet.payoutRequests[requestIndex].status = 'approved';
  this.wallet.payoutRequests[requestIndex].processedBy = processedBy;
  
  await this.save();
  return this.wallet.payoutRequests[requestIndex];
};

userSchema.methods.completePayoutRequest = async function(requestId, transactionRef, paymentScreenshot, notes = '', processedBy) {
  const requestIndex = this.wallet.payoutRequests.findIndex(
    req => req.requestId === requestId && req.status === 'approved'
  );
  
  if (requestIndex === -1) {
    throw new Error('Approved payout request not found');
  }
  
  const request = this.wallet.payoutRequests[requestIndex];
  
  // Update request
  this.wallet.payoutRequests[requestIndex].status = 'completed';
  this.wallet.payoutRequests[requestIndex].transactionRef = transactionRef;
  this.wallet.payoutRequests[requestIndex].paymentScreenshot = paymentScreenshot;
  this.wallet.payoutRequests[requestIndex].processedAt = new Date();
  this.wallet.payoutRequests[requestIndex].notes = notes;
  this.wallet.payoutRequests[requestIndex].processedBy = processedBy;
  
  // Update wallet
  this.wallet.totalWithdrawn += request.amount;
  this.wallet.lastPayoutDate = new Date();
  
  await this.save();
  return this.wallet.payoutRequests[requestIndex];
};

userSchema.methods.rejectPayoutRequest = async function(requestId, reason, processedBy) {
  const requestIndex = this.wallet.payoutRequests.findIndex(
    req => req.requestId === requestId && req.status === 'pending'
  );
  
  if (requestIndex === -1) {
    throw new Error('Pending payout request not found');
  }
  
  const request = this.wallet.payoutRequests[requestIndex];
  
  // Return amount to available balance
  this.wallet.availableBalance += request.amount;
  
  // Update request
  this.wallet.payoutRequests[requestIndex].status = 'rejected';
  this.wallet.payoutRequests[requestIndex].rejectedReason = reason;
  this.wallet.payoutRequests[requestIndex].processedAt = new Date();
  this.wallet.payoutRequests[requestIndex].processedBy = processedBy;
  
  await this.save();
  return this.wallet.payoutRequests[requestIndex];
};

userSchema.methods.cancelPayoutRequest = async function(requestId) {
  const requestIndex = this.wallet.payoutRequests.findIndex(
    req => req.requestId === requestId && req.status === 'pending'
  );
  
  if (requestIndex === -1) {
    throw new Error('Pending payout request not found');
  }
  
  const request = this.wallet.payoutRequests[requestIndex];
  
  // Return amount to available balance
  this.wallet.availableBalance += request.amount;
  
  // Remove request
  this.wallet.payoutRequests.splice(requestIndex, 1);
  
  await this.save();
  return { success: true, amount: request.amount };
};

module.exports = mongoose.model('User', userSchema);