import mongoose, { model, Schema } from "mongoose";

const notificationSchema = new Schema({
    message: {
        type: String,
        required: true,
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
    },
    status: {
        type: String,
        default: "Unread",
        enum: ["Read", "Unread"],
    },
}, { timestamps: true });

const Notification = mongoose.models.Notification || model("Notification", notificationSchema);
export default Notification;