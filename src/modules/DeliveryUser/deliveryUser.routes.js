import { Router } from "express";
import * as deliveryUserController from "./deliveryUser.controller.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { restaurantRoles } from "../Restaurant/restaurant.endPoints.roles.js";
import { addDeliveryUserSchema } from "./deliveryUser.validationSchemas.js";
const deliveryUserRouter = Router();
deliveryUserRouter.post(
  "/add-deliveryUser",
  auth(restaurantRoles.ADD_RESTAURANT),
  validationMiddleware(addDeliveryUserSchema),
  expressAsyncHandler(deliveryUserController.addDeliveryUser)
);

deliveryUserRouter.get(
  "/get-deliveryUsers",
  // auth(restaurantRoles.GET_RESTAURANTS),
  expressAsyncHandler(deliveryUserController.getDeliveryUsers)
);

deliveryUserRouter.post(
  "/login-deliveryUser",
  expressAsyncHandler(deliveryUserController.loginDeliveryUser)
);

deliveryUserRouter.post(
  "/verify-deliveryUser/:deliveryId",
  auth(restaurantRoles.ADD_RESTAURANT),
  expressAsyncHandler(deliveryUserController.verifyDelivery)
);

deliveryUserRouter.get(
  "/get-DeliveryAccountInfo",
  // auth(restaurantRoles.ADD_RESTAURANT),
  expressAsyncHandler(deliveryUserController.getDeliveryAccountInfo)
);
export default deliveryUserRouter;