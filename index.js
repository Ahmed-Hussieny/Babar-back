import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { initiateApp } from "./src/initiate-app.js";
import { Server } from "socket.io";
// import { createClient } from "redis";

config();
const app = express();
app.use(cors());
initiateApp({ app, express });
app.use(express.json());
const server = app.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on port ${process.env.PORT || 3001}`);
});

export const io = new Server(server, { cors: { origin: "*" } });

// const redisClient = createClient();
// redisClient
//   .connect()
//   .then(() => console.log("Redis connected"))
//   .catch((err) => console.error("Redis connection error:", err));
const restaurantStatus = {};
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

    // Restaurant joins a room with its restaurantId
  socket.on("joinRestaurantRoom", ({ restaurantId, status }) => {
    socket.join(restaurantId);
    restaurantStatus[restaurantId] = status;
    // create Notification
    console.log(`Restaurant ${restaurantId} joined room`);
  });
  socket.on("updateRestaurantStatus", ({ restaurantId, status }) => {
    restaurantStatus[restaurantId] = status;
    io.emit("restaurantStatusUpdated", { restaurantId, status }); // Notify admin
    console.log(`Restaurant ${restaurantId} updated status to: ${status}`);
  });
  // Admin places an order and emits to a specific restaurant
  socket.on("placeOrder", async({ restaurantId, orderData }) => {
    io.to(restaurantId).emit("newOrder", orderData);
    console.log(`Order sent to restaurant ${restaurantId}`);
    const newNotification = await Notification.create({
      message: `New order received: ${orderData.orderId}`,
      restaurantId: restaurantId,
      orderId: orderData._id,
    });
    console.log(`New notification created: ${newNotification.orderId}`);
    io.to(restaurantId).emit("newNotification", { orderId, message: `New order received: ${newNotification.orderId}` });
  });

  socket.on("joinRoom", (room) => {
    if (room) {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
    }
  });

  socket.on("sendMessage", ({ room, message, sender }) => {
    console.log(`Message sent to ${room}: ${message.sender}`);
    io.to(room).emit("receiveMessage", { sender, message });
  });

  socket.on("orderUpdate", ({ room, updatedOrder }) => {
    socket.to(room).emit("orderUpdated", updatedOrder);
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});