import { Response } from "express";
import { CustomError } from "../middlewares/errorHandler";

const checkUserAndReturn = (res: Response) => {
  const userId = res.locals.user.userId;
  if (!userId) {
    throw new CustomError(401, "유저 정보 에러");
  }
  return userId;
};

export default checkUserAndReturn;
