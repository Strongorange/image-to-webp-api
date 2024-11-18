import { CustomError } from "@/middlewares/errorHandler";
import { getExample } from "@/models/exampleModel";
import RabbitMqConnection from "@/models/RabbitMqConnection";
import RedisConnection from "@/models/RedisConnection";
import { returnSuccess, sendResponse } from "@/utils/responseUtil";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";

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
      status: "queued",
    }));

    for (const job of jobs) {
      await RabbitMqConnection.sendToQueue("image_conversion", job);
      await RedisConnection.set(`job:${job.id}`, JSON.stringify(job));
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

export const getJobStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;

    const jobData = await RedisConnection.get(`job:${jobId}`);
    if (!jobData) {
      return sendResponse(res, 404, "해당 job이 없음");
    }

    const job = JSON.parse(jobData);

    return returnSuccess({
      res,
      data: {
        status: job.status,
        result: job.result,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const downloadImgController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;

    const jobData = await RedisConnection.get(`job:${jobId}`);
    if (!jobData) {
      return sendResponse(res, 404, "해당 job 없음");
    }

    const job = JSON.parse(jobData);

    if (job.status !== "completed") {
      return sendResponse(res, 400, "이미지 변환 작업 진행중");
    }

    const filePath = job.result.path;

    if (!fs.existsSync(filePath)) {
      return sendResponse(res, 404, "파일이 없음");
    }

    const fileName = path.basename(filePath);
    const encodedFileName = encodeURIComponent(fileName).replace(
      /['()]/g,
      escape
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodedFileName}`
    );
    res.setHeader("Content-Type", "image/webp");

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};
