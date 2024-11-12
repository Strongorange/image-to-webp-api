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
    const jobId = Date.now().toString();
    const job = {
      id: jobId,
      path: "willRealPathOrS3Path",
    };

    await RabbitMqConnection.sendToQueue("image_conversion", job);

    return returnSuccess({
      res,
      data: {
        message: "컨버팅 등록 됨",
        jobId: jobId,
      },
    });
  } catch (error) {
    next(error);
  }
};
