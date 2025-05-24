import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendEmailVerificationMail(to, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const text = `Hi there,\n\nYour OTP code for email verification is: ${otp}\n\nPlease enter this code to complete your verification.\n\nIf you did not request this, please ignore this email.\n\nThanks,\nTeam Rent Karo`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'OTP Verification - Email Confirmation',
        text
    });
}

