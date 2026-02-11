const crypto = require('crypto');

const jazzcashConfig = {
  // Sandbox credentials - FIXED: Direct values instead of nested object
  merchantId: process.env.JAZZCASH_MERCHANT_ID || 'MC490133',
  password: process.env.JAZZCASH_PASSWORD || 'vgazv0x42s',
  salt: process.env.JAZZCASH_SALT || '1t9c4u5xe0',
  
  // URLs
  integrationUrl: process.env.JAZZCASH_INTEGRATION_URL || 
                 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
  baseUrl: 'https://sandbox.jazzcash.com.pk',
  
  // Get proper JazzCash datetime format (YYYYMMDDHHMMSS - 14 characters)
  getJazzCashDateTime: function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  },
  
  // Generate secure hash for JazzCash - FIXED VERSION
  generateSecureHash: function(amount, transactionRef, returnUrl = null) {
    const amountInPaisa = Math.round(amount * 100);
    const dateTime = this.getJazzCashDateTime();
    
    console.log('🔐 HASH GENERATION DETAILS:');
    console.log('Salt:', this.salt);
    console.log('Amount (paisa):', amountInPaisa);
    console.log('DateTime:', dateTime);
    console.log('Merchant ID:', this.merchantId);
    console.log('Transaction Ref:', transactionRef);
    console.log('Return URL:', returnUrl || 'Not provided');
    
    let integrityString;
    
    if (returnUrl) {
      // For payment initiation
      integrityString = `${this.salt}&${amountInPaisa}&${dateTime}&${this.merchantId}&${transactionRef}&${returnUrl}`;
    } else {
      // For payout (no return URL)
      integrityString = `${this.salt}&${amountInPaisa}&${this.merchantId}&${transactionRef}`;
    }
    
    console.log('Integrity String:', integrityString);
    
    const hash = crypto
      .createHash('sha256')
      .update(integrityString)
      .digest('hex')
      .toUpperCase();
    
    console.log('Generated Hash:', hash);
    return hash;
  },
  
  // Generate transaction reference
  generateTransactionRef: function(prefix = 'TXN') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${timestamp}${random}`;
  },
  
  // Validate JazzCash response - FIXED VERSION
  validateResponse: function(responseData) {
    const amountInPaisa = responseData.pp_Amount;
    const transactionRef = responseData.pp_TxnRefNo;
    const dateTime = responseData.pp_TxnDateTime;
    const merchantId = responseData.pp_MerchantID;
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    // JazzCash validation string format
    const integrityString = `${this.salt}&${amountInPaisa}&${dateTime}&${merchantId}&${transactionRef}&${baseUrl}/api/payments/callback`;
    
    console.log('✅ VALIDATION DETAILS:');
    console.log('Salt:', this.salt);
    console.log('Amount:', amountInPaisa);
    console.log('DateTime:', dateTime);
    console.log('MerchantID:', merchantId);
    console.log('TransactionRef:', transactionRef);
    console.log('Callback URL:', `${baseUrl}/api/payments/callback`);
    console.log('Integrity String:', integrityString);
    
    const calculatedHash = crypto
      .createHash('sha256')
      .update(integrityString)
      .digest('hex')
      .toUpperCase();
    
    console.log('Calculated Hash:', calculatedHash);
    console.log('Received Hash:', responseData.pp_SecureHash);
    
    return calculatedHash === responseData.pp_SecureHash;
  }
};

module.exports = jazzcashConfig;