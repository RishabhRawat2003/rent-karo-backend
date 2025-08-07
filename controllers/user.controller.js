import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import { Order } from "../models/order.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateUsername(fullName) {
    const randomNumber = Math.floor(Math.random() * 1000);
    return fullName.split(" ").join("").toLowerCase() + randomNumber;
}

export const signup = async (req, res) => {
    try {
        const {
            role,
            fullName,
            password,
            mobileNo,
            email
        } = req.body

        if (!role || !fullName || !password || !email || !mobileNo) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }

        let username;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            username = generateUsername(fullName);
            const existingUser = await User.findOne({ username }).lean().exec()
            if (!existingUser) {
                isUnique = true;
            }
            attempts++;
        }

        const user = await User.create({
            role,
            fullName,
            password,
            mobileNo,
            email,
            username,
            emailVerified: true
        })

        if (!user) {
            return res.status(500).json({
                message: "User creation failed",
                success: false
            })
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET
        )

        return res.status(201).json({
            message: "User created successfully",
            success: true,
            user,
            token
        })

    } catch (error) {
        // Check for duplicate key error (Mongo code 11000)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            return res
                .status(409)
                .json({
                    message: `User with This ${field} ${value} already exists`,
                    success: false,
                });
        }

        // Catch any other unexpected errors
        console.error("Signup Error:", error);
        return res
            .status(500)
            .json({
                message: "Internal server error",
                success: false,
            });
    }
}

export const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }

        const user = await User.findOne({ email }).exec()

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        const isPasswordValid = await user.isPasswordCorrect(password)

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid Credentials",
                success: false
            })
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET
        )

        return res.status(200).json({
            message: "Login successful",
            success: true,
            user,
            token
        })
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//google authentication
export const googleSignup = async (req, res) => {
    const { idToken, role } = req.body;

    if (!idToken) {
        return res.status(400).json({
            message: "ID token is required",
            success: false
        });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const {
            sub: googleId,
            email,
            given_name: firstName,
            family_name: lastName,
            picture: profilePicture,
            email_verified: emailVerified
        } = payload;
        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (!user) {
            let username;
            let isUnique = false;
            let attempts = 0;

            while (!isUnique && attempts < 10) {
                username = generateUsername(`${firstName} ${lastName}`);
                const existingUser = await User.findOne({ username }).lean().exec()
                if (!existingUser) {
                    isUnique = true;
                }
                attempts++;
            }

            user = new User({
                googleId,
                email,
                role,
                fullName: `${firstName} ${lastName}`,
                profilePicture,
                emailVerified,
                username
            });
            await user.save()
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET
        )

        return res.status(200).json({
            message: "Login successful",
            success: true,
            user,
            token
        })
    } catch (error) {
        console.error("Google Signup Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

export const googleLogin = async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({
            message: "ID token is required",
            success: false
        });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const {
            sub: googleId,
        } = payload;

        let user = await User.findOne({
            googleId
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET
        )

        return res.status(200).json({
            message: "Login successful",
            success: true,
            user,
            token
        })
    } catch (error) {
        console.error("Google Login Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

export const getUser = async (req, res) => {
    try {
        const id = req.user;

        if (!id) {
            return res.status(400).json({
                message: "User ID is required",
                success: false
            })
        }

        const user = await User.findById(id).select("-password").exec()

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "User retrieved successfully",
            success: true,
            user
        })

    } catch (error) {
        console.error("Get User Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

export const updateDetails = async (req, res) => {
    try {
        const id = req.user;
        const { fullName, mobileNo, email, username, address, pincode, city, state, alternateNo } = req.body;
        const { img } = req.files || {};

        if (!id) {
            return res.status(400).json({
                message: "User ID is required",
                success: false
            })
        }

        const user = await User.findById(id).exec()

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        let updatedUser = {}
        if (username) {
            const existingUser = await User.findOne({ username }).lean().exec()
            if (!existingUser) {
                updatedUser.username = username;
            }
            else {
                return res.status(409).json({
                    message: "Username already exists",
                    success: false
                })
            }
        }
        if (fullName) updatedUser.fullName = fullName;
        if (mobileNo) updatedUser.mobileNo = mobileNo;
        if (email) updatedUser.email = email;
        if (img) {
            const imgResponse = await uploadOnCloudinary(img.path)
            updatedUser.profilePicture = imgResponse.secure_url
        }
        if (address) updatedUser.address = address;
        if (pincode) updatedUser.pincode = pincode;
        if (city) updatedUser.city = city;
        if (state) updatedUser.state = state;
        if (alternateNo) updatedUser.alternateNo = alternateNo;

        const updated = await User.findByIdAndUpdate(id, updatedUser, { new: true }).exec()

        if (!updated) {
            return res.status(500).json({
                message: "Error updating user details",
                success: false
            })
        }

        return res.status(200).json({
            message: "User details updated successfully",
            success: true,
            user: updated
        })

    } catch (error) {
        console.error("Update Details Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

// export const userDashboardData = async (req, res) => {
//     try {
//         const id = req.user;

//         if (!id) {
//             return res.status(400).json({
//                 message: "User ID is required",
//                 success: false
//             })
//         }

//         const user = await User.findById(id).select("-password").exec()

//         if (!user) {
//             return res.status(404).json({
//                 message: "User not found",
//                 success: false
//             })
//         }

//         const ordersCount = await Order.countDocuments({ userId: id }).exec()

//         if (!ordersCount) {
//             return res.status(500).json({
//                 message: "Error fetching orders count",
//                 success: false
//             })
//         }

//         const wishlistCount = await Wishlist.countDocuments({ userId: id }).exec()

//         if (!wishlistCount) {
//             return res.status(500).json({
//                 message: "Error fetching wishlist count",
//                 success: false
//             })
//         }

//     } catch (error) {
//         console.error("User Dashboard Data Error:", error);
//         return res.status(500).json({
//             message: "Internal server error",
//             success: false
//         })
//     }
// }
