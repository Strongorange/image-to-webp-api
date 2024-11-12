import { RowDataPacket } from "mysql2";
import dataSource from "@/models/dataSource";

export const getExample = async () => {
  const query = `
    SELECT * FROM site_info
    `;
  const [result] = await dataSource.query<RowDataPacket[]>(query);

  return result;
};
