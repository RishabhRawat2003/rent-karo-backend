import Wishlists from "../models/wishlists.model.js";
import Products from "../models/products.model.js";


export const addToWishlist = async (req, res) => {
    try {
        const userId = req.user;
        const { productId } = req.body;

        // Check if the product exists
        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Check if the product is already in the user's wishlist
        const wishlist = await Wishlists.findOne({ userId });

        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }
        const productExists = wishlist.products.some((item) => item.productId.toString() === productId);
        if (productExists) {
            return res.status(400).json({ message: "Product already in wishlist" });
        }
        // Add the product to the user's wishlist
        wishlist.products.push({ productId });
        await wishlist.save();
        return res.status(200).json({ message: "Product added to wishlist", wishlist });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user;
        const { productId } = req.body;

        // Check if the product exists
        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Check if the wishlist exists
        const wishlist = await Wishlists.findOne({ userId })
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }
        // Check if the product is in the user's wishlist
        const productExists = wishlist.products.some((item) => item.productId.toString() === productId);

        if (!productExists) {
            return res.status(400).json({ message: "Product not in wishlist" });
        }
        // Remove the product from the user's wishlist
        wishlist.products = wishlist.products.filter((item) => item.productId.toString() !== productId);

        await wishlist.save();

        return res.status(200).json({ message: "Product removed from wishlist", wishlist });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}