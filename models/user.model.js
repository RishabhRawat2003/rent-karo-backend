import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import { BUYER, RENTER } from "../utils/enum.js";

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: [BUYER, RENTER],
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId // Password is required only if no social login ID are present
        },
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
    address: String,
    pincode: Number,
    city: String,
    state: String,
    alternateNo: Number,
    googleId: String,
    emailVerified: {
        type: Boolean,
        default: false,
    },
    profilePicture: String,
    blockedByAdmin: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true , versionKey: false });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


export const User = mongoose.model("User", userSchema);
