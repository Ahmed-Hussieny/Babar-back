import mongoose, { Schema } from "mongoose";
import { model } from "mongoose";

const messageSchema = new Schema({
    message: {
        type: String,
        required: true,
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
    },
    sender: {
        type: String,
        enum: ["Admin", "Restaurant"],
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
    },
    readedByAdmin: {
        type: Boolean,
        default: false,
    },
    readedByRestaurant: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Message = mongoose.models.Message || model("Message", messageSchema);
export default Message;