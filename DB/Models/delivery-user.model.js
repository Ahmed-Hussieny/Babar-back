import mongoose, { Schema, model } from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";

const deliveryUserSchema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status:  { type: Boolean, default: false },
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
        default: systemRoles.DELIVERY,
    },
}, { timestamps: true });

const DeliveryUser = mongoose.models.DeliveryUser || model("DeliveryUser", deliveryUserSchema);
export default DeliveryUser;