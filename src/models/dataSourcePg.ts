import dotenv from "dotenv";
dotenv.config();
import { Pool, QueryResult } from "pg";

// PostgreSQL 데이터베이스 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});

interface PromisePool {
  query: (text: string, params?: any[]) => Promise<QueryResult>;
  getClient: () => Promise<any>;
}

// 프라미스 기반 풀
const promisePool: PromisePool = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
};
// 데이터베이스 연결 객체를 기본으로 내보내기
export default promisePool;