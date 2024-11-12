import dataSource from "@/models/dataSource";
import { CreateApiKeyBody } from "@/types/apiKeyServiceTypes";
import generateApiKey from "@/utils/generateApiKey";
import { ResultSetHeader, RowDataPacket } from "mysql2";

class ApiKeyModel {
  // API 키 저장
  saveApiKey = async (body: CreateApiKeyBody & { api_key: string }) => {
    const {
      api_key,
      user_name,
      contact_email,
      contact_phone,
      app_name,
      redirect_url,
    } = body;

    const params = [
      api_key,
      user_name,
      contact_email,
      contact_phone,
      app_name,
      redirect_url,
    ];

    const query = `
    INSERT INTO customers_api_keys 
    (
        api_key,
        user_name,
        contact_email,
        contact_phone,
        app_name,
        redirect_url
    )
    VALUES 
    (?, ?, ?, ? ,?, ?)
    `;

    const result = await dataSource.query<ResultSetHeader>(query, params);
    return result;
  };

  // API 중복 확인
  checkDuplicteApiKey = async (api_key: string) => {
    const query = `
    SELECT COUNT(*) as count FROM customers_api_keys
    WHERE api_key = ?
    `;
    const params = [api_key];

    const [result] = await dataSource.query<RowDataPacket[]>(query, params);

    const count = result[0].count as number;
    return count > 0;
  };
}

export default new ApiKeyModel();
