import mongoose, { model, Schema } from "mongoose";

const notificationSchema = new Schema({
    message: {
        type: String,
        required: true,
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
    },
    order: {
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