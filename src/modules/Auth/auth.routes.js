import { Router } from "express";
import * as authController from "./auth.controller.js";
import expressAsyncHandler from "express-async-handler";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
    forgetPasswordSchema,
    resetPasswordSchema,
    signInSchema,
    signUpSchema,
    verifyEmailSchema,
    verifyResetCodeSchema,
} from "./auth.validationSchemas.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
const authRouter = Router();

authRouter.post(
    "/signup",
    validationMiddleware(signUpSchema),
    expressAsyncHandler(authController.signUp)
);
authRouter.post(
    "/verifyEmail",
    validationMiddleware(verifyEmailSchema),
    expressAsyncHandler(authController.verifyEmail)
);
authRouter.post(
    "/resendVerificationEmail",
    expressAsyncHandler(authController.resendVerificationEmail)
);
authRouter.post(
    "/signin",
    validationMiddleware(signInSchema),
    expressAsyncHandler(authController.signIn)
);
authRouter.post(
    "/forgotPassword",
    validationMiddleware(forgetPasswordSchema),
    expressAsyncHandler(authController.forgotPassword)
);
authRouter.post(
    "/verifyResetToken",
    validationMiddleware(verifyResetCodeSchema),
    expressAsyncHandler(authController.verifyResetToken)
);
authRouter.post(
    "/resetPassword",
    validationMiddleware(resetPasswordSchema),
    expressAsyncHandler(authController.resetPassword)
);

authRouter.put(
    "/updateLoggedInUser",
    auth([systemRoles.ADMIN]),
    expressAsyncHandler(authController.updateLoggedInUser)
)

authRouter.put(
    "/updateLoggedInUserPassword",
    auth([systemRoles.ADMIN]),
    expressAsyncHandler(authController.updateLoggedInUserPassword)
)


export default authRouter;
