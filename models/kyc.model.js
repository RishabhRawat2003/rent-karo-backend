import mongoose from "mongoose";
import { APPROVED, BUSINESS, INDIVIDUAL, PENDING, REJECTED } from "../utils/enum.js";

const kycSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
    },
    kycType: {
        type: String,
        enum: [INDIVIDUAL, BUSINESS],
        default: INDIVIDUAL,
        required: true,
    },
    kycStatus: {
        type: String,
        enum: [PENDING, APPROVED, REJECTED],
        default: PENDING
    },
    rejectedReason: {
        type: String,
    },
    aadhaarNumber: {
        type: String,
    },
    aadhaarImage: {
        type: String, 
    },
    panNumber: {
        type: String,
    },
    panImage: {
        type: String,
    },
    gstNumber: {
        type: String,
    },
    businessRegistrationDocument: {
        type: String, 
    },
    companyPANCard: {
        type: String,
    },
    authorizedSignatoryIDProof: {
        type: String,
    }
}, {
    timestamps: true,
    versionKey: false
});

export const Kyc = mongoose.model("Kyc", kycSchema);
