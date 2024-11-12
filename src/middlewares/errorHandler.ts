// errorHandler.ts
import { Request, Response, NextFunction } from "express";

export class CustomError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export function errorHandler(
  error: CustomError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log(error);
  if (error instanceof CustomError) {
    res
      .status(error.status)
      .json({ status: error.status, message: error.message });
  } else {
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
}
