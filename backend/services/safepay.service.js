// services/safepay.service.js
const axios = require('axios');
const crypto = require('crypto');

class SafepayService {
  constructor() {
    this.config = {
      secretKey: process.env.SAFEPAY_SECRET_KEY,
      publicKey: process.env.SAFEPAY_PUBLIC_KEY,
      webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET,
      environment: process.env.SAFEPAY_ENVIRONMENT || 'sandbox',
      baseUrl: process.env.SAFEPAY_BASE_URL || 'https://sandbox.api.getsafepay.com'
    };
  }

  /**
   * Create a payment request
   * @param {number} amount - Amount in PKR
   * @param {string} userId - User ID
   * @param {string} bookId - Book ID
   * @param {string} sellerId - Seller ID
   * @param {object} metadata - Additional metadata
   */
  async createPaymentRequest(amount, userId, bookId, sellerId, metadata = {}) {
    try {
      const requestData = {
        client: this.config.secretKey,
        amount: Number(amount),
        currency: "PKR",
        environment: this.config.environment
      };

      console.log("Creating Safepay order with data:", requestData);

      const response = await axios.post(
        `${this.config.baseUrl}/order/v1/init`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );

      console.log("Safepay Response:", response.data);

      const trackerToken = response.data?.data?.token;

      if (!trackerToken) {
        throw new Error("Invalid response from Safepay: missing tracker token");
      }

      // Build checkout URL
      const checkoutBase = this.config.environment === "sandbox" 
        ? "https://sandbox.api.getsafepay.com/components"
        : "https://www.getsafepay.com/components";

      const successUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/payments/safepay/return`;
      const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/books`;

      const paymentUrl = `${checkoutBase}?env=${this.config.environment}&beacon=${trackerToken}&source=custom&redirect_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;

      return {
        paymentUrl,
        tracker: trackerToken,
        transactionRef: `SP_${Date.now()}_${userId.substring(0, 8)}`,
        metadata: {
          userId,
          bookId,
          sellerId,
          ...metadata
        }
      };

    } catch (error) {
      console.error("Safepay createPaymentRequest error:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify payment
   * @param {string} tracker - Tracker token
   */
  async verifyPayment(tracker) {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/order/v1/${tracker}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Safepay verifyPayment error:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   * @param {Buffer} rawBody - Raw request body
   * @param {string} signature - X-SFPY-Signature header
   */
  verifyWebhookSignature(rawBody, signature) {
    if (!signature) {
      return false;
    }

    const computedSignature = crypto
      .createHmac("sha256", this.config.webhookSecret)
      .update(rawBody)
      .digest("hex");

    return signature.toLowerCase() === computedSignature;
  }

  /**
   * Parse webhook event
   * @param {object} eventData - Webhook data
   */
  parseWebhookEvent(eventData) {
    const event = eventData;
    
    const paymentData = {
      tracker: event.tracker || event.data?.tracker?.token,
      amount: event.amount || event.data?.amount,
      currency: event.currency || event.data?.currency || 'PKR',
      status: event.event === 'payment.completed' ? 'paid' : (event.status || 'unknown'),
      metadata: event.metadata || event.data?.metadata || {},
      timestamp: new Date(event.timestamp || Date.now())
    };

    return paymentData;
  }
}

module.exports = new SafepayService();