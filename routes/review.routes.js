import { Router } from "express";
import { authenticateUser } from "../middlewares/authentication.middleware.js";
import { createReview, deleteReviewByUser, getReviews } from "../controllers/reviews.controller.js";

const router = Router();

router.post("/create-review", authenticateUser, createReview)
router.post("/get-reviews/:productId", getReviews)
router.post("/delete/:reviewId", authenticateUser, deleteReviewByUser)


export default router;