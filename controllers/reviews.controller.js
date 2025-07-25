import { Review } from "../models/reviews.model.js";

export const createReview = async (req, res) => {
    try {
        const { product, user, rating, comment } = req.body;

        if (!product || !user || !rating || rating < 1 || rating > 5 || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const createReview = await Review.create({
            product,
            user,
            rating,
            comment
        });

        if (!createReview) {
            return res.status(400).json({ message: "Error creating review" });
        }
        return res.status(201).json({ message: "Review created successfully", review: createReview });

    } catch (error) {
        console.error("Error creating review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const reviews = await Review.find({ product: productId })
            .populate("user", "fullName email profilePicture")
            .sort({ createdAt: -1 });

        return res.status(200).json({ reviews });
    } catch (error) {
        console.error("Error getting reviews:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteReviewByUser = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user;

        if (!reviewId) {
            return res.status(400).json({ message: "Review ID is required" });
        }

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const review = await Review.findOne({ _id: reviewId, user: userId });

        if (!review) {
            return res.status(404).json({ message: "Review not found or you are not authorized to delete this review" });
        }

        const deletedReview = await Review.deleteOne({ _id: reviewId, user: userId });

        if (!deletedReview) {
            return res.status(400).json({ message: "Error deleting review" });
        }

        return res.status(200).json({ message: "Review deleted successfully" });

    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}