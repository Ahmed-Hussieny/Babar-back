import mongoose, { model, Schema } from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";

const representativeSchema = new Schema({
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
            default: systemRoles.REPRESENTATIVE,
        },
},{
    timestamps: true,
})

const Representative = mongoose.models.Representative || model("Representative", representativeSchema);
export default Representative;