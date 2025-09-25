import nodemailer from 'nodemailer';

import {
  EMAIL_HOST,
  EMAIL_PASS,
  EMAIL_PORT,
  EMAIL_USER
} from './serverConfig.js';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: true,
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

export default transporter;
