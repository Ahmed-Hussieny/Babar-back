import Joi from "joi";

export const addDeliveryUserSchema = {
    body : Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        password: Joi.string().required(),
    })
};
