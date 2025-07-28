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