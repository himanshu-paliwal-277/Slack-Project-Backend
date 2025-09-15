import nodemailer from 'nodemailer';

import {
  EMAIL_HOST,
  EMAIL_PASS,
  EMAIL_PORT,
  EMAIL_USER
} from './serverConfig.js';

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: true, // true for port 465, false for 587
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Verify connection config
transporter.verify((error) => {
  if (error) {
    console.error('Email config error:', error);
  } else {
    console.log('Email server is ready 🚀');
  }
});

// Function to send email
export const sendWorkspaceMail = async (toEmail, workspaceName) => {
  try {
    const info = await transporter.sendMail({
      from: `"Workspace Team" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Workspace Created Successfully ✅',
      html: `
        <h2>Hello,</h2>
        <p>Your workspace <strong>${workspaceName}</strong> has been created successfully!</p>
        <p>You can now start adding members and managing your workspace.</p>
        <br/>
        <p>Best regards,<br/>Workspace Team</p>
      `
    });

    console.log('✅ Email sent: ' + info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};
