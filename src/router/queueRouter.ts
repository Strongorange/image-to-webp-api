import { assertConvertQueueController } from "@/controllers/queueController";
import { Router } from "express";

const queueRouter = Router();

queueRouter.get("/convert", assertConvertQueueController);

export default queueRouter;
