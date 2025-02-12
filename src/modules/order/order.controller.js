import Notification from "../../../DB/Models/notification.model.js";
import Order from "../../../DB/Models/order.model.js";
import Restaurant from "../../../DB/Models/restaurant.mode.js";
import { io } from "../../../index.js";
import { generateUniqueCode } from "../../utils/generateUniqueString.js";

//& ===================== ADD ORDER =====================
export const addOrder = async (req, res, next) => {
    const { name, restaurantId, amount } = req.body;
    const {_id: addedBy} = req.authUser;
    
    const isRestaurantExists = await Restaurant.findById(restaurantId);
    if(!isRestaurantExists) return next({message: 'Restaurant is not exists', cause: 404 });

    const newOrder = await Order.create({
        billNo: generateUniqueCode(),
        name,
        restaurant: isRestaurantExists._id,
        amount,
        addedBy
    });
    if(!newOrder) return next({message: 'Order is not created', cause: 500});

    io.to(restaurantId).emit("newOrder", newOrder);
    const newNotification = await Notification.create({
        message: `New order received from ${name}`,
        restaurant: isRestaurantExists._id,
        order : newOrder._id
    });
    io.to(restaurantId).emit("newNotification", newNotification);
  
    res.status(201).json({success:true, message: "Order added successfully", order: newOrder });
  }

//& ===================== GET ORDERS =====================
export const getOrders = async (req, res) => {
    const { restaurantId } = req.params;
    const orders = await Order.find({ restaurant: restaurantId });
    res.status(200).json({
        message: "Orders fetched successfully",
        orders,
    });
};

//& ===================== GET ORDER =====================
export const getOrder = async (req, res, next) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("Messages");
    if (!order) return next({ message: "Order not found", cause: 404 });
    res.status(200).json({
        message: "Order fetched successfully",
        order,
    });
}

//& ===================== UPDATE ORDER =====================
export const updateOrder = async (req, res, next) => {
    const { orderId } = req.params;
    const { status, price, duration } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, {  status, price, duration }, { new: true });
    if (!order) return next({ message: "Order not found", cause: 404 });
    res.status(200).json({
        success: true,
        message: "Order updated successfully",
        order,
    });
}

export const updateOrderStatus = async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return next({ message: "Order not found", cause: 404 });
    res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order,
    });
};