import { assertConvertQueueController } from "@/controllers/queueController";
import { uploadImages } from "@/middlewares/uploadMiddleware";
import { Router } from "express";

const queueRouter = Router();

queueRouter.post("/convert", uploadImages, assertConvertQueueController);

export default queueRouter;
