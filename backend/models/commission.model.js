const mongoose = require("mongoose")

const commissionSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },

    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

    // Amounts
    totalAmount: {
      type: Number,
      required: true,
    },

    sellerAmount: {
      type: Number,
      required: true,
    },

    superadminAmount: {
      type: Number,
      required: true,
    },

    commissionPercentage: {
      type: Number,
      default: 10,
    },

    // Status
    status: {
      type: String,
      enum: ["PENDING", "PROCESSED", "PAID_OUT"],
      default: "PENDING",
    },

    // Payout reference if paid out
    payout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payout",
    },

    processedAt: Date,
    paidOutAt: Date,
  },
  { timestamps: true },
)

// Indexes for faster queries
commissionSchema.index({ seller: 1, status: 1 })
commissionSchema.index({ createdAt: -1 })
commissionSchema.index({ payment: 1 }, { unique: true })
commissionSchema.index({ payout: 1 })

// Instance method to mark as processed
commissionSchema.methods.markProcessed = async function () {
  this.status = "PROCESSED"
  this.processedAt = new Date()
  return await this.save()
}

// Instance method to mark as paid out
commissionSchema.methods.markPaidOut = async function (payoutId) {
  this.status = "PAID_OUT"
  this.payout = payoutId
  this.paidOutAt = new Date()
  return await this.save()
}

module.exports = mongoose.model("Commission", commissionSchema)
