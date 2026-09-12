import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter: nodemailer.Transporter | null = null;

// Initialize the mail transporter
const initMailTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass }
    });
    console.log('✉️ Production SMTP mail transporter configured.');
  } else if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ No SMTP credentials provided in production. Using dummy console transporter to prevent hanging.');
    transporter = nodemailer.createTransport({
      streamConfig: {
        stream: process.stdout
      }
    } as any);
  } else {
    try {
      // Create a test account on Ethereal (mock SMTP for sandbox testing)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('✉️ Sandbox Mock SMTP configured (Ethereal). User:', testAccount.user);
    } catch (e: any) {
      console.warn('⚠️ NodeMailer transporter failed to initialize:', e.message);
      // Fallback dummy console transporter
      transporter = nodemailer.createTransport({
        streamConfig: {
          stream: process.stdout
        }
      } as any);
    }
  }

  return transporter;
};

export const emailService = {
  // Send OTP code
  sendOtpEmail: async (to: string, otp: string) => {
    try {
      const client = await initMailTransporter();
      const info = await client.sendMail({
        from: '"SmartMatch Career Team" <noreply@smartmatch.com>',
        to,
        subject: 'Verify your SmartMatch Account',
        text: `Your account verification OTP code is: ${otp}. It will expire in 15 minutes.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #6366f1;">Verify Your SmartMatch Profile</h2>
            <p>Thank you for registering on the Smart Internship Matching Portal.</p>
            <p>Please use the following verification code to activate your account:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 12px; background: #f3f4f6; text-align: center; border-radius: 8px; margin: 20px 0; color: #1e1b4b;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #666;">This code is valid for 15 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `
      });
      
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        console.log(`✉️ [Mock SMTP Email Sent] Preview URL: ${testUrl}`);
      }
    } catch (err: any) {
      console.error(`❌ Failed to send OTP email to ${to}:`, err.message);
    }
  },

  // Send Password Reset
  sendPasswordResetEmail: async (to: string, otp: string) => {
    try {
      const client = await initMailTransporter();
      const info = await client.sendMail({
        from: '"SmartMatch Career Team" <security@smartmatch.com>',
        to,
        subject: 'SmartMatch Password Reset Code',
        text: `You requested a password reset. Your OTP verification code is: ${otp}.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #6366f1;">Reset Your Password</h2>
            <p>We received a request to reset your SmartMatch account password.</p>
            <p>Please enter the following verification code to authorize the change:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 12px; background: #f3f4f6; text-align: center; border-radius: 8px; margin: 20px 0; color: #1e1b4b;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #666;">This code is valid for 15 minutes. If you did not make this request, verify your account security credentials.</p>
          </div>
        `
      });

      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        console.log(`✉️ [Mock SMTP Email Sent] Preview URL: ${testUrl}`);
      }
    } catch (err: any) {
      console.error(`❌ Failed to send password reset email to ${to}:`, err.message);
    }
  },

  // Send Hiring Status Update
  sendStatusUpdateEmail: async (to: string, jobRole: string, status: string) => {
    try {
      const client = await initMailTransporter();
      const info = await client.sendMail({
        from: '"SmartMatch Recruiters Feed" <notifications@smartmatch.com>',
        to,
        subject: `Application Update: ${jobRole}`,
        text: `Your application status for ${jobRole} has been updated to: ${status}. Log in to view details.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #14b8a6;">Hiring Pipeline Status Update</h2>
            <p>Your application for the position of <strong>${jobRole}</strong> has been updated.</p>
            <p>New Status: <span style="font-weight: bold; color: #4f46e5; padding: 4px 8px; background: #eeeffe; border-radius: 4px;">${status}</span></p>
            <p>Please log in to your Smart Internship Matching Portal dashboard to view coordinator comments or schedule details.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #888;">This is a automated notification. Please do not reply directly to this inbox.</p>
          </div>
        `
      });

      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        console.log(`✉️ [Mock SMTP Email Sent] Preview URL: ${testUrl}`);
      }
    } catch (err: any) {
      console.error(`❌ Failed to send status email to ${to}:`, err.message);
    }
  }
};
export default emailService;
