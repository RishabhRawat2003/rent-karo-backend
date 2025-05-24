import { Organisation } from "../models/organisation.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createOrganisation = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user;
        const image = req.files

        if (!userId || !name || !description) {
            return res.status(400).json({ message: "All fields are required" })
        }

        let imageArr = []

        if (image.length > 0) {
            const uploadedImages = await Promise.all(
                image.map(item => uploadOnCloudinary(item.path))
            )
            imageArr = uploadedImages.map(img => img.secure_url)
        }

        const organisation = await Organisation.create({
            name,
            description,
            user: userId,
            images: imageArr
        })

        if (!organisation) {
            return res.status(400).json({ message: "Error creating organisation" })
        }

        res.status(201).json({ message: "Organisation created successfully", organisation })

    } catch (error) {
        console.log("Error creating organisation : ", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getAllOrganisation = async (req, res) => {
    try {
        const allOrganisation = await Organisation.find().populate("user").lean().exec();

        return res.status(200).json({ message: "Organisation fetched successfully", allOrganisation })

    } catch (error) {
        console.log("Error creating organisation : ", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getSingleOrganisation = async (req, res) => {
    try {
        const userId = req.user

        if (!userId) {
            return res.status(400).json({ message: "User Id is required" })
        }

        const organisation = await Organisation.findOne({ user: userId }).populate(
            {
                model: "User",
                path: "user",
                select: "fullName email profilePicture mobileNo"
            }
        ).lean().exec();

        if (!organisation) {
            return res.status(404).json({ message: "Organisation not found" })
        }

        return res.status(200).json({ message: "Organisation fetched successfully", organisation })

    } catch (error) {
        console.log("Error creating organisation : ", error)
        res.status(500).json({ message: "Internal server error" })
    }
}
