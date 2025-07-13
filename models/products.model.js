import mongoose from "mongoose";

const specificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    data: [
        {
            key: { type: String, required: true },
            value: { type: String, required: true },
        },
    ],
});

const productsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        subTitle: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        images: [
            {
                type: String,
            }
        ],
        stocks: {
            type: Number,
            required: true,
        },
        wanted_to_sell: {
            type: Boolean,
            default: false,
        },
        realSellingPrice: {
            type: Number,
        },
        discountOnSellingPrice: {
            type: Number,
            default: 0,
        },
        sellingPrice: {
            type: Number,
        },
        rentalPricing: {
            type: [
                {
                    day: { type: Number, required: true },
                    realPrice: { type: Number, required: true },
                    discount: { type: Number, default: 0 },
                    discountPrice: { type: Number },
                }
            ],
            default: [],
        },
        specifications: {
            type: [specificationSchema],
            default: [],
        },
        category: {
            type: String,
            required: true,
        },
        organisationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organisation",
            required: true,
        },
        blockedByAdmin:{
            type: Boolean,
            default: false,
        }
    }
    , {
        timestamps: true,
        versionKey: false
    }
)


export const Product = mongoose.model("Product", productsSchema);