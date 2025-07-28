import { Router } from "express";
import { authenticateUser } from "../middlewares/authentication.middleware.js";
import { createPayment, verifyStatus } from "../controllers/order.constroller.js";

const router = Router();

router.post("/create-payment", authenticateUser, createPayment)
router.post("/verify-payment", authenticateUser, verifyStatus)


export default router;