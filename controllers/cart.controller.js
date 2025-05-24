import { Cart } from "../models/cart.model.js";


export const addToCart = async (req, res) => {
    try {
        const userId = req.user;
        const { items } = req.body;

        const cartItems = JSON.parse(items);

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart items are required" });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            const newCart = new Cart({ user: userId, items: cartItems });
            await newCart.save();
            return res.status(201).json({ message: "Cart created successfully", cart: newCart });
        }

        // Loop through incoming items and update or add to cart
        for (const newItem of cartItems) {
            const existingItem = cart.items.find(
                (item) =>
                    item.product.toString() === newItem.product &&
                    item.productType === newItem.productType &&
                    (item.productType === 'buy' || item.selected_rental_pricing_day === newItem.selected_rental_pricing_day)
            );

            if (existingItem) {
                existingItem.quantity += newItem.quantity;
            } else {
                cart.items.push(newItem);
            }
        }

        await cart.save();
        return res.status(200).json({ message: "Cart updated successfully", cart });

    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const clearCart = async (req, res) => {
    try {
        const userId = req.user;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = [];

        await cart.save();
        return res.status(200).json({ message: "Cart cleared successfully", cart });

    } catch (error) {
        console.error("Error clearing cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const removeItemFromCart = async (req, res) => {
    try {
        const userId = req.user;
        const { productId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the index of the item to be removed
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Remove the item from the cart
        cart.items.splice(itemIndex, 1);

        await cart.save();

        return res.status(200).json({ message: "Item removed from cart successfully", cart });

    } catch (error) {
        console.error("Error removing item from cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const increaseItemQuantity = async (req, res) => {
    try {
        const userId = req.user;
        const { productId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the item in the cart
        const item = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Increase the quantity of the item
        item.quantity += 1;

        await cart.save();

        return res.status(200).json({ message: "Item quantity increased successfully", cart });

    } catch (error) {
        console.error("Error increasing item quantity:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const decreaseItemQuantity = async (req, res) => {
    try {
        const userId = req.user;
        const { productId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the item in the cart
        const item = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Decrease the quantity of the item
        if (item.quantity > 1) {
            item.quantity -= 1;
        }
        else {
            // If quantity is 1, remove the item from the cart
            const itemIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );
            cart.items.splice(itemIndex, 1);
        }

        await cart.save();

        return res.status(200).json({ message: "Item quantity decreased successfully", cart });

    } catch (error) {
        console.error("Error decreasing item quantity:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getCart = async (req, res) => {
    try {
        const userId = req.user;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        return res.status(200).json({ message: "Cart retrieved successfully", cart });

    } catch (error) {
        console.error("Error getting cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}