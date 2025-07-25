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
            sub_category,
            organisationId
        } = req.body

        const images = req.files

        if (!title || !subTitle || !description || !stocks || !wanted_to_sell || !realSellingPrice || !discountOnSellingPrice || !sellingPrice || !category || !sub_category || !organisationId || !rentalPricing || !specifications) {
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
            sub_category,
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
        const { page = 1, limit = 20, wanted_to_sell, category , searchedName} = req.body;
        const skip = (page - 1) * limit;

        // Build the filter condition
        const filter = {};
        if (wanted_to_sell === true || wanted_to_sell === false) {
            filter.wanted_to_sell = wanted_to_sell;
        }

        if (category) {
            filter.category = category;
        }

        if (searchedName) {
            filter.title = { $regex: searchedName, $options: 'i' };
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
        const { title, subTitle, description, stocks, wanted_to_sell, realSellingPrice, discountOnSellingPrice, sub_category, sellingPrice, rentalPricing, specifications, category, organisationId, existingImages } = req.body
        const images = req.files

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" })
        }

        if (!title || !subTitle || !description || !stocks || !wanted_to_sell || !sub_category || !realSellingPrice || !discountOnSellingPrice || !sellingPrice || !category || !organisationId || !rentalPricing || !specifications || !existingImages) {
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
        if (sub_category) update.sub_category = sub_category
        if (rentalPricingObj) update.rentalPricing = rentalPricingObj
        if (specificationsArr) update.specifications = specificationsArr
        if (organisationId) update.organisationId = organisationId
        if (images.length > 0) {
            if (imagesArr) update.images = imagesArr
        } else {
            update.images = presentImages
        }

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

export const getProductsByCategoryWithFallback = async (req, res) => {
    try {
        const { category } = req.body;

        if (!category) {
            return res.status(400).json({ message: "Category is required" });
        }

        // First, find products with the given category (max 4)
        const categoryProducts = await Product.find({ category })
            .populate("organisationId")
            .lean()
            .limit(4);

        let products = [...categoryProducts];

        if (categoryProducts.length < 4) {
            const remaining = 4 - categoryProducts.length;

            const additionalProducts = await Product.aggregate([
                { $match: { category: { $ne: category } } },
                { $sample: { size: remaining } }
            ]);

            // Optionally populate manually if using aggregate (if needed)
            const populatedAdditional = await Product.populate(additionalProducts, {
                path: "organisationId"
            });

            products = [...categoryProducts, ...populatedAdditional];
        }

        return res.status(200).json({
            message: "Products fetched successfully",
            category: category,
            totalProducts: products.length,
            products
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

