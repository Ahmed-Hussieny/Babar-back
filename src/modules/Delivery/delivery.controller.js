import Delivery from "../../../DB/Models/delivery.model.js";
import { io } from "../../../index.js";

//& ======================== ADD DELIVERY ========================
export const addDelivery = async (req, res, next) => {
  const { companyName, phoneNumber, fromLocation, toLocation, vehicleType, notes, deliveryId, numberOfItems, priceOfItems, contentOfItems } =
    req.body;

  let imgPath = "";
  if (req.files?.image) {
    imgPath = `${process.env.HOST_URL}/uploads/Deliveries/${req.files?.image[0]?.filename}`;
  }
  const delivery = await Delivery.create({
    companyName,
    phoneNumber,
    fromLocation,
    toLocation,
    vehicleType,
    notes,
    deliveryId,
    priceItems:priceOfItems,
    numberOfItems,
    contentOfItems,
    image: imgPath,
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
    $or: [
      { status: "Pending" },
      { status: "Accepted" },
      { status: "Canceled" },
      { status: "Completed" }
    ]
  }).populate("deliveryId representativeId").sort({ createdAt: -1 });
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
};

//& ======================== assign Delivery to Representative ========================
export const assignDeliveryToRepresentative = async (req, res, next) => {
  const { deliveryId, representativeId } = req.body;
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) return next({
    message: "Delivery not found",
    cause: 404
  });
  console.log(delivery.representativeId)
  if(representativeId !== delivery.representativeId && delivery.representativeId !== undefined) {
    io.to(delivery.representativeId.toString()).emit("addDelivery", { delivery });
  }
  delivery.status = "Accepted";
  delivery.representativeId = representativeId;
  await delivery.save();
  io.to(delivery._id.toString()).emit("updateDelivery", { delivery });
  io.to(representativeId).emit("addDelivery", { delivery });

  return res.status(200).json({
    success: true,
    message: "Delivery assigned to representative",
    delivery
  });
};

//& ========================== Get All Deliveries By Representative ==========================
export const getAllDeliveriesByRepresentative = async (req, res, next) => {
  const { representativeId } = req.params;
  const deliveries = await Delivery.find({ representativeId,
    $or: [
      { status: "Pending" },
      { status: "Accepted" }
    ]
   }).sort({ createdAt: -1 });
  if (!deliveries) return next({
    message: "Failed to fetch deliveries",
    cause: 400
  });
  return res.status(200).json({
    success: true,
    deliveries
  });
};

//& ========================== Finish Delivery ==========================
export const finishDelivery = async (req, res, next) => {
  const { deliveryId } = req.params;
  const {priceItems, priceTransportation} = req.body
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) return next({
    message: "Delivery not found",
    cause: 404
  });
  delivery.status = "Completed";
  delivery.priceItems = priceItems;
  delivery.priceTransportation = priceTransportation;
  const finishedDelivery = await delivery.save();
  if (!finishedDelivery) return next({
    message: "Failed to finish delivery",
    cause: 400
  });
  const deliveries = await Delivery.find({ representativeId: delivery.representativeId,
    $or: [
      { status: "Pending" },
      { status: "Accepted" }
    ]
   }).sort({ createdAt: -1 });
  if (!deliveries) return next({
    message: "Failed to fetch deliveries",
    cause: 400
  });
  // Notify the representative about the finished delivery
  console.log(delivery._id)
  io.to(delivery._id.toString()).emit("updateDelivery", { delivery });
  // Notify the admin about the finished delivery
  io.to("adminRoom").emit("updateDeliveryInAdmin", { delivery });
  return res.status(200).json({
    success: true,
    message: "Delivery finished successfully",
    deliveries
  });
}

//& ========================== Cancel Delivery ==========================
export const cancelDelivery = async (req, res, next) => {
  const { deliveryId } = req.params;
  const {priceTransportation} = req.body
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) return next({
    message: "Delivery not found",
    cause: 404
  });
  delivery.status = "Canceled";
  delivery.priceTransportation = priceTransportation;
  const CanceledDelivery = await delivery.save();
  if (!CanceledDelivery) return next({
    message: "Failed to finish delivery",
    cause: 400
  });
  const deliveries = await Delivery.find({ representativeId: delivery.representativeId,
    $or: [
      { status: "Pending" },
      { status: "Accepted" }
    ]
   }).sort({ createdAt: -1 });
  if (!deliveries) return next({
    message: "Failed to fetch deliveries",
    cause: 400
  });
  io.to(delivery._id.toString()).emit("updateDelivery", { delivery });
  io.to("adminRoom").emit("updateDeliveryInAdmin", { delivery });
  return res.status(200).json({
    success: true,
    message: "Delivery finished successfully",
    deliveries
  });
}


export const markDeliveryAsDone = async(req, res, next)=>{
  const { deliveryId } = req.params;
  const updatedDeliveries = await Delivery.updateMany(
    { deliveryId: deliveryId, $or: [{ status: "Completed" }, { status: "Canceled" }] },
    { $set: { status: "Done" } }
    ,{ new: true }
  );

  if (!updatedDeliveries) return next({
    message: "Failed to update deliveries",
    cause: 400
  });
  io.to(deliveryId).emit("updateDeliveryUser");

  return res.status(200).json({
    success: true,
    message: "تم تصفيه الحساب",
    updatedDeliveries
  });
};