import mongoose from "mongoose";
import { CANCELLED, DELIVERED, PAID, PENDING, RETURNED, SHIPPED, UNPAID } from "../utils/enum.js";


const orderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        pincode: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        order_items: [
            {
                product_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1
                },
                wanted_to_sell: {
                    type: Boolean,
                    default: false
                },
                realSellingPrice: {
                    type: Number
                },
                sellingPrice: {
                    type: Number
                },
                discountOnSellingPrice: {
                    type: Number
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
            }
        ],
        payment_status: {
            type: String,
            enum: [PAID, UNPAID],
            default: UNPAID
        },
        order_status: {
            type: String,
            enum: [PENDING, SHIPPED, DELIVERED, RETURNED, CANCELLED],
            default: PENDING
        },
        shipping_amount: {
            type: Number,
            default: 0
        },
        items_total: {
            type: Number,
            default: 0
        },
        total_amount: {
            type: Number,
            default: 0
        }
    }, {
    timestamps: true,
    versionKey: false
})


export const Order = mongoose.model("Order", orderSchema);