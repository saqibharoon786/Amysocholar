const mongoose = require("mongoose")

const payoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Request details
    requestId: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["jazzcash", "easypaisa", "bank"],
      required: true,
    },

    // Payment details (from user's paymentInfo)
    recipientDetails: {
      jazzcashNumber: String,
      easypaisaNumber: String,
      bankAccount: {
        accountTitle: String,
        accountNumber: String,
        bankName: String,
        iban: String,
      },
    },

    // Status tracking
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "COMPLETED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },

    // Timeline
    requestedAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: Date,
    completedAt: Date,
    rejectedAt: Date,
    cancelledAt: Date,

    // Superadmin actions
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Transaction proof
    transactionRef: String, // Bank/ATM transaction reference
    paymentScreenshot: {
      url: String,
      filename: String,
    },

    // Notes
    adminNotes: String, // Notes from superadmin
    rejectionReason: String, // Reason for rejection

    // Related commissions (for tracking)
    commissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commission",
      },
    ],

    // Audit trail
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true },
)

// Indexes for faster queries
payoutSchema.index({ user: 1, createdAt: -1 })
payoutSchema.index({ status: 1 })
payoutSchema.index({ requestId: 1 })
payoutSchema.index({ createdAt: -1 })
payoutSchema.index({ user: 1, status: 1 })
payoutSchema.index({ approvedBy: 1 })
payoutSchema.index({ "recipientDetails.jazzcashNumber": 1 })
payoutSchema.index({ "recipientDetails.easypaisaNumber": 1 })

// Virtual for display
payoutSchema.virtual("userName").get(function () {
  return this.user ? `${this.user.firstName} ${this.user.lastName}` : "Unknown User"
})

payoutSchema.virtual("isPending").get(function () {
  return this.status === "PENDING"
})

payoutSchema.virtual("isApproved").get(function () {
  return this.status === "APPROVED"
})

payoutSchema.virtual("isCompleted").get(function () {
  return this.status === "COMPLETED"
})

// Instance methods
payoutSchema.methods.approve = async function (superadminId) {
  this.status = "APPROVED"
  this.approvedAt = new Date()
  this.approvedBy = superadminId
  return await this.save()
}

payoutSchema.methods.complete = async function (superadminId, transactionRef, screenshotUrl, screenshotFilename, notes = "") {
  this.status = "COMPLETED"
  this.completedAt = new Date()
  this.completedBy = superadminId
  this.transactionRef = transactionRef
  
  if (screenshotUrl) {
    this.paymentScreenshot = {
      url: screenshotUrl,
      filename: screenshotFilename || "payment_screenshot.jpg"
    }
  }
  
  this.adminNotes = notes
  return await this.save()
}

payoutSchema.methods.reject = async function (superadminId, reason) {
  this.status = "REJECTED"
  this.rejectedAt = new Date()
  this.rejectedBy = superadminId
  this.rejectionReason = reason
  return await this.save()
}

payoutSchema.methods.cancel = async function () {
  this.status = "CANCELLED"
  this.cancelledAt = new Date()
  return await this.save()
}

// Pre-save middleware to validate
payoutSchema.pre("save", function (next) {
  // Validate amount
  if (this.amount <= 0) {
    return next(new Error("Amount must be greater than 0"))
  }
  
  // Validate payment method and recipient details
  if (this.paymentMethod === "jazzcash" && !this.recipientDetails.jazzcashNumber) {
    return next(new Error("JazzCash number is required for JazzCash payments"))
  }
  
  if (this.paymentMethod === "easypaisa" && !this.recipientDetails.easypaisaNumber) {
    return next(new Error("EasyPaisa number is required for EasyPaisa payments"))
  }
  
  if (this.paymentMethod === "bank") {
    if (!this.recipientDetails.bankAccount?.accountNumber) {
      return next(new Error("Bank account number is required for bank transfers"))
    }
    if (!this.recipientDetails.bankAccount?.accountTitle) {
      return next(new Error("Account title is required for bank transfers"))
    }
  }
  
  next()
})

// Static methods
payoutSchema.statics.findByRequestId = function (requestId) {
  return this.findOne({ requestId }).populate("user", "firstName lastName email phone")
}

payoutSchema.statics.findByUser = function (userId, limit = 20, skip = 0) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate("approvedBy completedBy rejectedBy", "firstName lastName email")
}

payoutSchema.statics.findPending = function (limit = 20) {
  return this.find({ status: "PENDING" })
    .populate("user", "firstName lastName email phone")
    .sort({ createdAt: 1 }) // Oldest first
    .limit(limit)
}

payoutSchema.statics.findApproved = function (limit = 20) {
  return this.find({ status: "APPROVED" })
    .populate("user", "firstName lastName email phone")
    .populate("approvedBy", "firstName lastName email")
    .sort({ approvedAt: 1 }) // Oldest first
    .limit(limit)
}

payoutSchema.statics.getStats = async function (startDate, endDate) {
  const match = {}
  
  if (startDate || endDate) {
    match.createdAt = {}
    if (startDate) match.createdAt.$gte = new Date(startDate)
    if (endDate) match.createdAt.$lte = new Date(endDate)
  }
  
  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        avgAmount: { $avg: "$amount" }
      }
    }
  ])
}

module.exports = mongoose.model("Payout", payoutSchema)