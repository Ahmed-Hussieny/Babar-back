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
        enum: ["Car", "Moto", "Protor"]
    },
    notes: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Accepted", "Rejected", "Canceled", "Completed","Done"]
    },
    deliveryId: {
        type: Schema.Types.ObjectId,
        ref: "DeliveryUser",
        required: true
    },
    representativeId: {
        type: Schema.Types.ObjectId,
        ref: "Representative"
    },
    priceItems: {
        type: Number,
        default: 0,
    },
    priceTransportation: {
        type: Number,
        default: 0,
    },
    numberOfItems: {
        type: Number,
        default: 0,
    },
    contentOfItems: {
        type: String,
    },
    image: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const Delivery = mongoose.models.Delivery || model("Delivery", deliverySchema);
export default Delivery;