import { Router } from "express";
import * as restaurantController from "./restaurant.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { restaurantRoles } from "./restaurant.endPoints.roles.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { addRestaurantSchema } from "./restaurant.validationSchemas.js";
import expressAsyncHandler from 'express-async-handler';
const restaurantRouter = Router();

restaurantRouter.post('/add-restaurant',
    auth(restaurantRoles.ADD_RESTAURANT),
    validationMiddleware(addRestaurantSchema)
    ,expressAsyncHandler(restaurantController.addRestaurant));

restaurantRouter.get('/get-restaurants',
    // auth(restaurantRoles.GET_RESTAURANTS),
    expressAsyncHandler(restaurantController.getRestaurants));

restaurantRouter.post('/login-restaurant',
    expressAsyncHandler(restaurantController.loginRestaurant));

restaurantRouter.post('/verify-restaurant/:restaurantId',
    auth(restaurantRoles.VERIFY_RESTAURANT),
    expressAsyncHandler(restaurantController.verifyRestaurant));

restaurantRouter.post('/toggle-restaurant-status/:restaurantId',
    // auth(restaurantRoles.TOGGLE_RESTAURANT_STATUS),
    expressAsyncHandler(restaurantController.toggleRestaurant));

restaurantRouter.post('/get-restaurant/:restaurantId',
    // auth(restaurantRoles.GET_RESTAURANT),
    expressAsyncHandler(restaurantController.getRestaurant));
export default restaurantRouter;