// services/safepay.service.js – production & sandbox
const axios = require("axios");
const crypto = require("crypto");

const PRODUCTION_API = "https://api.getsafepay.com";
const SANDBOX_API = "https://sandbox.api.getsafepay.com";

class SafepayService {
  constructor() {
    const env = (process.env.SAFEPAY_ENVIRONMENT || "sandbox").toLowerCase();
    const isProduction = env === "production" || env === "live";
    const baseUrl = process.env.SAFEPAY_BASE_URL || (isProduction ? PRODUCTION_API : SANDBOX_API);
    const componentsUrl =
      process.env.SAFEPAY_COMPONENTS_URL ||
      (isProduction ? `${PRODUCTION_API}/components` : `${SANDBOX_API}/components`);

    this.config = {
      secretKey: process.env.SAFEPAY_SECRET_KEY,
      publicKey: process.env.SAFEPAY_PUBLIC_KEY,
      webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET,
      environment: isProduction ? "production" : "sandbox",
      baseUrl,
      componentsUrl,
    };
  }

  async createPaymentRequest(amount, userId, bookId, sellerId, metadata = {}) {
    try {
      if (!this.config.secretKey) {
        throw new Error("SAFEPAY_SECRET_KEY is required in .env");
      }

      const requestData = {
        client: this.config.secretKey,
        amount: Number(amount),
        currency: "PKR",
        environment: this.config.environment,
      };

      if (process.env.NODE_ENV !== "production") {
        console.log("Safepay order init:", { amount: requestData.amount, env: this.config.environment });
      }

      const response = await axios.post(
        `${this.config.baseUrl}/order/v1/init`,
        requestData,
        {
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        }
      );

      const trackerToken = response.data?.data?.token;
      if (!trackerToken) {
        throw new Error("Invalid response from Safepay: missing tracker token");
      }

      const successUrl =
        process.env.SAFEPAY_SUCCESS_URL ||
        `${process.env.BASE_URL || ""}/api/payments/safepay/return`;
      const cancelUrl =
        process.env.SAFEPAY_CANCEL_URL ||
        `${process.env.FRONTEND_URL || ""}/books`;

      if (
        !successUrl ||
        successUrl.includes("undefined") ||
        !cancelUrl ||
        cancelUrl.includes("undefined")
      ) {
        throw new Error(
          "BASE_URL and FRONTEND_URL (or SAFEPAY_SUCCESS_URL and SAFEPAY_CANCEL_URL) must be set in .env"
        );
      }

      const paymentUrl = `${this.config.componentsUrl}?env=${this.config.environment}&beacon=${trackerToken}&source=custom&redirect_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;

      return {
        paymentUrl,
        tracker: trackerToken,
        transactionRef: `SP_${Date.now()}_${userId.substring(0, 8)}`,
        metadata: { userId, bookId, sellerId, ...metadata },
      };
    } catch (error) {
      console.error("Safepay createPaymentRequest error:", error.response?.data || error.message);
      throw error;
    }
  }

  async verifyPayment(tracker) {
    try {
      const response = await axios.get(`${this.config.baseUrl}/order/v1/${tracker}`, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Safepay verifyPayment error:", error.response?.data || error.message);
      throw error;
    }
  }

  verifyWebhookSignature(rawBody, signature) {
    if (!signature || !this.config.webhookSecret) return false;
    const computed = crypto
      .createHmac("sha256", this.config.webhookSecret)
      .update(rawBody)
      .digest("hex");
    return signature.toLowerCase() === computed;
  }

  parseWebhookEvent(eventData) {
    return {
      tracker: eventData.tracker || eventData.data?.tracker?.token,
      amount: eventData.amount || eventData.data?.amount,
      currency: eventData.currency || eventData.data?.currency || "PKR",
      status: eventData.event === "payment.completed" ? "paid" : (eventData.status || "unknown"),
      metadata: eventData.metadata || eventData.data?.metadata || {},
      timestamp: new Date(eventData.timestamp || Date.now()),
    };
  }
}

module.exports = new SafepayService();
