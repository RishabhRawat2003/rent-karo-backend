import { Router } from "express";
import { authenticateAdmin, authenticateUser } from "../middlewares/authentication.middleware.js";
import { createPayment, getAllOrders, getOrderById, getOrdersByUserId, verifyStatus } from "../controllers/order.constroller.js";

const router = Router();

router.post("/create-payment", authenticateUser, createPayment)
router.post("/verify-payment", authenticateUser, verifyStatus)
router.post("/get-orders", authenticateAdmin, getAllOrders)
router.post("/get-orders-user", authenticateUser, getOrdersByUserId)
router.get("/get-order/:id", authenticateUser, getOrderById)


export default router;