import Notification from "../../../DB/Models/notification.model.js";
import Order from "../../../DB/Models/order.model.js";
import Restaurant from "../../../DB/Models/restaurant.mode.js";
import { io } from "../../../index.js";
import { generateUniqueCode } from "../../utils/generateUniqueString.js";

//& ===================== ADD ORDER =====================
export const addOrder = async (req, res, next) => {
  const { name, restaurantId, amount, description } = req.body;
  const { _id: addedBy } = req.authUser;

  const isRestaurantExists = await Restaurant.findById(restaurantId);
  if (!isRestaurantExists)
    return next({ message: "Restaurant is not exists", cause: 404 });

  const newOrder = await Order.create({
    billNo: generateUniqueCode(),
    name,
    restaurant: isRestaurantExists._id,
    amount,
    addedBy,
    description
  });
  if (!newOrder) return next({ message: "Order is not created", cause: 500 });

  io.to(restaurantId).emit("newOrder", newOrder);
  const newNotification = await Notification.create({
    message: `New order received from ${name}`,
    restaurantId: isRestaurantExists._id,
    orderId: newOrder._id,
    type: "Order",
    target: "Restaurant",
  });
  io.to(restaurantId).emit("newNotification", {
    notification: newNotification,
  });

  res
    .status(201)
    .json({
      success: true,
      message: "Order added successfully",
      order: newOrder,
    });
};

//& ===================== GET ORDERS =====================
export const getOrders = async (req, res) => {
  const { restaurantId } = req.params;

  // Get today's start and end timestamps
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Query for orders with status "Pending" or "Preparing" created today
  const orders = await Order.find({
    restaurant: restaurantId,
    status: { $in: ["Pending", "Preparing", "Ready"] },
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ createdAt: -1 });

  // delete all notifications for this order and it type is Message
  await Notification.deleteMany({ restaurantId, type: "Order" });

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    orders,
  });
};

//& ===================== GET ORDER =====================
export const getOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId).populate("Messages");
  if (!order) return next({ message: "Order not found", cause: 404 });
  // delete all notifications for this order and it type is Message
  await Notification.deleteMany({ orderId, type: "Message" });
  res.status(200).json({
    message: "Order fetched successfully",
    order,
  });
};

//& ===================== UPDATE ORDER =====================
export const updateOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const { status, price, duration } = req.body;
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status, price, duration },
    { new: true }
  );
  io.to("adminRoom").emit("OrderUpdated", {
    order: order,
  });
  if(status === "Completed" || status === "Cancelled") {
    io.to(order.restaurant.toString()).emit("OrderUpdated", {
        order: order,
      });
  }
  
  if (!order) return next({ message: "Order not found", cause: 404 });
  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    order,
  });
};

export const updateOrderStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );
  if (!order) return next({ message: "Order not found", cause: 404 });
  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    order,
  });
};

export const getOrdersFromRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;

  // Get today's start and end timestamps
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Query for orders with status "Pending" or "Preparing" created today
  const orders = await Order.find({
    restaurant: restaurantId,
    status: { $in: ["Pending", "Preparing"] },
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ createdAt: -1 });

  // delete all notifications for this order and it type is Message
  await Notification.deleteMany({ restaurantId, type: "Order" });

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    orders,
  });
};

export const acceptOrderFromRestaurant = async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) return next({ message: "Order not found", cause: 404 });
  order.status = "Preparing";
  await order.save();
  io.to(order.restaurant).emit("orderAccepted", order);
  return res.status(200).json({
    success: true,
    message: "Order accepted successfully",
    order,
  });
};
