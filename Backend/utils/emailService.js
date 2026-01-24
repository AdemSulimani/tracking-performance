const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
    // Validate required environment variables
    const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_HOST', 'EMAIL_PORT'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
        console.error('Missing required email environment variables:', missingEnvVars.join(', '));
        console.error('Please check your .env file');
        return null;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        // Increased timeouts for Render network
        connectionTimeout: 30000, // 30 seconds (increased from 10)
        greetingTimeout: 30000, // 30 seconds
        socketTimeout: 30000, // 30 seconds
        // For Gmail and other services that require TLS
        requireTLS: process.env.EMAIL_PORT === '587', // Require TLS for port 587
        tls: {
            rejectUnauthorized: false // Allow self-signed certificates (use with caution)
        },
        // Debug mode (can be removed in production)
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development'
    });
    
    return transporter;
};

// Send verification code email
const sendVerificationCode = async (email, verificationCode) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            throw new Error('Email transporter not configured');
        }
        
        // Verify connection before sending (optional, but helps catch issues early)
        try {
            await transporter.verify();
            console.log('Email server connection verified');
        } catch (verifyError) {
            console.warn('Email server verification failed, but continuing:', verifyError.message);
            // Don't throw here, let it try to send anyway
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Verification Code</h2>
                    <p style="color: #666; font-size: 16px;">Hello,</p>
                    <p style="color: #666; font-size: 16px;">
                        Your verification code is:
                    </p>
                    <div style="background-color: #f4f4f4; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #333; font-size: 32px; letter-spacing: 5px; margin: 0;">
                            ${verificationCode}
                        </h1>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        This code will expire in 15 minutes.
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            `,
            text: `
                Verification Code
                
                Hello,
                
                Your verification code is: ${verificationCode}
                
                This code will expire in 15 minutes.
                
                If you didn't request this code, please ignore this email.
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification code email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending verification code email:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        // Throw more detailed error for debugging
        throw new Error(`Failed to send verification code email: ${error.message || 'Unknown error'}`);
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, frontendUrl) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            throw new Error('Email transporter not configured');
        }

        // Construct reset password URL
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Your Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
                    <p style="color: #666; font-size: 16px;">Hello,</p>
                    <p style="color: #666; font-size: 16px;">
                        You requested to reset your password. Click the button below to reset it:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4533b8; color: white; padding: 14px 28px; 
                                  text-decoration: none; border-radius: 8px; font-weight: 600; 
                                  display: inline-block; font-size: 16px;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="color: #4533b8; font-size: 12px; word-break: break-all; background-color: #f4f4f4; 
                              padding: 10px; border-radius: 4px;">
                        ${resetUrl}
                    </p>
                    <p style="color: #666; font-size: 14px; margin-top: 20px;">
                        This link will expire in 1 hour.
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                    </p>
                </div>
            `,
            text: `
                Reset Your Password
                
                Hello,
                
                You requested to reset your password. Click the link below to reset it:
                
                ${resetUrl}
                
                This link will expire in 1 hour.
                
                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    sendVerificationCode,
    sendPasswordResetEmail
};

