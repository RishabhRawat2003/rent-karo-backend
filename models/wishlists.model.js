import mongoose from "mongoose";

const wishlistsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        }
    ],
}, { timestamps: true, versionKey: false });

export const User = mongoose.model("Wishlists", wishlistsSchema);
