import Restaurant from "../../../DB/Models/restaurant.mode.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//& =============================  ADD RESTAURANT =============================
export const addRestaurant = async (req, res, next) => {
  const { name, address, phone, email, password } = req.body;
  const { _id: addedBy } = req.authUser;

  // check if restaurant exists
  const isRestaurantExists = await Restaurant.findOne({ email });
  if (isRestaurantExists)
    return next({ message: "هذا المطعم موجود بالفعل", cause: 400 });

  const newRestaurant = await Restaurant.create({
    name,
    address,
    phone,
    email,
    password: bcrypt.hashSync(password, +process.env.HASH_SALT),
    addedBy,
  });
  if (!newRestaurant)
    return next({ message: "لم يتم إنشاء المطعم", cause: 500 });

  res.status(201).json({
    success: true,
    message: "تمت إضافة المطعم بنجاح",
    restaurant: newRestaurant,
  });
};

//& =============================  GET RESTAURANTS =============================
export const getRestaurants = async (req, res) => {
  const restaurants = await Restaurant.find();
  res.status(200).json({
    message: "Restaurants fetched successfully",
    restaurants,
  });
};

//& =========================== Login Restaurant ===========================
export const loginRestaurant = async (req, res, next) => {
  const { email, password } = req.body;

  const restaurant = await Restaurant.findOne({ email });
  if (!restaurant) return next({ message: "لم يتم العثور على المطعم", cause: 404 });

  // check if restaurant is verified
  if (!restaurant.isVerified)
    return next({ message: "هذا المطعم غير مفعل تواصل مع المسؤول", cause: 401 });

  // check if password is correct
  const isPasswordValid = bcrypt.compareSync(password, restaurant.password);
  if (!isPasswordValid)
    return next({ message: "كلمة المرور غير صالحة", cause: 400 });

  // create token
  const token = jwt.sign({ _id: restaurant._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  restaurant.token = token;
  await restaurant.save();

  return res.status(200).json({
    success: true,
    message: "تم تسجيل دخول المطعم بنجاح",
    restaurant,
    token,
  });
};

//& =========================== Verify Restaurant ===========================
export const verifyRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant)
    return next({ message: "Restaurant is not found", cause: 404 });

  restaurant.isVerified = !restaurant.isVerified;
  await restaurant.save();

  return res.status(200).json({
    success: true,
    message: "Restaurant is verified successfully",
    restaurant,
  });
};

//&=========================== MARK RESTAURSNT AS OPEN ==========================
export const toggleRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant)
    return next({ message: "Restaurant is not found", cause: 404 });

  restaurant.status = !restaurant.status;
  await restaurant.save();
  if (restaurant.status)
    return res
      .status(200)
      .json({ success: true, message: "Restaurant is open now", restaurant });
  return res
    .status(200)
    .json({ success: true, message: "Restaurant is closed now", restaurant });
};

export const getRestaurant = async (req, res, next) => {
  const { restaurantId } = req.params;
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant)
    return next({ message: "Restaurant is not found", cause: 404 });
  return res
    .status(200)
    .json({
      success: true,
      message: "Restaurant fetched successfully",
      restaurant,
    });
};

//& ============================= Get LoogedIn resturant =========================
export const getLoggedInRestaurant = async (req, res, next) => {
  const { accesstoken } = req.headers;
  console.log(accesstoken);
  const restaurant = await Restaurant.findOne({ token: accesstoken });
  if (!restaurant)
    return next({ message: "Restaurant is not found", cause: 404 });
  return res
    .status(200)
    .json({
      success: true,
      message: "Restaurant fetched successfully",
      restaurant,
    });
};

//& ============================= Update Logged In Restaurant =============================
export const updateRestaurant = async (req, res, next) => {
  const { id } = req.params;
  const { name, address, phone, email } = req.body;
  const restaurant = await Restaurant.findById(id);
  if (!restaurant)
    return next({ message: "Restaurant is not found", cause: 404 });

  if (name) restaurant.name = name;
  if (address) restaurant.address = address;
  if (phone) restaurant.phone = phone;
  if (email) restaurant.email = email;

  const updatedRestaurant = await restaurant.save();
  if (!updatedRestaurant)
    return next({ message: "Restaurant is not updated", cause: 500 });

  return res.status(200).json({
    success: true,
    message: "Restaurant updated successfully",
    restaurant: updatedRestaurant,
  });
};

//& ============================= Update Logged In Restaurant Password =============================
export const updateRestaurantPassword = async (req, res, next) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  const restaurant = await Restaurant.findById(id);
  if (!restaurant)
    return next({ message: "Restaurant is not found", cause: 404 });

  const isPasswordValid = bcrypt.compareSync(oldPassword, restaurant.password);
  if (!isPasswordValid)
    return next({ message: "Old password is not correct", cause: 400 });

  const hashedPassword = bcrypt.hashSync(newPassword, +process.env.HASH_SALT);
  restaurant.password = hashedPassword;
  const updatedRestaurant = await restaurant.save();
  if (!updatedRestaurant)
    return next({ message: "Restaurant password is not updated", cause: 500 });

  return res.status(200).json({
    success: true,
    message: "Restaurant password is updated successfully",
    restaurant: updatedRestaurant,
  });
};
