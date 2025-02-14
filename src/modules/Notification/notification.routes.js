import { Router } from "express";
import * as notificationController from "./notification.controller.js";
const notificationRouter = Router();

notificationRouter.get('/get-notifications/:restaurantId', notificationController.getNotificationsForRestaurant);

export default notificationRouter;