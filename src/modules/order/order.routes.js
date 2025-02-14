import { Router } from "express";
import * as orderController from "./order.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { orderRoles } from "./order.endPoints.roles.js";
import { addOrderSchema } from "./order.validationSchemas.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import expressAsyncHandler from 'express-async-handler';
const orderRouter = Router();
orderRouter.post('/add-order',
    auth(orderRoles.ADD_ORDER),
    validationMiddleware(addOrderSchema),
    expressAsyncHandler(orderController.addOrder));

orderRouter.get('/get-orders/:restaurantId',
    // auth(orderRoles.GET_ORDERS),
    expressAsyncHandler(orderController.getOrders));

orderRouter.get('/get-order/:orderId',
    // auth(orderRoles.GET_ORDERS),
    expressAsyncHandler(orderController.getOrder));

orderRouter.put('/update-order/:orderId',
    // auth(orderRoles.UPDATE_ORDER),
    expressAsyncHandler(orderController.updateOrder));

orderRouter.post('/update-Status/:orderId',
    // auth(orderRoles.UPDATE_ORDER_STATUS),
    expressAsyncHandler(orderController.updateOrderStatus));

orderRouter.get('/get-orders-from-restaurant/:restaurantId',
    // auth(orderRoles.GET_ORDERS_FROM_RESTAURANT),
    expressAsyncHandler(orderController.getOrdersFromRestaurant));

orderRouter.post('/accept-order-from-restaurant/:orderId',
    // auth(orderRoles.ACCEPT_ORDER),
    expressAsyncHandler(orderController.acceptOrderFromRestaurant));
export default orderRouter;