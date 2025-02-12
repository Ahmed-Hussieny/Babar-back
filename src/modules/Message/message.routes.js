import { Router } from "express";
import * as messageController from "./message.controller.js";
const messageRouter = Router();
messageRouter.post('/add-message', messageController.addMessage);

export default messageRouter;