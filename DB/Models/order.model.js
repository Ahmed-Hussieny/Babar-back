import mongoose, { model, Schema } from "mongoose";

const orderSchema = new Schema({
    billNo: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "Pending",
        enum: ["Pending" , "Completed", "Preparing", "Cancelled", "Ready"],
    },
    amount: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    duration: {
        type: Number,
        default: 30,
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    description: {
        type: String,
        default: "",
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
    }
}, { timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
 });

// virtual populate
orderSchema.virtual("Messages", {
    ref: "Message",
    localField: "_id",
    foreignField: "orderId",
});

const Order = mongoose.models.Order || model("Order", orderSchema);
export default Order;