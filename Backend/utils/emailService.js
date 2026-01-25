const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
const initializeSendGrid = () => {
    // Validate required environment variable
    if (!process.env.SENDGRID_API_KEY) {
        console.error('Missing required email environment variable: SENDGRID_API_KEY');
        console.error('Please check your .env file');
        return false;
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return true;
};

// Send verification code email
const sendVerificationCode = async (email, verificationCode) => {
    try {
        if (!initializeSendGrid()) {
            throw new Error('Email service not configured');
        }

        const fromEmail = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
        const companyName = process.env.COMPANY_NAME || 'Tracking Performance';
        
        const msg = {
            to: email,
            from: {
                email: fromEmail,
                name: companyName
            },
            replyTo: process.env.EMAIL_REPLY_TO || fromEmail,
            subject: `${companyName} - Your Verification Code`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 20px 0; text-align: center;">
                                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <tr>
                                        <td style="padding: 40px 30px; text-align: center; background-color: #4533b8; border-radius: 8px 8px 0 0;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${companyName}</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="color: #333; text-align: center; margin: 0 0 20px 0; font-size: 22px;">Email Verification</h2>
                                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello,</p>
                                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                                Thank you for signing up! Please use the verification code below to complete your registration:
                                            </p>
                                            <div style="background-color: #f4f4f4; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; border: 2px dashed #4533b8;">
                                                <h1 style="color: #4533b8; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">
                                                    ${verificationCode}
                                                </h1>
                                            </div>
                                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                                                This verification code will expire in <strong>15 minutes</strong> for security reasons.
                                            </p>
                                            <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                                                If you didn't request this verification code, please ignore this email. No changes will be made to your account.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 20px 30px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                                            <p style="color: #999; font-size: 11px; margin: 0;">
                                                This is an automated message from ${companyName}. Please do not reply to this email.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
            text: `
${companyName} - Email Verification

Hello,

Thank you for signing up! Please use the verification code below to complete your registration:

Verification Code: ${verificationCode}

This verification code will expire in 15 minutes for security reasons.

If you didn't request this verification code, please ignore this email. No changes will be made to your account.

---
This is an automated message from ${companyName}. Please do not reply to this email.
            `,
            categories: ['verification', 'transactional'],
            mailSettings: {
                sandboxMode: {
                    enable: false
                }
            },
            trackingSettings: {
                clickTracking: {
                    enable: false
                },
                openTracking: {
                    enable: false
                }
            }
        };

        const response = await sgMail.send(msg);
        console.log('Verification code email sent:', response[0].statusCode);
        return { success: true, messageId: response[0].headers['x-message-id'] || 'sent' };

    } catch (error) {
        console.error('Error sending verification code email:', error);
        if (error.response) {
            console.error('SendGrid error details:', error.response.body);
        }
        throw new Error('Failed to send verification code email');
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, frontendUrl) => {
    try {
        if (!initializeSendGrid()) {
            throw new Error('Email service not configured');
        }

        // Construct reset password URL
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        const fromEmail = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
        const companyName = process.env.COMPANY_NAME || 'Tracking Performance';
        
        const msg = {
            to: email,
            from: {
                email: fromEmail,
                name: companyName
            },
            replyTo: process.env.EMAIL_REPLY_TO || fromEmail,
            subject: `${companyName} - Reset Your Password`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 20px 0; text-align: center;">
                                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <tr>
                                        <td style="padding: 40px 30px; text-align: center; background-color: #4533b8; border-radius: 8px 8px 0 0;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${companyName}</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="color: #333; text-align: center; margin: 0 0 20px 0; font-size: 22px;">Password Reset Request</h2>
                                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello,</p>
                                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                                We received a request to reset your password. Click the button below to create a new password:
                                            </p>
                                            <div style="text-align: center; margin: 30px 0;">
                                                <a href="${resetUrl}" 
                                                   style="background-color: #4533b8; color: #ffffff; padding: 14px 32px; 
                                                          text-decoration: none; border-radius: 8px; font-weight: 600; 
                                                          display: inline-block; font-size: 16px; box-shadow: 0 2px 4px rgba(69, 51, 184, 0.3);">
                                                    Reset Password
                                                </a>
                                            </div>
                                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                                                Or copy and paste this link into your browser:
                                            </p>
                                            <p style="color: #4533b8; font-size: 12px; word-break: break-all; background-color: #f4f4f4; 
                                                      padding: 12px; border-radius: 4px; margin: 10px 0; font-family: monospace;">
                                                ${resetUrl}
                                            </p>
                                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                                                <strong>Important:</strong> This password reset link will expire in <strong>1 hour</strong> for security reasons.
                                            </p>
                                            <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                                                If you didn't request a password reset, please ignore this email. Your password will remain unchanged and no action is required.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 20px 30px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                                            <p style="color: #999; font-size: 11px; margin: 0;">
                                                This is an automated message from ${companyName}. Please do not reply to this email.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
            text: `
${companyName} - Password Reset Request

Hello,

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

Important: This password reset link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged and no action is required.

---
This is an automated message from ${companyName}. Please do not reply to this email.
            `,
            categories: ['password-reset', 'transactional'],
            mailSettings: {
                sandboxMode: {
                    enable: false
                }
            },
            trackingSettings: {
                clickTracking: {
                    enable: false
                },
                openTracking: {
                    enable: false
                }
            }
        };

        const response = await sgMail.send(msg);
        console.log('Password reset email sent:', response[0].statusCode);
        return { success: true, messageId: response[0].headers['x-message-id'] || 'sent' };

    } catch (error) {
        console.error('Error sending password reset email:', error);
        if (error.response) {
            console.error('SendGrid error details:', error.response.body);
        }
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    sendVerificationCode,
    sendPasswordResetEmail
};

