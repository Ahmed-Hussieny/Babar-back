import Joi from "joi";

export const addOrderSchema = {
    body: Joi.object({
        name: Joi.string().required(),
        restaurantId: Joi.string().required(),
        amount: Joi.number().required(),
    })
}