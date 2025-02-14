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
    return next({ message: "Restaurant is already exists", cause: 400 });

  const newRestaurant = await Restaurant.create({
    name,
    address,
    phone,
    email,
    password: bcrypt.hashSync(password, +process.env.HASH_SALT),
    addedBy,
  });
  if (!newRestaurant)
    return next({ message: "Restaurant is not created", cause: 500 });

  res
    .status(201)
    .json({
      success: true,
      message: "Restaurant added successfully",
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
  if (!restaurant) return next({ message: "Restaurant not found", cause: 404 });

  // check if restaurant is verified
  if (!restaurant.isVerified)
    return next({ message: "Restaurant is not verified", cause: 401 });

  // check if password is correct
  const isPasswordValid = bcrypt.compareSync(password, restaurant.password);
  if (!isPasswordValid)
    return next({ message: "Password is invalid", cause: 400 });

  // create token
  const token = jwt.sign({ _id: restaurant._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  restaurant.token = token;
  await restaurant.save();

  return res
    .status(200)
    .json({
      success: true,
      message: "Restaurant logged in successfully",
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

  return res
    .status(200)
    .json({
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
    return res.status(200).json({ success: true, message: "Restaurant fetched successfully", restaurant });
};