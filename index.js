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

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("user-online", async (userId) => {
    if (!userId) return;
    // await redisClient.set(`user:${userId}`, "online", { EX: 60 });
    socket.data.userId = userId; // Store userId in socket session
  });

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);

    const userId = socket.data.userId; // Retrieve stored userId
    if (userId) {
    //   await redisClient.del(`user:${userId}`);
      io.emit("update-users");
    }
  });

  socket.on("joinRestaurant", (restaurantId) => {
    socket.join(restaurantId);
    console.log(`User ${socket.id} joined restaurant ${restaurantId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});
  app.get("/api/orders/:restaurantId", (req, res) => {
    const { restaurantId } = req.params;
    res.json(orders[restaurantId] || []);
  });