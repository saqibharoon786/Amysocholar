const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
    judgment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Judgment",
    },
    type: {
      type: String,
      enum: ["book", "judgment"],
      required: true,
    },
    format: {
      type: String,
      enum: ["pdf", "text"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    
    // Payment Information
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    
  paymentMethod: {
  type: String,
  enum: ['safepay', 'jazzcash', 'easypaisa', 'bank', 'card', 'wallet'], 
  required: true,
  default: 'safepay' 
},
    
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    
    // Commission Information
    commission: {
      sellerAmount: { type: Number, default: 0 },
      superadminAmount: { type: Number, default: 0 },
      commissionPercentage: { type: Number, default: 10 }
    },
    
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    sellerType: {
      type: String,
      enum: ["admin", "superadmin"],
    },
    
    transactionId: {
      type: String,
      required: true,
    },
    
    // JazzCash Transaction Reference
    jazzcashRef: {
      type: String,
      sparse: true
    },
    
    paymentDetails: {
      method: String,
      transactionId: String,
      amount: Number,
      currency: { type: String, default: "PKR" },
      status: String,
      timestamp: Date,
    },
    
    // Earnings Status
    earningsStatus: {
      type: String,
      enum: ["pending", "processed", "paid_out"],
      default: "pending"
    },
    
        safepayTracker: {
      type: String,
      sparse: true
    },
    // Payout reference
    payout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payout",
    }
  },
  { timestamps: true }
);

// Indexes
// purchaseSchema.index({ user: 1, createdAt: -1 });
// purchaseSchema.index({ transactionId: 1 });
// purchaseSchema.index({ paymentStatus: 1 });
// purchaseSchema.index({ seller: 1 });
// purchaseSchema.index({ jazzcashRef: 1 }, { sparse: true });
// purchaseSchema.index({ earningsStatus: 1 });

module.exports = mongoose.model("Purchase", purchaseSchema);