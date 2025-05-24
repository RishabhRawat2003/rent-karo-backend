import mongoose from "mongoose";

const organisationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        images: [{
            type: String,
            required: true,
        }],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    }, {
    timestamps: true,
    versionKey: false
})

export const Organisation = mongoose.model("Organisation", organisationSchema);