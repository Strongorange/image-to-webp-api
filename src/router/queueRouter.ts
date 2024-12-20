import {
  assertConvertQueueController,
  downloadImgController,
  getJobStatusController,
} from "@/controllers/queueController";
import { uploadImages } from "@/middlewares/uploadMiddleware";
import { Router } from "express";

const queueRouter = Router();

queueRouter.get("/status/:jobId", getJobStatusController);
queueRouter.get("/download/:jobId", downloadImgController);

queueRouter.post("/convert", uploadImages, assertConvertQueueController);

export default queueRouter;
