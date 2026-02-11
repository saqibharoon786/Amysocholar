const SafepayService = require("./safepay.service")
const User = require("../models/user.model")
const Payout = require("../models/payout.model")
const Commission = require("../models/commission.model")
const { sendEmail } = require("../utils/2FA/sendEmail")

class PayoutService {
  constructor() {
    this.minimumPayout = Number.parseInt(process.env.MINIMUM_PAYOUT_AMOUNT) || 1000
  }

  /**
   * Process payout for a single user
   * Used by both auto-payout and manual payout requests
   */
  async processAutoPayout(userId) {
    try {
      const user = await User.findById(userId)

      if (!user) {
        throw new Error("User not found")
      }

      console.log("Insufficient balance for payout", user.wallet.availableBalance)
      console.log("payout balance", this.minimumPayout)
      // Validate payout eligibility
      if (user.wallet.availableBalance < this.minimumPayout) {
        return {
          success: false,
          message: `Insufficient balance. Minimum required: ${this.minimumPayout} PKR`,
        }
      }

      if (!this.isWalletVerified(user)) {
        return {
          success: false,
          message: "Wallet not verified for selected payment method",
        }
      }

      const amount = user.wallet.availableBalance
      const paymentMethod = user.payoutSettings.payoutMethod

      // Create payout record
      const payout = await Payout.create({
        user: userId,
        amount: amount,
        paymentMethod: paymentMethod,
        recipientDetails: this.getRecipientDetails(user),
        status: "PROCESSING",
        internalRef: `AUTO_${Date.now()}_${userId}`,
        notes: "Automatic weekly payout",
      })

      // Get all unprocessed commissions for this seller
      const commissions = await Commission.find({
        seller: userId,
        status: "PROCESSED",
        payout: { $exists: false },
      }).limit(100)

      // Link commissions to payout
      if (commissions.length > 0) {
        const commissionIds = commissions.map((c) => c._id)
        await Commission.updateMany(
          { _id: { $in: commissionIds } },
          {
            $set: {
              payout: payout._id,
              status: "PAID_OUT",
              paidOutAt: new Date(),
            },
          },
        )

        payout.commissions = commissionIds
        await payout.save()
      }

      const payoutResult = await this.processPayoutByMethod(user, amount, payout)

      if (payoutResult.success) {
        // Mark payout as completed
        await payout.markCompleted(payoutResult.transactionId)

        // Update user wallet
        user.wallet.availableBalance = 0
        user.wallet.totalWithdrawn += amount
        user.wallet.lastPayoutDate = new Date()
        await user.save()

        // Send notification to user
        await this.sendPayoutNotification(user, payout, payoutResult)

        return {
          success: true,
          message: "Payout processed successfully",
          payout: payout,
          transactionId: payoutResult.transactionId,
        }
      } else {
        // Mark payout as failed
        await payout.markFailed(payoutResult.errorMessage || "Payout processing failed")

        return {
          success: false,
          message: payoutResult.errorMessage || "Payout failed",
          payout: payout,
        }
      }
    } catch (error) {
      console.error("Payout processing error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  /**
   * Route payout to the appropriate payment gateway
   */
  async processPayoutByMethod(user, amount, payout) {
    const method = user.payoutSettings.payoutMethod

    switch (method) {
      case "jazzcash":
        return await this.processJazzCashPayout(user, amount, payout)
      case "easypaisa":
        return await this.processEasypaisaPayout(user, amount, payout)
      case "bank":
        return await this.processBankPayout(user, amount, payout)
      case "manual":
        return await this.processManualPayout(user, amount, payout)
      default:
        return {
          success: false,
          errorMessage: "Invalid payment method",
        }
    }
  }

  /**
   * JazzCash Payout - Direct transfer to mobile number
   */
  async processJazzCashPayout(user, amount, payout) {
    const jazzcashNumber = user.wallet.jazzcash.number

    if (!jazzcashNumber) {
      return {
        success: false,
        errorMessage: "JazzCash number not found",
      }
    }

    try {
      // TODO: Implement actual JazzCash API integration
      // For now, this is a placeholder
      const transactionId = `JC_${Date.now()}_${user._id.toString().substring(0, 8)}`

      console.log(`[v0] JazzCash Payout: ${jazzcashNumber} - Amount: ${amount} PKR`)

      return {
        success: true,
        transactionId: transactionId,
        message: "JazzCash payout request sent",
      }
    } catch (error) {
      console.error("JazzCash payout error:", error)
      return {
        success: false,
        errorMessage: error.message,
      }
    }
  }

  /**
   * Easypaisa Payout - Direct transfer to mobile number
   */
  async processEasypaisaPayout(user, amount, payout) {
    const easypaisaNumber = user.wallet.easypaisa.number

    if (!easypaisaNumber) {
      return {
        success: false,
        errorMessage: "Easypaisa number not found",
      }
    }

    try {
      // TODO: Implement actual Easypaisa API integration
      const transactionId = `EP_${Date.now()}_${user._id.toString().substring(0, 8)}`

      console.log(`[v0] Easypaisa Payout: ${easypaisaNumber} - Amount: ${amount} PKR`)

      return {
        success: true,
        transactionId: transactionId,
        message: "Easypaisa payout request sent",
      }
    } catch (error) {
      console.error("Easypaisa payout error:", error)
      return {
        success: false,
        errorMessage: error.message,
      }
    }
  }

  /**
   * Bank Transfer Payout
   */
  async processBankPayout(user, amount, payout) {
    const bankAccount = user.wallet.bankAccount

    if (!bankAccount || !bankAccount.accountNumber) {
      return {
        success: false,
        errorMessage: "Bank account details not found",
      }
    }

    try {
      // TODO: Implement actual bank transfer API integration
      // Could use service like Telr, 1Link, or direct bank API
      const transactionId = `BK_${Date.now()}_${user._id.toString().substring(0, 8)}`

      console.log(`[v0] Bank Transfer: ${bankAccount.accountNumber} - Amount: ${amount} PKR`)

      return {
        success: true,
        transactionId: transactionId,
        message: "Bank transfer initiated",
      }
    } catch (error) {
      console.error("Bank transfer error:", error)
      return {
        success: false,
        errorMessage: error.message,
      }
    }
  }

  /**
   * Manual Payout - Requires SuperAdmin approval
   */
  async processManualPayout(user, amount, payout) {
    try {
      // Keep payout in PENDING status until manually approved
      payout.status = "PENDING"
      payout.notes = "Awaiting manual approval from SuperAdmin"
      await payout.save()

      const transactionId = `MANUAL_${payout.internalRef}`

      console.log(`[v0] Manual Payout Requested: ${user.fullName} - Amount: ${amount} PKR`)

      return {
        success: true,
        transactionId: transactionId,
        message: "Manual payout request created. Awaiting SuperAdmin approval.",
      }
    } catch (error) {
      console.error("Manual payout error:", error)
      return {
        success: false,
        errorMessage: error.message,
      }
    }
  }

  /**
   * Check if wallet is verified for the selected payment method
   */
  isWalletVerified(user) {
    const method = user.payoutSettings.payoutMethod

    switch (method) {
      case "jazzcash":
        return user.wallet.jazzcash.verified && user.wallet.jazzcash.number
      case "easypaisa":
        return user.wallet.easypaisa.verified && user.wallet.easypaisa.number
      case "bank":
        return user.wallet.bankAccount.verified && user.wallet.bankAccount.accountNumber
      case "manual":
        return true // Manual doesn't need wallet verification
      default:
        return false
    }
  }

  /**
   * Get recipient details based on payment method
   */
  getRecipientDetails(user) {
    const method = user.payoutSettings.payoutMethod

    switch (method) {
      case "jazzcash":
        return { jazzcashNumber: user.wallet.jazzcash.number }
      case "easypaisa":
        return { easypaisaNumber: user.wallet.easypaisa.number }
      case "bank":
        return { bankAccount: user.wallet.bankAccount }
      case "manual":
        return { email: user.email, name: user.fullName }
      default:
        return {}
    }
  }

  /**
   * Send payout notification email to user
   */
  async sendPayoutNotification(user, payout, result) {
    try {
      const emailContent = `
        <h2>Payout Processed Successfully</h2>
        <p>Hello ${user.fullName},</p>
        <p>Your weekly payout of <strong>PKR ${payout.amount}</strong> has been processed successfully!</p>
        <p><strong>Transaction ID:</strong> ${result.transactionId || payout.internalRef}</p>
        <p><strong>Payment Method:</strong> ${payout.paymentMethod}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p>You should receive the amount within 24-48 hours depending on your payment method.</p>
        <p>Thank you for being part of our bookstore community!</p>
      `

      await sendEmail({
        to: user.email,
        subject: "Your Weekly Payout Has Been Processed",
        html: emailContent,
      })
    } catch (error) {
      console.error("Failed to send payout notification:", error)
    }
  }

  /**
   * Process all auto-payouts for eligible users
   * Called by the weekly scheduler
   */
  async processAllAutoPayouts() {
    try {
      console.log("Starting weekly auto-payout processing...")

      const users = await User.find({
        "payoutSettings.autoPayout": true,
        "payoutSettings.payoutSchedule": "weekly",
        "wallet.availableBalance": { $gte: this.minimumPayout },
        isActive: true,
      }).select("_id email wallet payoutSettings fullName")

      console.log(`Found ${users.length} users eligible for auto-payout`)

      const results = []
      for (const user of users) {
        try {
          const result = await this.processAutoPayout(user._id)
          results.push({
            userId: user._id,
            email: user.email,
            success: result.success,
            message: result.message,
            amount: user.wallet.availableBalance,
          })
        } catch (error) {
          results.push({
            userId: user._id,
            email: user.email,
            success: false,
            message: error.message,
          })
        }
      }

      console.log("Weekly auto-payout processing completed")
      return results
    } catch (error) {
      console.error("Auto-payout processing error:", error)
      throw error
    }
  }

  /**
   * Get payout history for a user
   */
  async getUserPayoutHistory(userId, limit = 20, skip = 0) {
    return await Payout.find({ user: userId })
      .populate("commissions", "totalAmount sellerAmount superadminAmount")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
  }

  /**
   * Get pending payouts for manual approval
   */
  async getPendingPayouts(limit = 20) {
    return await Payout.find({ status: "PENDING" })
      .populate("user", "email fullName wallet.jazzcash wallet.easypaisa")
      .sort({ createdAt: -1 })
      .limit(limit)
  }
}

module.exports = new PayoutService()
