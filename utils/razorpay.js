import dotenv from 'dotenv'
import razorpay from 'razorpay'
 
dotenv.config({
    path: './.env'
})
 
const razorpayInstance = () => {
    return new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
}

const razorpayInstanceValue = razorpayInstance();

export const processPayment = async (amount, res) => {
    const option = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${new Date().getTime()}`
    }

    try {
        razorpayInstanceValue.orders.create(option, (err, order) => {
            if (err) {
                // console.log("Failed to create Payment")
                return res.status(401).json({ message: "Failed to create Payment" });
            }
            return res
                .status(200)
                .json({ message: "Order Created Successfully", data: order })
        })
    } catch (error) {
        // console.log("Failed to create Payment")
        return res
            .status(500)
            .json({ message: "Failed to create Payment, Try again", error: error })
    }
}