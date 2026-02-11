const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    
    amount: {
      type: Number,
      required: true,
    },
    
    // Seller Information
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    sellerType: {
      type: String,
      enum: ["admin", "superadmin"],
      required: true,
    },
    
    // Commission Distribution
    commission: {
      sellerAmount: { type: Number, default: 0 },
      superadminAmount: { type: Number, default: 0 },
      commissionPercentage: { type: Number, default: 10 }
    },
    
    transactionRef: {
      type: String,
      required: true,
      unique: true,
    },
    
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    

    
    // Earnings Status
    earningsStatus: {
      type: String,
      enum: ["PENDING", "PROCESSED", "PAID_OUT"],
      default: "PENDING",
    },
    
    payout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payout",
    },
    
    tracker: {
      type: String,
      sparse: true
    },
    
    safepayResponse: {
      type: Object,
      default: {},
    },

    metadata: {
      ipAddress: String,
      userAgent: String,
      bookTitle: String,
      sellerName: String
    }
  },
  { timestamps: true }
);

// Indexes
// paymentSchema.index({ transactionRef: 1 });
// paymentSchema.index({ user: 1, createdAt: -1 });
// paymentSchema.index({ seller: 1, status: 1 });
// paymentSchema.index({ status: 1, earningsStatus: 1 });
// paymentSchema.index({ createdAt: -1 });

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'SUCCESS') {
    this.earningsStatus = 'PENDING';
  }
  next();
});

// Method to distribute earnings
paymentSchema.methods.distributeEarnings = async function() {
  if (this.status !== 'SUCCESS' || this.earningsStatus !== 'PENDING') {
    return false;
  }
  
  // Update seller's wallet
  const seller = await mongoose.model('User').findById(this.seller);
  if (seller) {
    await seller.addEarnings(this.commission.sellerAmount);
  }
  
  if (seller) {
  seller.wallet.totalEarnings += purchase.commission.sellerAmount;
  seller.wallet.availableBalance += purchase.commission.sellerAmount;  // Add this line
  await seller.save();
}

  // Update superadmin's wallet
  const superadmin = await mongoose.model('User').findOne({ role: 'superadmin' });
  if (superadmin && this.commission.superadminAmount > 0) {
    await superadmin.addEarnings(this.commission.superadminAmount);
  }
  
  this.earningsStatus = 'PROCESSED';
  await this.save();
  
  return true;
};

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment; 