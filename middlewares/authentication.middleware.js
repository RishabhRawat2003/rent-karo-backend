import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }
        const userExists = await User.findById(decodedToken.id).exec();
        if (!userExists) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }
        req.user = decodedToken.id;
        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}

export const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }
        const adminExists = await Admin.findById(decodedToken.id).exec();
        
        if (!adminExists) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }
        req.admin = decodedToken.id;
        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
}