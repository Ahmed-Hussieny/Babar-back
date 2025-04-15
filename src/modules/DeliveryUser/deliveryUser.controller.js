import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DeliveryUser from "../../../DB/Models/delivery-user.model.js";
import { io } from "../../../index.js";
//& =============================  ADD Delivery User =============================
export const addDeliveryUser = async (req, res, next) => {
  const { name, phone, email, password } = req.body;
  const { _id: addedBy } = req.authUser;

  // check if restaurant exists
  const isDeliveryUserExists = await DeliveryUser.findOne({ email });
  if (isDeliveryUserExists)
    return next({ message: "هذا الحساب موجود بالفعل", cause: 400 });

  const newDeliveryUser = await DeliveryUser.create({
    name,
    phone,
    email,
    password: bcrypt.hashSync(password, +process.env.HASH_SALT),
    addedBy,
  });
  if (!newDeliveryUser)
    return next({ message: "لم يتم إنشاء الحساب", cause: 500 });

  res.status(201).json({
    success: true,
    message: "تمت إضافة الحساب بنجاح",
    deliveryUsers: newDeliveryUser,
  });
};

//& =========================== Login Delivery User ===========================
export const loginDeliveryUser = async (req, res, next) => {
  const { email, password } = req.body;

  const deliveryUser = await DeliveryUser.findOne({ email });
  if (!deliveryUser)
    return next({ message: "لم يتم العثور على الحساب", cause: 404 });

  // check if restaurant is verified
  if (!deliveryUser.isVerified)
    return next({
      message: "هذا الحساب غير مفعل تواصل مع المسؤول",
      cause: 401,
    });

  // check if password is correct
  const isPasswordValid = bcrypt.compareSync(password, deliveryUser.password);
  if (!isPasswordValid)
    return next({ message: "كلمة المرور غير صالحة", cause: 400 });

  // create token
  const token = jwt.sign({ _id: deliveryUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  deliveryUser.token = token;
  await deliveryUser.save();

  return res.status(200).json({
    success: true,
    message: "تم تسجيل دخول الحساب بنجاح",
    deliveryUser,
    token,
  });
};

//& =============================  GET Delivery Users =============================
export const getDeliveryUsers = async (req, res) => {
  const DeliveryUsers = await DeliveryUser.find();
  res.status(200).json({
    message: "Delivery Users fetched successfully",
    DeliveryUsers,
  });
};

//& =========================== Verify Delivery ===========================
export const verifyDelivery = async (req, res, next) => {
  const { deliveryId } = req.params;
  const delivery = await DeliveryUser.findById(deliveryId);
  if (!delivery) return next({ message: "Delivery is not found", cause: 404 });

  delivery.isVerified = !delivery.isVerified;
  await delivery.save();

  return res.status(200).json({
    success: true,
    message: "Delivery is verified successfully",
    delivery,
  });
};

//& =========================== Get acount info For Deliveries ==========================
export const getDeliveryAccountInfo = async (req, res, next) => {
  const delivery = await DeliveryUser.find().populate("Deliveries");
  const deliversData = delivery.map((delivery) => {
    return {
      _id: delivery._id,
      name: delivery.name,
      phone: delivery.phone,
      email: delivery.email,
      status: delivery.status,
      isVerified: delivery.isVerified,
      numberOfDeliveries: delivery.Deliveries.length,
      pricesOfDeliveriesItems: delivery.Deliveries.reduce((acc, delivery) => {
        if (delivery.status === "Canceled" || delivery.status === "Completed") {
          return acc + delivery.priceItems;
        }
        return acc;
      }, 0),
      pricesOfDeliveriesTransportation: delivery.Deliveries.reduce(
        (acc, delivery) => {
          if (delivery.status === "Canceled" || delivery.status === "Completed") {
            return acc + delivery.priceTransportation;
          }
          return acc;
        },
        0
      ),
      totalPriceOfDeliveries: delivery.Deliveries.reduce((acc, delivery) => {
        if (delivery.status === "Canceled" || delivery.status === "Completed") {
          return acc + delivery.priceTransportation + delivery.priceItems;
        }
        return acc;
      }, 0),
    };
  });
  if (!deliversData)
    return next({ message: "Delivery is not found", cause: 404 });
  if (!delivery) return next({ message: "Delivery is not found", cause: 404 });

  return res.status(200).json({
    success: true,
    message: "Delivery account info fetched successfully",
    deliversData,
  });
};

//& =========================== Get acount info For Deliveries ==========================
export const getDeliveryAccountInfoUser = async (req, res, next) => {
  const { deliveryId } = req.params;
  const delivery = await DeliveryUser.findById(deliveryId).populate({
    path: "Deliveries",
    match: { status: { $ne: "Done" } },
    options: {
      sort: { createdAt: -1 }         
    }
  });  
  if (!delivery) return next({ message: "Delivery is not found", cause: 404 });

  const deliversData = {
    _id: delivery._id,
    name: delivery.name,
    phone: delivery.phone,
    email: delivery.email,
    status: delivery.status,
    isVerified: delivery.isVerified,
    numberOfDeliveries: delivery.Deliveries.length,
    pricesOfDeliveriesItems: delivery.Deliveries.reduce((acc, delivery) => {

      if (delivery.status === "Canceled" || delivery.status === "Completed") {
        return acc + delivery.priceItems;
      }
      return acc;
    }, 0),
    pricesOfDeliveriesTransportation: delivery.Deliveries.reduce(
      (acc, delivery) => {
        if (delivery.status === "Canceled" || delivery.status === "Completed") {
          return acc + delivery.priceTransportation;
        }
        return acc;
      },
      0
    ),
    
    totalPriceOfDeliveries: delivery.Deliveries.reduce((acc, delivery) => {
      if (delivery.status === "Canceled" || delivery.status === "Completed") {
        return acc + delivery.priceTransportation + delivery.priceItems;
      }
      return acc;
    }, 0),
  };
    io.to(delivery._id.toString()).emit("updateDelivery", { delivery });
  

  if (!deliversData)
    return next({ message: "Delivery is not found", cause: 404 });

  return res.status(200).json({
    success: true,
    message: "Delivery account info fetched successfully",
    deliversData,
    delivery,
  });
};
