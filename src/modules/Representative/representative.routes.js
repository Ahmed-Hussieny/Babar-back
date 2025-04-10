import { Router } from "express";
import * as representativeController from './representative.controller.js';
import { auth } from "../../middlewares/auth.middleware.js";
import { representativeRoles } from "./representative.endPoints.roles.js";
import expressAsyncHandler from "express-async-handler";

const representativeRouter = Router();

representativeRouter.post(
  "/add-representative",
  auth(representativeRoles.ADD_REPRESENTIVE),
  expressAsyncHandler(representativeController.addRepresentative)
);

representativeRouter.get(
  "/get-representatives",
  // auth(representativeRoles.GET_RESTAURANTS),
  expressAsyncHandler(representativeController.getRepresentatives)
);

representativeRouter.post(
  "/login-representative",
  expressAsyncHandler(representativeController.loginRepresentative)
);

representativeRouter.post(
  "/verify-representative/:representativeId",
  auth(representativeRoles.VERIFY_REPRESENTIVE),
  expressAsyncHandler(representativeController.verifyRepresentative)
);

representativeRouter.post(
  "/toggle-representative-status/:representativeId",
  // auth(representativeRoles.TOGGLE_RESTAURANT_STATUS),
  expressAsyncHandler(representativeController.toggleRepresentative)
);

representativeRouter.post(
  "/get-representative/:representativeId",
  // auth(representativeRoles.GET_RESTAURANT),
  expressAsyncHandler(representativeController.getRepresentative)
);

representativeRouter.put(
  "/update-representative/:id",
  expressAsyncHandler(representativeController.updateRepresentative)
);

representativeRouter.put(
  "/update-password/:id",
  expressAsyncHandler(representativeController.updateRepresentativePassword)
);

representativeRouter.get(
  "/get-representative-by-token",
  expressAsyncHandler(representativeController.getLoggedInRepresentative)
);

export default representativeRouter;