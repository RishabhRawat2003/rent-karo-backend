import { Product } from "../models/products.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


export const createProduct = async (req, res) => {
    try {
        const {
            title,
            subTitle,
            description,
            stocks,
            wanted_to_sell,
            realSellingPrice,
            discountOnSellingPrice,
            sellingPrice,
            rentalPricing,
            specifications,
            category,
            organisationId
        } = req.body

        const images = req.files

        if (!title || !subTitle || !description || !stocks || !wanted_to_sell || !realSellingPrice || !discountOnSellingPrice || !sellingPrice || !category || !organisationId || !rentalPricing || !specifications) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (images && images.length < 0) {
            return res.status(400).json({ message: "Atleast one image is required" })
        }

        let rentalPricingObj = {}
        if (rentalPricing) {
            rentalPricingObj = JSON.parse(rentalPricing)
        }

        let specificationsArr = []
        if (specifications) {
            specificationsArr = JSON.parse(specifications)
        }

        let imagesArr = []
        if (images && images.length > 0) {
            const uploadedImages = await Promise.all(
                images.map(item => uploadOnCloudinary(item.path))
            )
            imagesArr = uploadedImages.map(img => img.secure_url)
        }

        const product = await Product.create({
            title,
            subTitle,
            description,
            stocks,
            wanted_to_sell,
            realSellingPrice,
            discountOnSellingPrice,
            sellingPrice,
            rentalPricing: rentalPricingObj,
            specifications: specificationsArr,
            category,
            organisationId,
            images: imagesArr
        })

        if (!product) {
            return res.status(400).json({ message: "Error creating product" })
        }

        return res.status(201).json({ message: "Product created successfully", product })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 20, wanted_to_sell } = req.body;
        const skip = (page - 1) * limit;

        // Build the filter condition
        const filter = {};
        if (wanted_to_sell === true || wanted_to_sell === false) {
            filter.wanted_to_sell = wanted_to_sell;
        }

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("organisationId")
                .lean()
                .skip(skip)
                .limit(limit)
                .exec(),
            Product.countDocuments(filter)
        ]);

        return res.status(200).json({
            message: "Products fetched successfully",
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            products
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" })
        }

        const product = await Product.findById(id).populate("organisationId").lean().exec()

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        return res.status(200).json({ message: "Product fetched successfully", product })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteProductById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" })
        }

        const product = await Product.findByIdAndDelete(id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        return res.status(200).json({ message: "Product deleted successfully", product })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updateProductById = async (req, res) => {
    try {
        const { id } = req.params
        const { title, subTitle, description, stocks, wanted_to_sell, realSellingPrice, discountOnSellingPrice, sellingPrice, rentalPricing, specifications, category, organisationId, existingImages } = req.body
        const images = req.files

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" })
        }

        if (!title || !subTitle || !description || !stocks || !wanted_to_sell || !realSellingPrice || !discountOnSellingPrice || !sellingPrice || !category || !organisationId || !rentalPricing || !specifications || !existingImages) {
            return res.status(400).json({ message: "All fields are required" })
        }

        let rentalPricingObj = {}
        if (rentalPricing) {
            rentalPricingObj = JSON.parse(rentalPricing)
        }

        let specificationsArr = []
        if (specifications) {
            specificationsArr = JSON.parse(specifications)
        }

        let presentImages = JSON.parse(existingImages)
        let imagesArr = []
        if (images && images.length > 0) {
            const uploadedImages = await Promise.all(
                images.map(item => uploadOnCloudinary(item.path))
            )
            imagesArr = [...presentImages, ...uploadedImages.map(img => img.secure_url)]
        }

        let update = {}
        if (title) update.title = title
        if (subTitle) update.subTitle = subTitle
        if (description) update.description = description
        if (stocks) update.stocks = stocks
        if (wanted_to_sell) update.wanted_to_sell = wanted_to_sell
        if (realSellingPrice) update.realSellingPrice = realSellingPrice
        if (discountOnSellingPrice) update.discountOnSellingPrice = discountOnSellingPrice
        if (sellingPrice) update.sellingPrice = sellingPrice
        if (category) update.category = category
        if (rentalPricingObj) update.rentalPricing = rentalPricingObj
        if (specificationsArr) update.specifications = specificationsArr
        if (organisationId) update.organisationId = organisationId
        if (imagesArr) update.images = imagesArr

        const product = await Product.findByIdAndUpdate(id, update, { new: true })

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        return res.status(200).json({ message: "Product updated successfully" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getProductsByOrgId = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.body; // default page = 1, limit = 10
        const skip = (page - 1) * limit;

        if (!id) {
            return res.status(400).json({ message: "Organisation ID is required" });
        }

        const [products, total] = await Promise.all([
            Product.find({ organisationId: id })
                .populate("organisationId")
                .lean()
                .skip(skip)
                .limit(limit)
                .exec(),
            Product.countDocuments({ organisationId: id })
        ]);

        return res.status(200).json({
            message: "Products fetched successfully",
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            products
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
