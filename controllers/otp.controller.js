import { Otp } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { sendEmailVerificationMail } from "../services/email_services.js";


function generateOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    return otp;
}

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        const otpEntry = await Otp.create({
            email,
            otp,
            expiresAt
        })

        if (!otpEntry) {
            return res.status(500).json({ message: "Failed to create OTP entry" });
        }

        await sendEmailVerificationMail(email, otp);

        return res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const existOtp = await Otp.findOne({ email, otp });

        if (!existOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const currentTime = new Date();

        if (currentTime > existOtp.expiresAt) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        await Otp.deleteOne({ email, otp });

        return res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}