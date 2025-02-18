import Delivery from "../../../DB/Models/delivery.model.js";
import { io } from "../../../index.js";

//& ======================== ADD DELIVERY ========================
export const addDelivery = async (req, res, next) => {
    
  const { companyName, phoneNumber, fromLocation, toLocation, vehicleType, notes, deliveryId } =
    req.body;
    console.log(req.body);
  const delivery = await Delivery.create({
    companyName,
    phoneNumber,
    fromLocation,
    toLocation,
    vehicleType,
    notes,
    deliveryId
  });
  if(!delivery) return next({
    message: "Failed to add delivery",
    cause: 400
  });
  io.to("adminRoom").emit("newDelivery", {delivery});
  return res.status(201).json({ 
    success: true,
    message: "Delivery added successfully",
    delivery
   });
};

//& ======================== GET ALL DELIVERIES ========================
export const getAllDeliveries = async (req, res, next) => {
  const deliveries = await Delivery.find({
    status: { $ne: "Accepted" }
  });
  if (!deliveries) return next({
    message: "Failed to fetch deliveries",
    cause: 400
  });
  return res.status(200).json({
    success: true,
    deliveries
  });
};

//& ======================== Mark Delivery as Accepted ========================
export const markDeliveryAsAccepted = async (req, res, next) => {
  const { deliveryId } = req.params;
  console.log(deliveryId);
  const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return next({
        message: "Delivery not found",
        cause: 404
    });
    delivery.status = "Accepted";
    await delivery.save();
    return res.status(200).json({
        success: true,
        message: "Delivery marked as accepted",
        delivery
    });
}