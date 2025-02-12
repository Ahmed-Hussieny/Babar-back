import Joi from 'joi'

//* schema for signUp
export const signUpSchema = {
    body : Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Confirm password does not match password',
        }),
    })
};

//* schema for verifyEmail
export const verifyEmailSchema = {
    query: Joi.object({
        userToken: Joi.string().required()
    })
};

//* schema for signIn
export const signInSchema = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
}

//* schema for forgotPassword
export const forgetPasswordSchema = {
    body: Joi.object({
        email: Joi.string().email().required()
    })
};

//* schema for verifyResetCode
export const verifyResetCodeSchema = {
    query: Joi.object({
        token: Joi.string().required()
    })
};

//* schema for resetPassword
export const resetPasswordSchema = {
    body: Joi.object({
        token: Joi.string().required(),
        newPassword: Joi.string().required(),
    })
};