import apiKeyModel from "@/services/apiKeyService/apiKeyModel";
import { CreateApiKeyBody } from "@/types/apiKeyServiceTypes";
import generateApiKey from "@/utils/generateApiKey";

class ApiKeyService {
  createApiKey = async (body: CreateApiKeyBody) => {
    let newApiKey;
    let isDuplicate;

    do {
      newApiKey = generateApiKey();
      isDuplicate = await apiKeyModel.checkDuplicteApiKey(newApiKey);
    } while (isDuplicate);

    await apiKeyModel.saveApiKey({ api_key: newApiKey, ...body });

    return newApiKey;
  };
}

export default new ApiKeyService();
