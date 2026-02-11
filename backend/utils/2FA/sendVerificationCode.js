const generateEmailTemplate = require("./generateEmailTemplate");
const sendEmail = require("./sendEmail");

async function sendVerificationCode(verificationMethod, verificationCode, name, email, phone, res) {
    try {
      if (verificationMethod === "email") {
        const message = generateEmailTemplate(verificationCode, name);
        await sendEmail({ email, subject: "Your Verification Code - Your App Name", message });
        return {
          success: true,
          message: `Verification code sent to ${email}`
        };
      } else if (verificationMethod === "phone") {
        const verificationCodeWithSpace = verificationCode.toString().split("").join(" ");
        await client.calls.create({
          twiml: `<Response><Say>Hello ${name}. Your verification code is ${verificationCodeWithSpace}. Your verification code is ${verificationCodeWithSpace}. This code will expire in 10 minutes.</Say></Response>`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        return {
          success: true,
          message: `Verification code sent to your phone`
        };
      }
      return {
        success: false,
        message: "Invalid verification method."
      };
    } catch (error) {
      console.error("Verification code sending error:", error);
      throw new Error("Verification code failed to send.");
    }
  }

// For password reset
async function sendPasswordResetCode(verificationMethod, verificationCode, name, email, phone, res) {
    try {
      if (verificationMethod === "email") {
        const message = generateEmailTemplate.passwordReset(verificationCode, name);
        await sendEmail({ email, subject: "Password Reset Code - Your App Name", message });
        return {
          success: true,
          message: `Password reset code sent to ${email}`
        };
      } else if (verificationMethod === "phone") {
        const verificationCodeWithSpace = verificationCode.toString().split("").join(" ");
        await client.calls.create({
          twiml: `<Response><Say>Hello ${name}. Your password reset code is ${verificationCodeWithSpace}. Your password reset code is ${verificationCodeWithSpace}. This code will expire in 10 minutes.</Say></Response>`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        return {
          success: true,
          message: `Password reset code sent to your phone`
        };
      }
      return {
        success: false,
        message: "Invalid verification method."
      };
    } catch (error) {
      console.error("Password reset code sending error:", error);
      throw new Error("Password reset code failed to send.");
    }
  }

module.exports = {
  sendVerificationCode,
  sendPasswordResetCode
};