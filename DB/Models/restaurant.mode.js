import mongoose, { Schema, model } from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";

const restaurantSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: {
        type: String,
        required: true,
        default: "Open",
        enum: ["Open", "Closed"],
    },
    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isVerified: { type: Boolean, default: false },
    token:{
      type: String,
      default: undefined,
    },
    resetPasswordToken:{
      type: String,
      default: undefined
    },
    resetPasswordTokenExpires :{
      type: Date,
      default: undefined,
    },
    role: {
        type: String,
        default: systemRoles.RESTAURANT,
    },
}, { timestamps: true });

const Restaurant = mongoose.models.Restaurant || model("Restaurant", restaurantSchema);
export default Restaurant;