const generateEmailTemplate = (verificationCode, name = 'User') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code - Book Store</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
            position: relative;
        }
        
        .email-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="%23ffffff" opacity="0.1"><polygon points="1000,100 1000,0 0,100"/></svg>');
            background-size: cover;
        }
        
        .logo {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 2;
        }
        
        .logo-subtitle {
            font-size: 16px;
            font-weight: 300;
            opacity: 0.9;
            position: relative;
            z-index: 2;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
        }
        
        .message {
            color: #4a5568;
            font-size: 16px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .otp-card {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 3px solid;
            border-image: linear-gradient(135deg, #667eea, #764ba2) 1;
            position: relative;
            overflow: hidden;
        }
        
        .otp-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #667eea, #764ba2);
        }
        
        .otp-label {
            color: #718096;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .otp-code {
            font-size: 48px;
            font-weight: 700;
            color: #2d3748;
            letter-spacing: 8px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .expiry-note {
            color: #e53e3e;
            font-size: 14px;
            font-weight: 500;
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .security-section {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .security-title {
            color: #c53030;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .security-list {
            list-style: none;
            padding: 0;
        }
        
        .security-list li {
            padding: 8px 0;
            color: #744210;
            font-size: 14px;
            position: relative;
            padding-left: 20px;
        }
        
        .security-list li::before {
            content: '⚠️';
            position: absolute;
            left: 0;
            top: 8px;
        }
        
        .instruction {
            text-align: center;
            color: #4a5568;
            font-size: 15px;
            margin: 25px 0;
            line-height: 1.8;
        }
        
        .support-note {
            background: #ebf8ff;
            border: 1px solid #bee3f8;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
            color: #2c5282;
            font-size: 14px;
        }
        
        .email-footer {
            background: #f7fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .social-links {
            margin: 15px 0;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        
        .copyright {
            color: #718096;
            font-size: 12px;
            margin-top: 15px;
        }
        
        .book-icon {
            font-size: 20px;
            margin-right: 8px;
        }
        
        .timer-icon {
            font-size: 14px;
        }
        
        @media (max-width: 480px) {
            .email-body {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 36px;
                letter-spacing: 6px;
            }
            
            .greeting {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <div class="logo">📚 Book Store</div>
            <div class="logo-subtitle">Your Literary Journey Begins Here</div>
        </div>
        
        <div class="email-body">
            <h1 class="greeting">Hello, ${name}!</h1>
            
            <p class="message">
                Welcome to Book Store! We're excited to have you join our community of book lovers. 
                To complete your registration, please use the verification code below:
            </p>
            
            <div class="otp-card">
                <div class="otp-label">Verification Code</div>
                <div class="otp-code">${verificationCode}</div>
                <div class="expiry-note">
                    <span class="timer-icon">⏰</span>
                    Expires in 10 minutes
                </div>
            </div>
            
            <div class="security-section">
                <div class="security-title">
                    <span>🔒 Security Notice</span>
                </div>
                <ul class="security-list">
                    <li>Never share this code with anyone, including Book Store staff</li>
                    <li>This code is for your use only and should be kept confidential</li>
                    <li>If you didn't request this code, please ignore this email</li>
                </ul>
            </div>
            
            <p class="instruction">
                Enter this code in the verification field on our website or app to complete your registration 
                and start exploring our vast collection of books.
            </p>
            
            <div class="support-note">
                💡 <strong>Need help?</strong> If you're having trouble with the code, you can request a new one from the app, 
                or contact our support team for assistance.
            </div>
        </div>
        
        <div class="email-footer">
            <div class="social-links">
                <a href="#" class="social-link">Website</a>
                <a href="#" class="social-link">Support</a>
                <a href="#" class="social-link">Contact Us</a>
            </div>
            <div class="copyright">
                <p>&copy; ${new Date().getFullYear()} Book Store. All rights reserved.</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// For password reset OTP
generateEmailTemplate.passwordReset = (verificationCode, name = 'User') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - Book Store</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .email-header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
            position: relative;
        }
        
        .email-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="%23ffffff" opacity="0.1"><polygon points="0,0 1000,100 1000,0"/></svg>');
            background-size: cover;
        }
        
        .logo {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 2;
        }
        
        .logo-subtitle {
            font-size: 16px;
            font-weight: 300;
            opacity: 0.9;
            position: relative;
            z-index: 2;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
        }
        
        .message {
            color: #4a5568;
            font-size: 16px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .otp-card {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 3px solid;
            border-image: linear-gradient(135deg, #f093fb, #f5576c) 1;
            position: relative;
            overflow: hidden;
        }
        
        .otp-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #f093fb, #f5576c);
        }
        
        .otp-label {
            color: #718096;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .otp-code {
            font-size: 48px;
            font-weight: 700;
            color: #2d3748;
            letter-spacing: 8px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #f093fb, #f5576c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .expiry-note {
            color: #e53e3e;
            font-size: 14px;
            font-weight: 500;
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .security-section {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .security-title {
            color: #c53030;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .security-list {
            list-style: none;
            padding: 0;
        }
        
        .security-list li {
            padding: 8px 0;
            color: #744210;
            font-size: 14px;
            position: relative;
            padding-left: 20px;
        }
        
        .security-list li::before {
            content: '🔐';
            position: absolute;
            left: 0;
            top: 8px;
        }
        
        .instruction {
            text-align: center;
            color: #4a5568;
            font-size: 15px;
            margin: 25px 0;
            line-height: 1.8;
        }
        
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #f093fb, #f5576c);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            margin: 15px 0;
            box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
            transition: transform 0.3s ease;
        }
        
        .action-button:hover {
            transform: translateY(-2px);
        }
        
        .support-note {
            background: #ebf8ff;
            border: 1px solid #bee3f8;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
            color: #2c5282;
            font-size: 14px;
        }
        
        .email-footer {
            background: #f7fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .social-links {
            margin: 15px 0;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #f5576c;
            text-decoration: none;
            font-weight: 500;
        }
        
        .copyright {
            color: #718096;
            font-size: 12px;
            margin-top: 15px;
        }
        
        .timer-icon {
            font-size: 14px;
        }
        
        @media (max-width: 480px) {
            .email-body {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 36px;
                letter-spacing: 6px;
            }
            
            .greeting {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <div class="logo">📚 Book Store</div>
            <div class="logo-subtitle">Secure Your Account</div>
        </div>
        
        <div class="email-body">
            <h1 class="greeting">Hello, ${name}!</h1>
            
            <p class="message">
                We received a request to reset your Book Store password. 
                Use the verification code below to secure your account:
            </p>
            
            <div class="otp-card">
                <div class="otp-label">Password Reset Code</div>
                <div class="otp-code">${verificationCode}</div>
                <div class="expiry-note">
                    <span class="timer-icon">⏰</span>
                    Expires in 10 minutes
                </div>
            </div>
            
            <div class="security-section">
                <div class="security-title">
                    <span>🛡️ Account Security</span>
                </div>
                <ul class="security-list">
                    <li>If you didn't request this reset, your account may be compromised</li>
                    <li>Never share this code with anyone</li>
                    <li>Create a strong, unique password after resetting</li>
                </ul>
            </div>
            
            <p class="instruction">
                Enter this code in the password reset form to create a new password and regain access to your Book Store account.
            </p>
            
            <div style="text-align: center;">
                <a href="#" class="action-button">Reset Password Now</a>
            </div>
            
            <div class="support-note">
                ❓ <strong>Not you?</strong> If you didn't request a password reset, please contact our support team immediately 
                to secure your account.
            </div>
        </div>
        
        <div class="email-footer">
            <div class="social-links">
                <a href="#" class="social-link">Website</a>
                <a href="#" class="social-link">Support</a>
                <a href="#" class="social-link">Contact Us</a>
            </div>
            <div class="copyright">
                <p>&copy; ${new Date().getFullYear()} Book Store. All rights reserved.</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = generateEmailTemplate;