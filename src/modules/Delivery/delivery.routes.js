import { Router } from "express";
import * as deliveryController from "./delivery.controller.js";
const deliveryRouter = Router();
import expressAsyncHandler from "express-async-handler";

deliveryRouter.post("/add-delivery", expressAsyncHandler(deliveryController.addDelivery));
deliveryRouter.get("/get-all-deliveries", expressAsyncHandler(deliveryController.getAllDeliveries));
deliveryRouter.patch("/mark-delivery-as-accepted/:deliveryId", expressAsyncHandler(deliveryController.markDeliveryAsAccepted));
export default deliveryRouter;