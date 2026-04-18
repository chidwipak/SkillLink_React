const nodemailer = require('nodemailer');

// Check if email credentials are configured
const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

// Create email transporter only if credentials exist
let transporter = null;

if (emailConfigured) {
  // Configuration for email transporter
  const transportConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  // Only add service if it's gmail
  if (process.env.EMAIL_SERVICE === 'gmail') {
    transportConfig.service = 'gmail';
  }

  transporter = nodemailer.createTransport(transportConfig);

  // Verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log('❌ Email transporter error:', error.message);
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
} else {
  console.log('ℹ️ Email service not configured (EMAIL_USER/EMAIL_PASSWORD missing). Email features disabled.');
}

// Send email verification OTP
exports.sendVerificationEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"SkillLink" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - SkillLink',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Welcome to SkillLink!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with SkillLink. To complete your registration, please verify your email address using the OTP below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your Verification OTP</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Note:</strong> Never share this OTP with anyone. SkillLink staff will never ask for your OTP.
            </div>
            
            <p>If you didn't create an account with SkillLink, please ignore this email.</p>
            
            <p>Best regards,<br><strong>The SkillLink Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SkillLink. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (!transporter) {
      console.log('ℹ️ Email not sent (service not configured). OTP:', otp);
      return { success: true, messageId: 'email-disabled', note: 'Email service not configured' };
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"SkillLink" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - SkillLink',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password for your SkillLink account.</p>
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:<br>
            <a href="${resetUrl}">${resetUrl}</a></p>
            
            <div class="warning">
              <strong>⚠️ Security Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </div>
            
            <p>Best regards,<br><strong>The SkillLink Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SkillLink. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (!transporter) {
      console.log('ℹ️ Password reset email not sent (service not configured). Reset URL:', resetUrl);
      return { success: true, messageId: 'email-disabled', note: 'Email service not configured' };
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send rejection email when user registration is declined
exports.sendRejectionEmail = async (email, name, feedback) => {
  const mailOptions = {
    from: `"SkillLink" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Registration Update - SkillLink',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feedback-box { background: white; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 20px 0; border-radius: 0 5px 5px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .info { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 10px 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Registration Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We regret to inform you that your registration on SkillLink has been reviewed and <strong>could not be approved</strong> at this time.</p>
            
            <div class="feedback-box">
              <p style="margin: 0; font-size: 14px; color: #666; font-weight: bold;">Reason for Rejection:</p>
              <p style="margin: 10px 0 0 0; color: #333;">${feedback}</p>
            </div>
            
            <div class="info">
              <strong>What can you do?</strong><br>
              You may register again with updated and valid details. Make sure all required information is correctly provided.
            </div>
            
            <p>If you believe this was a mistake, please contact our support team.</p>
            
            <p>Best regards,<br><strong>The SkillLink Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SkillLink. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (!transporter) {
      console.log('ℹ️ Rejection email not sent (service not configured). Feedback:', feedback);
      return { success: true, messageId: 'email-disabled', note: 'Email service not configured' };
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking notification email
exports.sendBookingNotificationEmail = async (email, name, bookingDetails) => {
  const mailOptions = {
    from: `"SkillLink" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Booking Confirmation - SkillLink',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Booking Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Your booking has been confirmed successfully!</p>
            
            <div class="booking-details">
              <h3>Booking Details:</h3>
              <div class="detail-row">
                <span><strong>Service:</strong></span>
                <span>${bookingDetails.service}</span>
              </div>
              <div class="detail-row">
                <span><strong>Worker:</strong></span>
                <span>${bookingDetails.worker}</span>
              </div>
              <div class="detail-row">
                <span><strong>Date:</strong></span>
                <span>${bookingDetails.date}</span>
              </div>
              <div class="detail-row">
                <span><strong>Time:</strong></span>
                <span>${bookingDetails.time}</span>
              </div>
              <div class="detail-row">
                <span><strong>Status:</strong></span>
                <span style="color: #28a745;">Pending</span>
              </div>
            </div>
            
            <p>The worker will review your booking request and respond shortly.</p>
            
            <p>Best regards,<br><strong>The SkillLink Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SkillLink. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (!transporter) {
      console.log('ℹ️ Booking notification email not sent (service not configured)');
      return { success: true, messageId: 'email-disabled', note: 'Email service not configured' };
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending booking notification email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = exports;
