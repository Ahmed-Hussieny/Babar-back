import mongoose, { model, Schema } from "mongoose";

const deliverySchema = new Schema({
    companyName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    fromLocation: {
        type: String,
        required: true
    },
    toLocation: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ["Car", "Moto"]
    },
    notes: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Accepted", "Rejected"]
    },
    deliveryId: {
        type: Schema.Types.ObjectId,
        ref: "DeliveryUser",
        required: true
    }
}, {
    timestamps: true
});

const Delivery = mongoose.models.Delivery || model("Delivery", deliverySchema);
export default Delivery;