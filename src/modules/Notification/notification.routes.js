import { Router } from "express";
import * as notificationController from "./notification.controller.js";
const notificationRouter = Router();

notificationRouter.get('/get-notifications/:restaurantId', notificationController.getNotificationsForRestaurant);
notificationRouter.get('/get-all-notifications', notificationController.getAllNotificationForAdmin);

export default notificationRouter;