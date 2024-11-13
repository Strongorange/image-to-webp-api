import { CustomError } from "@/middlewares/errorHandler";
import { getExample } from "@/models/exampleModel";
import RabbitMqConnection from "@/models/RabbitMqConnection";
import { returnSuccess } from "@/utils/responseUtil";
import { NextFunction, Request, Response } from "express";

export const assertConvertQueueController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new CustomError(400, "파일이 업로드되지 않음");
    }

    interface ConversionOptions {
      quality?: number;
      width?: number;
      height?: number;
    }

    const options: ConversionOptions = {};
    // FormData에서 width, height, quality 값을 추출
    if (req.body.width) options.width = parseInt(req.body.width);
    if (req.body.height) options.height = parseInt(req.body.height);
    if (req.body.quality) options.quality = parseInt(req.body.quality);

    const jobs = req.files.map((file: Express.Multer.File) => ({
      id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      options,
    }));

    for (const job of jobs) {
      await RabbitMqConnection.sendToQueue("image_conversion", job);
    }

    return returnSuccess({
      res,
      data: {
        message: "컨버팅 작업이 큐에 등록됨",
        jobs: jobs.map((job) => ({
          jobId: job.id,
          originalName: job.originalName,
          path: job.path,
          options,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
