import { Kyc } from "../models/kyc.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


export const createKycIndividual = async (req, res) => {
    try {
        const { aadhaarNumber, panNumber } = req.body;
        const userId = req.user;

        const aadhaarImage = req.files.aadhaarImage[0].path; // Assuming you are using multer for file uploads
        const panImage = req.files.panImage[0].path; // Assuming you are using multer for file uploads

        if (!userId || !aadhaarNumber || !panNumber || !aadhaarImage || !panImage) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const aadharImageUrl = await uploadOnCloudinary(aadhaarImage)
        const panImageUrl = await uploadOnCloudinary(panImage)

        if (!aadharImageUrl || !panImageUrl) {
            return res.status(500).json({ message: "Failed to upload images" });
        }

        const newKyc = new Kyc({
            userId,
            aadhaarNumber,
            aadhaarImage: aadharImageUrl.secure_url,
            panNumber,
            panImage: panImageUrl.secure_url,
        });

        await newKyc.save();

        if (!newKyc) {
            return res.status(400).json({ message: "Failed to create KYC" });
        }

        return res.status(201).json({ message: "KYC created successfully", kyc: newKyc });

    } catch (error) {
        console.error("Error creating KYC:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const createKycBusiness = async (req, res) => {
    try {
        const { gstNumber, organisationId, kycType } = req.body;

        const registrationImage = req.files.businessRegistrationDocument[0].path; // Assuming you are using multer for file uploads
        const panImage = req.files.companyPANCard[0].path; // Assuming you are using multer for file uploads
        const signatoryImage = req.files.authorizedSignatoryIDProof[0].path; // Assuming you are using multer for file uploads

        if (!registrationImage || !panImage || !signatoryImage) {
            return res.status(400).json({ message: "All fields are required" });
        }

        await Kyc.findOneAndDelete({ organisationId }).lean().exec();

        const registrationImageUrl = await uploadOnCloudinary(registrationImage)
        const panImageUrl = await uploadOnCloudinary(panImage)
        const signatoryImageUrl = await uploadOnCloudinary(signatoryImage)

        if (!registrationImageUrl || !panImageUrl || !signatoryImageUrl) {
            return res.status(500).json({ message: "Failed to upload images" });
        }

        const newKyc = new Kyc({
            gstNumber,
            organisationId,
            kycType,
            businessRegistrationDocument: registrationImageUrl.secure_url,
            companyPANCard: panImageUrl.secure_url,
            authorizedSignatoryIDProof: signatoryImageUrl.secure_url,
        });

        await newKyc.save();

        if (!newKyc) {
            return res.status(400).json({ message: "Failed to create KYC" });
        }

        return res.status(201).json({ message: "KYC created successfully", kyc: newKyc });

    } catch (error) {
        console.error("Error creating KYC:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllKyc = async (req, res) => {
    try {
        const kyc = await Kyc.find().populate("userId").lean().exec();

        if (!kyc || kyc.length === 0) {
            return res.status(404).json({ message: "No KYC data found" });
        }

        return res.status(200).json({ message: "KYC data fetched successfully", kyc });

    } catch (error) {
        console.error("Error fetching KYC data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getKycByOrganisationId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "KYC ID is required" });
        }

        const kyc = await Kyc.findOne({ organisationId: id }).lean().exec();

        if (!kyc) {
            return res.status(404).json({ message: "KYC data not found" });
        }

        return res.status(200).json({ message: "KYC data fetched successfully", kyc });

    } catch (error) {
        console.error("Error fetching KYC data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const getKycByUserId = async (req, res) => {
    try {
        const userId = req.user

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const kyc = await Kyc.findOne({ userId }).populate({
            model: "User",
            path: "userId",
            select: "fullName email profilePicture mobileNo"
        }).lean().exec();

        if (!kyc) {
            return res.status(404).json({ message: "KYC data not found" });
        }

        return res.status(200).json({ message: "KYC data fetched successfully", kyc });

    } catch (error) {
        console.error("Error fetching KYC data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}