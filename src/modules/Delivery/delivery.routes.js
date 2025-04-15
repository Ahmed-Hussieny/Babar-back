import { Router } from "express";
import * as deliveryController from "./delivery.controller.js";
const deliveryRouter = Router();
import expressAsyncHandler from "express-async-handler";
import { multerMiddlewareLocal } from "../../middlewares/multer.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";

deliveryRouter.post("/add-delivery",multerMiddlewareLocal({
    destinationFolder: "Deliveries",
    extensions: allowedExtensions.image,
    fields: [{ name: "image", maxCount: 1 }],
  }), expressAsyncHandler(deliveryController.addDelivery));
deliveryRouter.get("/get-all-deliveries", expressAsyncHandler(deliveryController.getAllDeliveries));
deliveryRouter.patch("/mark-delivery-as-accepted/:deliveryId", expressAsyncHandler(deliveryController.markDeliveryAsAccepted));
deliveryRouter.patch("/assign-representative-to-delivery", expressAsyncHandler(deliveryController.assignDeliveryToRepresentative));
deliveryRouter.get("/get-deliveries-by-representative/:representativeId", expressAsyncHandler(deliveryController.getAllDeliveriesByRepresentative));

deliveryRouter.patch("/mark-delivery-as-completed/:deliveryId", expressAsyncHandler(deliveryController.finishDelivery));
deliveryRouter.patch("/mark-delivery-as-canceled/:deliveryId", expressAsyncHandler(deliveryController.cancelDelivery));
deliveryRouter.patch("/mark-delivery-as-done/:deliveryId", expressAsyncHandler(deliveryController.markDeliveryAsDone));
export default deliveryRouter;