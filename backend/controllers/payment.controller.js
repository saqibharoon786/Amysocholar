const Payment = require("../models/payment.model.js");
const Book = require("../models/book.model.js");
const User = require("../models/user.model.js");
const Purchase = require("../models/purchases.model.js");
const Commission = require("../models/commission.model.js");
const { createPaymentWithCommission, verifyPayment, SafepayService } = require("../services/payment.service.js");

const createPayment = async (req, res) => {
  try {
    console.log('=== PAYMENT CREATE START ===');
    console.log('User:', req.user);
    console.log('Book ID:', req.body.bookId);
    
    const { bookId } = req.body;
    
    if (!req.user || !req.user.id) {
      console.log('No user found');
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    const userId = req.user.id;
    
    const book = await Book.findById(bookId).populate('uploader', 'firstName lastName email');
    
    if (!book) {
      console.log('Book not found for ID:', bookId);
      return res.status(404).json({ 
        success: false, 
        message: "Book not found" 
      });
    }
    
    console.log('Book found:', book.title);
    console.log('Book uploader:', book.uploader);
    
    if (book.status !== 'approved') {
      console.log('Book not approved:', book.status);
      return res.status(400).json({ 
        success: false, 
        message: "Book is not available for purchase" 
      });
    }
    
    const existingPurchase = await Purchase.findOne({
      user: userId,
      book: bookId,
      paymentStatus: 'completed'
    });
    
    if (existingPurchase) {
      console.log('Already purchased');
      return res.status(400).json({ 
        success: false, 
        message: "You have already purchased this book" 
      });
    }
    
    const amount = book.discountedPrice || book.price;
    const sellerType = book.uploaderType || 'admin';
    
    console.log('Amount:', amount);
    console.log('Seller type:', sellerType);
    console.log('Seller ID:', book.uploader?._id);
    
    // Create payment with commission calculation
    const paymentData = await createPaymentWithCommission(
      amount, 
      userId, 
      bookId, 
      book.uploader._id,
      sellerType
    );
    
    console.log('Payment data received:', paymentData);
    
    // Save payment record
    const paymentRecord = await Payment.create({
      user: userId,
      book: bookId,
      amount: amount,
      seller: book.uploader._id,
      sellerType: sellerType,
      commission: paymentData.commission,
      transactionRef: paymentData.transactionRef,
      tracker: paymentData.tracker,
      status: "PENDING",
      safepayResponse: {
        tracker: paymentData.tracker,
        paymentUrl: paymentData.paymentUrl
      },
      metadata: {
        bookTitle: book.title,
        sellerName: book.uploader?.firstName + ' ' + book.uploader?.lastName, // Fixed this line
        ...paymentData.metadata
      }
    });
    
    console.log('Payment record created:', paymentRecord._id);
    
    return res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      payment: {
        paymentUrl: paymentData.paymentUrl,
        tracker: paymentData.tracker,
        transactionRef: paymentData.transactionRef
      },
      paymentId: paymentRecord._id,
      redirectUrl: paymentData.paymentUrl,
      transactionRef: paymentData.transactionRef,
      commissionBreakdown: paymentData.commission
    });
  } catch (error) {
    console.error("Payment Creation Error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error",
      error: error.toString()
    });
  }
};
// Safepay return URL handler
// Safepay return URL handler
const safepayReturn = async (req, res) => {
  try {
    console.log('\n=== SAFEPAY RETURN CALLED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Full URL:', req.originalUrl);
    console.log('HTTP Method:', req.method);
    console.log('Query params:', req.query);
    console.log('Request headers:', req.headers);
    
    let { tracker, status, cancel } = req.query;
    
    // Debug: Log raw body for POST requests
    if (req.method === 'POST') {
      console.log('Request body (raw):', req.body);
      console.log('Raw body buffer:', req.rawBody ? req.rawBody.toString() : 'No raw body');
    }
    
    // Also check for tracker in body for POST requests
    if (!tracker) {
      console.log('No tracker in query params, checking request body...');
      if (req.body && req.body.tracker) {
        tracker = req.body.tracker;
        console.log('Found tracker in request body:', tracker);
      }
    }
    
    // Check common Safepay parameter names
    if (!tracker) {
      console.log('Checking for tracker in common parameter names...');
      const safepayParams = ['tracker', 'token', 'beacon', 'reference', 'tracker_id', 'order_id'];
      for (const param of safepayParams) {
        if (req.query[param]) {
          tracker = req.query[param];
          console.log(`Found tracker as '${param}':`, tracker);
          break;
        }
      }
    }
    
    // Check body parameters too
    if (!tracker && req.body) {
      console.log('Checking request body for common parameter names...');
      const safepayBodyParams = ['tracker', 'token', 'beacon', 'reference'];
      for (const param of safepayBodyParams) {
        if (req.body[param]) {
          tracker = req.body[param];
          console.log(`Found tracker in body as '${param}':`, tracker);
          break;
        }
      }
    }
    
    // Check URL fragments (some gateways use #)
    if (!tracker && req.originalUrl.includes('#')) {
      console.log('Checking URL fragments...');
      const fragment = req.originalUrl.split('#')[1];
      if (fragment.includes('tracker=')) {
        tracker = fragment.split('tracker=')[1]?.split('&')[0];
        console.log('Found tracker in URL fragment:', tracker);
      }
    }
    
    console.log('Final tracker value:', tracker || 'NOT FOUND');
    
    if (cancel === 'true') {
      console.log('Payment cancelled by user');
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Cancelled</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
            .btn { display: inline-block; padding: 10px 30px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .debug { background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: left; font-family: monospace; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌ Payment Cancelled</div>
            <p>The payment was cancelled. You can try again.</p>
            <div class="debug">
              <strong>Debug Info:</strong><br>
              URL: ${req.originalUrl}<br>
              Query: ${JSON.stringify(req.query)}<br>
              Method: ${req.method}<br>
              Time: ${new Date().toLocaleString()}
            </div>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/books" class="btn">Back to Books</a>
          </div>
        </body>
        </html>
      `);
    }
    
    if (!tracker) {
      // Enhanced debug version of error page
      const debugHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Payment Response</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #dc3545; }
            .debug { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #007bff; }
            .debug-title { color: #007bff; margin-top: 0; }
            .debug-item { margin: 10px 0; }
            .debug-label { font-weight: bold; color: #495057; }
            .debug-value { color: #6c757d; font-family: monospace; background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
            .instructions { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
            .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Invalid Payment Response</h1>
            <p>We couldn't find the payment tracker information.</p>
            
            <div class="instructions">
              <h3>What to do:</h3>
              <ol>
                <li>Check your email for payment confirmation</li>
                <li>Go to your dashboard to check purchase status</li>
                <li>Contact support if the payment was deducted but you don't see the purchase</li>
              </ol>
            </div>
            
            <div class="debug">
              <h3 class="debug-title">Debug Information</h3>
              <div class="debug-item">
                <span class="debug-label">Request Method:</span> 
                <span class="debug-value">${req.method}</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Full URL:</span> 
                <span class="debug-value">${req.originalUrl}</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Query Parameters:</span> 
                <span class="debug-value">${JSON.stringify(req.query, null, 2)}</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Request Body:</span> 
                <span class="debug-value">${JSON.stringify(req.body || {}, null, 2)}</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Headers:</span> 
                <span class="debug-value">Referer: ${req.headers.referer || 'None'}</span><br>
                <span class="debug-value">User-Agent: ${req.headers['user-agent'] || 'Unknown'}</span>
              </div>
              <div class="debug-item">
                <span class="debug-label">Timestamp:</span> 
                <span class="debug-value">${new Date().toISOString()}</span>
              </div>
            </div>
            
            <p>If you need assistance, please share this debug information with support.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard" class="btn">Go to Dashboard</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/support" class="btn" style="background: #6c757d; margin-left: 10px;">Contact Support</a>
            
            <script>
              // Auto-redirect after 10 seconds
              setTimeout(() => {
                window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard';
              }, 10000);
            </script>
          </div>
        </body>
        </html>
      `;
      return res.status(400).send(debugHtml);
    }
    
    console.log('Verifying payment with tracker:', tracker);
    
    // Verify payment status with Safepay
    const verification = await verifyPayment(tracker);
    console.log("Safepay verification response:", verification);
    
    // Find payment record
    const payment = await Payment.findOne({ tracker })
      .populate('book')
      .populate('seller')
      .populate('user');
      
    if (!payment) {
      console.error("Payment not found for tracker:", tracker);
      
      // Try to find by transactionRef or other identifiers
      console.log("Searching for payment with other identifiers...");
      const altPayment = await Payment.findOne({
        $or: [
          { transactionRef: { $regex: tracker, $options: 'i' } },
          { 'safepayResponse.tracker': tracker },
          { 'metadata.tracker': tracker }
        ]
      })
      .populate('book')
      .populate('seller')
      .populate('user');
      
      if (altPayment) {
        console.log("Found payment using alternative search:", altPayment._id);
        payment = altPayment;
      } else {
        console.error("No payment found with any identifier matching:", tracker);
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Payment Not Found</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
              .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
              .tracker { background: #f8f9fa; padding: 10px; border-radius: 5px; display: inline-block; margin: 10px 0; font-family: monospace; }
              .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="error">❌ Payment Not Found</div>
            <p>We couldn't find a payment record for:</p>
            <div class="tracker">${tracker}</div>
            <p>Please check your email for confirmation or contact support.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/support" class="btn">Contact Support</a>
            <br>
            <small style="color: #6c757d; margin-top: 20px; display: block;">
              Note: It may take a few minutes for the payment to appear. Please check again shortly.
            </small>
          </body>
          </html>
        `);
      }
    }
    
const isSuccess = verification?.data?.state === 'paid' || 
                  verification?.data?.payment?.state === 'paid' ||
                  verification?.data?.status === 'paid' ||
                  status === 'paid' ||
                  verification?.status === 'paid' ||
                  // Add these Safepay specific success states
                  verification?.data?.state === 'TRACKER_ENDED' ||
                  verification?.data?.transaction?.id !== undefined ||
                  verification?.data?.transaction?.reference !== undefined;

console.log('Payment success status:', isSuccess, 'Verification data state:', verification?.data?.state);
    
    if (isSuccess) {
      payment.status = "SUCCESS";
      payment.safepayResponse = {
        ...payment.safepayResponse,
        verification: verification.data || verification,
        returnUrlData: req.query
      };
      
      // Create purchase record
      const purchase = await Purchase.create({
        user: payment.user._id,
        book: payment.book._id,
        type: 'book',
        format: 'pdf',
        amount: payment.amount,
        seller: payment.seller._id,
        sellerType: payment.sellerType,
        commission: payment.commission,
        paymentMethod: 'safepay',
        paymentStatus: 'completed',
        transactionId: payment.transactionRef,
        safepayTracker: tracker,
        paymentDetails: {
          method: 'safepay',
          transactionId: payment.transactionRef,
          tracker: tracker,
          amount: payment.amount,
          currency: 'PKR',
          status: 'completed',
          timestamp: new Date(),
          verificationData: verification.data || verification
        }
      });
      
      // Create commission record
      const commission = await Commission.create({
        payment: payment._id,
        book: payment.book._id,
        buyer: payment.user._id,
        seller: payment.seller._id,
        sellerType: payment.sellerType,
        totalAmount: payment.amount,
        sellerAmount: payment.commission.sellerAmount,
        superadminAmount: payment.commission.superadminAmount,
        commissionPercentage: payment.commission.commissionPercentage,
        status: "PROCESSED",
        processedAt: new Date(),
        tracker: tracker
      });
      
      const seller = await User.findById(payment.seller._id);
if (seller) {
  await seller.addEarnings(commission.sellerAmount);
     console.log(`Added ${commission.sellerAmount} to seller's pending balance.`);
        console.log(`Seller ${seller.email}: totalEarnings=${seller.wallet.totalEarnings}, pendingBalance=${seller.wallet.pendingBalance}, availableBalance=${seller.wallet.availableBalance}`);
}

      // Distribute earnings
      const { distributePurchaseEarnings } = require('./purchase.controller');
      await distributePurchaseEarnings(purchase);
      
      payment.earningsStatus = 'PROCESSED';
      payment.processedAt = new Date();
      
      console.log(`Payment ${tracker} completed. Commission distributed. Purchase ID: ${purchase._id}`);
      
      const successHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Successful</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
            .success { color: #28a745; font-size: 28px; margin-bottom: 20px; }
            .icon { font-size: 60px; margin-bottom: 20px; }
            .details { text-align: left; background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #e9ecef; }
            .detail-item { margin: 10px 0; padding-bottom: 10px; border-bottom: 1px solid #dee2e6; }
            .detail-item:last-child { border-bottom: none; }
            .detail-label { font-weight: bold; color: #495057; }
            .detail-value { color: #6c757d; }
            .btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin-top: 20px; font-weight: bold; border: none; cursor: pointer; transition: transform 0.2s; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .countdown { color: #6c757d; font-size: 14px; margin-top: 15px; }
            .loader { display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 10px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <div class="success">🎉 Payment Successful!</div>
            <p>Your book has been purchased successfully and is now available for download.</p>
            
            <div class="details">
              <div class="detail-item">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">${payment.transactionRef}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Book Title:</span>
                <span class="detail-value">${payment.book?.title || 'Book'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value">PKR ${payment.amount}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Date & Time:</span>
                <span class="detail-value">${new Date().toLocaleString()}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tracker Reference:</span>
                <span class="detail-value">${tracker}</span>
              </div>
            </div>
            
            <p>You will be redirected to your dashboard in <span id="countdown">5</span> seconds...</p>
            <div class="countdown">
              <span class="loader"></span> Processing complete
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/books" class="btn">Go to My Books</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/books/${payment.book?._id || ''}/download" class="btn" style="background: #28a745; margin-left: 10px;">Download Now</a>
          </div>
          
          <script>
            let countdown = 5;
            const countdownElement = document.getElementById('countdown');
            const countdownInterval = setInterval(() => {
              countdown--;
              countdownElement.textContent = countdown;
              if (countdown <= 0) {
                clearInterval(countdownInterval);
                window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/books';
              }
            }, 1000);
            
            // Also redirect on button click
            document.querySelectorAll('.btn').forEach(btn => {
              btn.addEventListener('click', function(e) {
                clearInterval(countdownInterval);
              });
            });
            
            // Send success notification to parent window if in iframe
            if (window.parent !== window) {
              window.parent.postMessage({
                type: 'paymentSuccess',
                tracker: '${tracker}',
                transactionId: '${payment.transactionRef}',
                bookId: '${payment.book?._id}'
              }, '*');
            }
          </script>
        </body>
        </html>
      `;
      
      await payment.save();
      return res.send(successHtml);
    } else {
      payment.status = "FAILED";
      payment.safepayResponse = {
        ...payment.safepayResponse,
        verification: verification.data || verification,
        returnUrlData: req.query
      };
      await payment.save();
      
      console.log(`Payment ${tracker} failed. Verification status:`, verification?.data?.state || verification?.status);
      
      const failedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Failed</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
            .icon { font-size: 60px; margin-bottom: 20px; }
            .btn { display: inline-block; padding: 10px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .btn-secondary { background: #6c757d; margin-left: 10px; }
            .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <div class="error">Payment Failed</div>
            <p>The payment was not successful. Please try again.</p>
            
            <div class="details">
              <p><strong>Reason:</strong> ${verification?.data?.state || verification?.status || 'Unknown'}</p>
              <p><strong>Tracker:</strong> ${tracker}</p>
              <p><strong>Amount:</strong> PKR ${payment.amount}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/books/${payment.book?._id || ''}" class="btn">Try Again</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/support" class="btn btn-secondary">Contact Support</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
              If money was deducted from your account, it will be automatically refunded within 3-5 business days.
            </p>
          </div>
          
          <script>
            // Send failure notification to parent window if in iframe
            if (window.parent !== window) {
              window.parent.postMessage({
                type: 'paymentFailed',
                tracker: '${tracker}'
              }, '*');
            }
          </script>
        </body>
        </html>
      `;
      return res.send(failedHtml);
    }
    
  } catch (error) {
    console.error("Safepay Return Error:", error);
    console.error("Error stack:", error.stack);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Processing Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #ffc107; font-size: 24px; margin-bottom: 20px; }
          .icon { font-size: 60px; margin-bottom: 20px; }
          .btn { display: inline-block; padding: 10px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .debug { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left; font-family: monospace; font-size: 12px; overflow: auto; max-height: 200px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">⚠️</div>
          <div class="error">Payment Processing Error</div>
          <p>An error occurred while processing your payment.</p>
          
          <div class="debug">
            <strong>Error Details:</strong><br>
            ${error.message}<br><br>
            <strong>Stack Trace:</strong><br>
            ${error.stack}
          </div>
          
          <p>Please contact support with your transaction details.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/support" class="btn">Contact Support</a>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" class="btn" style="background: #6c757d; margin-left: 10px;">Go Home</a>
        </div>
        
        <script>
          setTimeout(() => {
            window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:3001'}';
          }, 10000);
          
          // Send error notification to parent window if in iframe
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'paymentError',
              error: '${error.message.replace(/'/g, "\\'")}'
            }, '*');
          }
        </script>
      </body>
      </html>
    `;
    res.status(500).send(errorHtml);
  }
};

// Safepay webhook handler
const safepayWebhook = async (req, res) => {
  try {
    console.log("Safepay Webhook Received:", req.body);
    
    const signature = req.headers["x-sfpy-signature"];
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    
    // Verify webhook signature
    const isValid = SafepayService.verifyWebhookSignature(rawBody, signature);
    
    if (!isValid) {
      console.error("Invalid Safepay webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }
    
    const event = SafepayService.parseWebhookEvent(req.body);
    
    if (event.status === 'paid') {
      // Find payment by tracker
      const payment = await Payment.findOne({ tracker: event.tracker })
        .populate('book')
        .populate('seller')
        .populate('user');
        
      if (payment && payment.status !== "SUCCESS") {
        // Update payment status
        payment.status = "SUCCESS";
        payment.safepayResponse = {
          ...payment.safepayResponse,
          webhook: event
        };
        await payment.save();
        
        // Create purchase if not exists
        const existingPurchase = await Purchase.findOne({
          user: payment.user._id,
          book: payment.book._id,
          paymentStatus: 'completed'
        });
        
        if (!existingPurchase) {
          const purchase = await Purchase.create({
            user: payment.user._id,
            book: payment.book._id,
            type: 'book',
            format: 'pdf',
            amount: payment.amount,
            seller: payment.seller._id,
            sellerType: payment.sellerType,
            commission: payment.commission,
            paymentMethod: 'safepay',
            paymentStatus: 'completed',
            transactionId: payment.transactionRef,
            safepayTracker: event.tracker,
            paymentDetails: {
              method: 'safepay',
              transactionId: payment.transactionRef,
              tracker: event.tracker,
              amount: payment.amount,
              currency: 'PKR',
              status: 'completed',
              timestamp: new Date()
            }
          });
          
          // Distribute earnings async
          setTimeout(async () => {
            try {
              const { distributePurchaseEarnings } = require('./purchase.controller');
              await distributePurchaseEarnings(purchase);
              payment.earningsStatus = 'PROCESSED';
              await payment.save();
            } catch (error) {
              console.error("Webhook earnings distribution error:", error);
            }
          }, 0);
        }
        
        console.log(`Webhook: Payment ${event.tracker} processed`);
      }
    }
    
    // Always return 200 to Safepay
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(200).json({ received: true });
  }
};

const verifyPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment ID is required" 
      });
    }

    const payment = await Payment.findById(paymentId)
      .populate('book', 'title')
      .populate('user', 'firstName lastName')
      .populate('seller', 'firstName lastName');
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        transactionRef: payment.transactionRef,
        tracker: payment.tracker,
        book: payment.book,
        seller: payment.seller,
        commission: payment.commission,
        earningsStatus: payment.earningsStatus,
        createdAt: payment.createdAt,
      }
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
};

module.exports = { 
  createPayment, 
  safepayReturn, 
  safepayWebhook,
  verifyPayment: verifyPaymentStatus
};