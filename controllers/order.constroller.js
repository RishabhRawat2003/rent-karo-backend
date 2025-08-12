import { Order } from "../models/order.model.js"
import { Product } from "../models/products.model.js"
import { sendOrderConfirmationEmail } from "../services/email_services.js"
import { PAID } from "../utils/enum.js"
import { processPayment } from "../utils/razorpay.js"
import crypto from "crypto"

export const createPayment = async (req, res) => {
    try {
        const { amount } = req.body

        await processPayment(amount, res)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const verifyStatus = async (req, res) => {
    try {
        const {
            orderId,
            paymentId,
            signature,
            name,
            email,
            phone,
            address,
            pincode,
            city,
            state,
            user_id,
            order_items,
            shipping_amount,
            items_total,
            total_amount
        } = req.body

        const secretKey = process.env.RAZORPAY_KEY_SECRET

        const hmac = crypto.createHmac("sha256", secretKey)

        hmac.update(orderId + "|" + paymentId)

        const generatedSignature = hmac.digest("hex")

        if (generatedSignature === signature) {
            const data = {
                name,
                email,
                phone,
                address,
                pincode,
                city,
                state,
                user_id,
                order_items,
                shipping_amount,
                items_total,
                total_amount,
                payment_status: PAID
            }
            const order = new Order(data)
            await order.save()
            const product_Details_Items = await Promise.all(
                order_items.map(async (item) => {
                    const product = await Product.findById(item.product_id);
                    return {
                        product_details: product,
                        ...item
                    };
                })
            );
            await sendOrderConfirmationEmail({
                name,
                email,
                address,
                phone,
                pincode,
                city,
                state,
                order_items: product_Details_Items,
                shipping_amount,
                items_total,
                total_amount,
                orderId: order._id
            })
            return res.status(200).json({ message: "Payment Verified successfully", response: order })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.body;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find()
                .populate("user_id order_items.product_id")
                .lean()
                .skip(skip)
                .limit(limit)
                .exec(),
            Order.countDocuments()
        ]);

        return res.status(200).json({
            message: "All Orders fetched Successfully",
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
            orders
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const getOrdersByUserId = async (req, res) => {
    try {
        const { page = 1, limit = 20, user_id } = req.body;
        const skip = (page - 1) * limit;

        if(!user_id){
            return res.status(400).json({ message: "User ID is required" })
        }

        const [orders, total] = await Promise.all([
            Order.find({ user_id })
                .populate("user_id order_items.product_id")
                .lean()
                .skip(skip)
                .limit(limit)
                .exec(),
            Order.countDocuments({ user_id })
        ]);

        return res.status(200).json({
            message: "Orders fetched successfully",
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
            orders
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Order ID is required" })
        }

        const order = await Order.findById(id).populate("user_id order_items.product_id").lean().exec()

        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        return res.status(200).json({ message: "Order fetched successfully", order })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}