import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"
import morgan from "morgan"
import compression from "compression"
import userRouter from './routes/user.routes.js'
import adminRouter from './routes/admin.routes.js'
import otpRouter from './routes/otp.routes.js'
import kycRouter from './routes/kyc.routes.js'
import organisationRouter from './routes/organisation.routes.js'

const app = express()

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                return callback(new Error("Not allowed by CORS"), false);
            }
            return callback(null, true);
        },
        credentials: true,
    })
);


app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())
app.use(morgan("dev"))
app.use(compression())




app.use('/api/v1/user', userRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/otp', otpRouter)
app.use('/api/v1/kyc', kycRouter)
app.use('/api/v1/organisation', organisationRouter)

export { app }