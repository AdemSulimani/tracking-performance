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

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send verification code email
const sendVerificationCode = async (email, verificationCode) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            throw new Error('Email transporter not configured');
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
        throw new Error('Failed to send verification code email');
    }
};

module.exports = {
    sendVerificationCode
};

