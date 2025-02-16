
import { io } from "../../../index.js";
import Message from "../../../DB/Models/message.model.js";

//& ========================== ADD MESSAGE ==========================
export const addMessage = async (req, res, next) => {
  const { message, orderId, sender, restaurantId } = req.body;

  const newMessage = await Message.create({
    message,
    orderId,
    sender,
    restaurantId,
  });
  if (!newMessage)
    return next({ message: "Message is not created", cause: 500 });
  // io.to(restaurantId).emit("newMessage", newMessage);
  return res
    .status(201)
    .json({ message: "Message added successfully", message: newMessage });
};