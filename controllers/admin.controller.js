import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken";

export const createAdmin = async (req, res) => {
    try {
        const { role, fullName, password, mobileNo, email } = req.body;

        if (!role || !fullName || !password || !email || !mobileNo) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({ message: "Admin with this email already exists" });
        }

        const admin = new Admin({
            role,
            fullName,
            password,
            mobileNo,
            email,
        });

        await admin.save();

        return res.status(201).json({ message: "Admin created successfully", admin });

    } catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select("-password");

        if (!admins || admins.length === 0) {
            return res.status(404).json({ message: "No admins found" });
        }

        return res.status(200).json({ message: "Admins fetched successfully", admins });

    } catch (error) {
        console.error("Error fetching admins:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ message: "Admin not found" });
        }

        const isPasswordCorrect = await admin.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET
        )

        const { password: _, ...adminData } = admin._doc; // Exclude password from response

        return res.status(200).json({
            message: "Admin Login successful",
            token,
            admin: adminData,
        });

    } catch (error) {
        console.error("Error logging in admin:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}