import { Router } from "express";
import * as restaurantController from "./restaurant.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { restaurantRoles } from "./restaurant.endPoints.roles.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { addRestaurantSchema } from "./restaurant.validationSchemas.js";
const restaurantRouter = Router();

restaurantRouter.post('/add-restaurant',
    auth(restaurantRoles.ADD_RESTAURANT),
    validationMiddleware(addRestaurantSchema)
    ,restaurantController.addRestaurant);

restaurantRouter.get('/get-restaurants',
    // auth(restaurantRoles.GET_RESTAURANTS),
    restaurantController.getRestaurants);
export default restaurantRouter;