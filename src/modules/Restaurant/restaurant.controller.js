import Restaurant from "../../../DB/Models/restaurant.mode.js";

//& =============================  ADD RESTAURANT =============================
export const addRestaurant = async (req, res, next) => {
    const { name, address, phone, email, password } = req.body;
    const { _id: addedBy } = req.authUser;

    // check if restaurant exists
    const isRestaurantExists = await Restaurant.findOne({ email });
    if (isRestaurantExists) return next({ message: "Restaurant is already exists", cause: 400 });
    
    const newRestaurant = await Restaurant.create({
        name,
        address,
        phone,
        email,
        password,
        addedBy,
    });
    if (!newRestaurant) return next({ message: "Restaurant is not created", cause: 500 });

    res.status(201).json({ success: true, message: "Restaurant added successfully", restaurant: newRestaurant });
};

//& =============================  GET RESTAURANTS =============================
export const getRestaurants = async (req, res) => {
    const restaurants = await Restaurant.find();
    res.status(200).json({
        message: "Restaurants fetched successfully",
        restaurants,
    });
};