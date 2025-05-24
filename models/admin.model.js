import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import { SUB_ADMIN, SUPER_ADMIN } from "../utils/enum.js";

const adminSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: [SUB_ADMIN, SUPER_ADMIN],
        required: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        min: 6
    },
    mobileNo: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    profilePicture: String,
}, { timestamps: true , versionKey: false });

adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


export const Admin = mongoose.model("Admin", adminSchema);
