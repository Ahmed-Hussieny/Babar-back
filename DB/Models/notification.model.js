import mongoose, { model, Schema } from "mongoose";

const notificationSchema = new Schema({
    message: {
        type: String,
        required: true,
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required : true
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required : true
    },
    status: {
        type: String,
        default: "Unread",
        enum: ["Read", "Unread"],
    },
    type: {
        type: String,
        default: "Order",
        enum: ["Order", "Message"],
    },
    target: {
        type: String,
        default: "Admin",
        enum: ["Admin", "Restaurant"],
    }
}, { timestamps: true });

const Notification = mongoose.models.Notification || model("Notification", notificationSchema);
export default Notification;