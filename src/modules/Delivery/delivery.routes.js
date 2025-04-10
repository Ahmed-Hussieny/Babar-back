import { Router } from "express";
import * as deliveryController from "./delivery.controller.js";
const deliveryRouter = Router();
import expressAsyncHandler from "express-async-handler";

deliveryRouter.post("/add-delivery", expressAsyncHandler(deliveryController.addDelivery));
deliveryRouter.get("/get-all-deliveries", expressAsyncHandler(deliveryController.getAllDeliveries));
deliveryRouter.patch("/mark-delivery-as-accepted/:deliveryId", expressAsyncHandler(deliveryController.markDeliveryAsAccepted));
deliveryRouter.patch("/assign-representative-to-delivery", expressAsyncHandler(deliveryController.assignDeliveryToRepresentative));
deliveryRouter.get("/get-deliveries-by-representative/:representativeId", expressAsyncHandler(deliveryController.getAllDeliveriesByRepresentative));

deliveryRouter.patch("/mark-delivery-as-completed/:deliveryId", expressAsyncHandler(deliveryController.finishDelivery));
deliveryRouter.patch("/mark-delivery-as-canceled/:deliveryId", expressAsyncHandler(deliveryController.cancelDelivery));
export default deliveryRouter;