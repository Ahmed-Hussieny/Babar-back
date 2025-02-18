import Notification from "../../../DB/Models/notification.model.js";
import Order from "../../../DB/Models/order.model.js";
import Restaurant from "../../../DB/Models/restaurant.mode.js";
import { io } from "../../../index.js";
import { generateUniqueCode } from "../../utils/generateUniqueString.js";
import ExcelJS from "exceljs";

//& ===================== ADD ORDER =====================
export const addOrder = async (req, res, next) => {
  const { name, restaurantId, amount, description } = req.body;
  const { _id: addedBy } = req.authUser;

  const isRestaurantExists = await Restaurant.findById(restaurantId);
  if (!isRestaurantExists)
    return next({ message: "Restaurant is not exists", cause: 404 });
  console.log(isRestaurantExists.status)
  if(!isRestaurantExists.status) {
    return next({ message: "المطعم مغلق الان", cause: 404 });
  }

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
  
  if(status === "Completed" || status === "Cancelled") {
    io.to(order.restaurant.toString()).emit("OrderUpdated", {
        order: order,
      });
  }else{
    io.to("adminRoom").emit("OrderUpdated", {
      order: order,
    });
    const newNotification = await Notification.create({
      message: `تم تحديث الطلب ${order.billNo}`,
      restaurantId: order.restaurant.toString(),
      orderId: order._id,
      type: "Order",
      target: "Admin",
    });
    const notification = await newNotification.populate("orderId");

    io.to("adminRoom").emit("newNotification", {
      notification: notification,
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

//& ================ Generate Excel Sheet For Orders with ints restaurant Name ================
export const generateExcelSheet = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("restaurant addedBy").sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(400).json({ message: "No orders found for this restaurant" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    worksheet.columns = [
      { header: "رقم الطلب", key: "billNo", width: 15 },
      { header: "اسم الطلب", key: "name", width: 20 },
      { header: "المطعم", key: "restaurant", width: 25 },
      { header: "الكميه", key: "amount", width: 15 },
      { header: "حالة الطلب", key: "status", width: 15 },
      { header: "بواسطة", key: "addedBy", width: 20 },
      { header: "الوصف", key: "description", width: 30 },
      { header: "التاريخ", key: "createdAt", width: 20 },
    ];

    orders.forEach((order) => {
      worksheet.addRow({
        billNo: order.billNo,
        name: order.name,
        restaurant: order.restaurant?.name || "N/A",
        amount: order.amount,
        status: order.status,
        addedBy: order.addedBy.username,
        description: order.description,
        createdAt: order.createdAt.toISOString(),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=Orders.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Error generating Excel file", error: error.message });
  }
};
