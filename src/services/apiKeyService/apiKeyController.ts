import apiKeyService from "@/services/apiKeyService/apiKeyService";
import { CreateApiKeyBody } from "@/types/apiKeyServiceTypes";
import {
  returnKeyError,
  returnSuccess,
  sendResponse,
} from "@/utils/responseUtil";
import { Request, Response, NextFunction } from "express";

class ApiKeyController {
  createApiKey = async (
    req: Request<any, any, CreateApiKeyBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = req.body;
      const {
        app_name,
        contact_email,
        contact_phone,
        redirect_url,
        user_name,
      } = body;

      if (
        !app_name ||
        !contact_email ||
        !contact_phone ||
        !redirect_url ||
        !user_name
      ) {
        return returnKeyError(res);
      }

      const newApiKey = await apiKeyService.createApiKey(body);
      return returnSuccess(res, { newApiKey });
    } catch (error) {
      console.error("createApiKey 에러", error);
      next(error);
    }
  };
}

export default new ApiKeyController();
