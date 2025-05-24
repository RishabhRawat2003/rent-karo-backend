import mongoose from 'mongoose';
import { BUY, RENT } from '../utils/enum.js';

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                productType: {
                    type: String,
                    enum: [BUY, RENT],
                    default: RENT,
                },
                selected_rental_pricing_day: {
                    type: Number,
                    required: function () {
                        return this.productType === RENT;
                    }
                },
            },
        ],
    },
    { timestamps: true, versionKey: false }
);

export const Cart = mongoose.model('Cart', cartSchema);