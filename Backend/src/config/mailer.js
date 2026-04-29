import nodemailer from 'nodemailer';
import { env } from './env.js';

if (!env.emailUser || !env.emailPass) {
  console.warn('[mailer] EMAIL_USER o EMAIL_PASS no están definidos en .env — el envío de correo fallará');
}

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.emailUser,
    pass: env.emailPass
  }
});
