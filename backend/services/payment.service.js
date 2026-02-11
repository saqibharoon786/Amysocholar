// services/payment.service.js
const SafepayService = require('./safepay.service');

const createPaymentWithCommission = async (amount, userId, bookId, sellerId, sellerType) => {
  const SUPERADMIN_COMMISSION = parseInt(process.env.SUPERADMIN_COMMISSION_PERCENTAGE, 10) || 10;
  
  let sellerAmount = Number(amount) || 0;
  let superadminAmount = 0;
  
  if (sellerType === "admin") {
    superadminAmount = Math.floor((sellerAmount * SUPERADMIN_COMMISSION) / 100);
    sellerAmount = sellerAmount - superadminAmount;
  } else if (sellerType === "superadmin") {
    superadminAmount = sellerAmount;
    sellerAmount = 0;
  }

  // Create Safepay payment request
  const safepayData = await SafepayService.createPaymentRequest(
    amount,
    userId,
    bookId,
    sellerId,
    {
      type: 'book_purchase',
      sellerType,
      commission: {
        sellerAmount,
        superadminAmount,
        commissionPercentage: SUPERADMIN_COMMISSION
      }
    }
  );

  return {
    paymentUrl: safepayData.paymentUrl,
    tracker: safepayData.tracker,
    transactionRef: safepayData.transactionRef,
    commission: {
      sellerAmount,
      superadminAmount,
      commissionPercentage: SUPERADMIN_COMMISSION
    },
    metadata: safepayData.metadata
  };
};

const verifyPayment = async (tracker) => {
  return await SafepayService.verifyPayment(tracker);
};

module.exports = {
  createPaymentWithCommission,
  verifyPayment,
  SafepayService
};