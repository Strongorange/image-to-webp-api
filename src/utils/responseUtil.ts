import { Response } from "express";

type ApiResponse<T> = {
  status: number;
  message: string;
  data?: T;
};

interface IReturnSuccess<T> {
  res: Response;
  data?: T;
  code?: number;
}

export const sendResponse = <T>(
  res: Response,
  status: number,
  message: string,
  data?: T
) => {
  const response: ApiResponse<T> = {
    status,
    message,
    data,
  };

  if (data === undefined || data === null) {
    delete response.data;
  }

  return res.status(status).json(response);
};

export const returnSuccess = <T>({ res, code, data }: IReturnSuccess<T>) => {
  return sendResponse(res, code ?? 200, "success", data);
};

export const returnKeyError = (res: Response) => {
  console.error("KEY_ERROR");
  return sendResponse(res, 400, "KEY_ERROR");
};