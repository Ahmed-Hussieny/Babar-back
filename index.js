import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { initiateApp } from "./src/initiate-app.js";
import { Server } from "socket.io";
import Notification from "./DB/Models/notification.model.js";

config();
const app = express();
app.use(cors());
initiateApp({ app, express });
app.use(express.json());
const server = app.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on port ${process.env.PORT || 3001}`);
});

export const io = new Server(server, { cors: { origin: "*" } });

const restaurantStatus = {};
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Restaurant joins a room with its restaurantId
  socket.on("joinRestaurantRoom", ({ restaurantId, status }) => {
    socket.join(restaurantId);
    restaurantStatus[restaurantId] = status;
    console.log(`Restaurant ${restaurantId} joined room`);
  });
  socket.on("updateRestaurantStatus", ({ restaurantId, status }) => {
    restaurantStatus[restaurantId] = status;
    io.emit("restaurantStatusUpdated", { restaurantId, status }); // Notify admin
    console.log(`Restaurant ${restaurantId} updated status to: ${status}`);
  });

  socket.on("joinDeliveryRoom", ({ deliveryId }) => {
    socket.join(deliveryId);
    console.log(`Delivery ${deliveryId} joined room`);
  });
  // joinDeliveryUserRoom
  socket.on("joinDeliveryUserRoom", ({ deliveryId }) => {
    socket.join(deliveryId);
  });
  socket.on("joinRepresentativeRoom", ({ representativeId }) => {
    socket.join(representativeId);
    console.log(`Representative ${representativeId} joined room`);
  });

  socket.on("joinRoom", (room) => {
    if (room) {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
    }
    console.log("logout");
  });

  socket.on("logout", ({restaurantId}) => {
    console.log("logout");
    io.to(restaurantId).emit("newlogout", {restaurantId});
  });

  socket.on("deliveryUserLogOut", ({deliveryId}) => {
    console.log("logout");
    io.to(deliveryId).emit("deliveryUserLogOutB", {deliveryId});
  });

  socket.on("sendMessage", async ({ room, message, sender }) => {
    console.log(message.restaurantId);
    console.log(`Message sent to ${message.restaurantId}: ${message.sender}`);

    io.to(room).emit("receiveMessage", { sender, message });

    if (message.sender === "Admin") {
      // Notify the restaurant
      const newNotification = await Notification.create({
        message:"تم تحديث الطلب",
        restaurantId: message.restaurantId,
        orderId: message.orderId,
        type: "Message",
        target: "Restaurant",
      });
      const notification = await newNotification.populate("orderId");
      io.to(message.restaurantId).emit("newNotification", {
        notification: notification,
      });
    } else {
      console.log("Admin message");
      const newNotification = await Notification.create({
        message: "تم تحديث الطلب",
        restaurantId: message.restaurantId,
        orderId: message.orderId,
        type: "Message",
        target: "Admin",
      });
      const notification = await newNotification.populate("orderId");

      io.to("adminRoom").emit("newNotification", {
        notification: notification,
      });
    }
  });

  socket.on("adminJoin", () => {
    socket.join("adminRoom");
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});
