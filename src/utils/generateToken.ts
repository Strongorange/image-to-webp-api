import jwt from "jsonwebtoken";

const YEAR = "365d";
const TEN_SEC = 10;
const TEN_MIN = 60 * 10;

export const generateToken = (
  type: "access" | "refresh",
  userId?: number,
  kakaoId?: number,
  isTest?: boolean
) => {
  const secret =
    type === "access"
      ? process.env.JWT_ACCESS_SECRET
      : process.env.JWT_REFRESH_SECRET;
  const expiration = type === "access" ? (isTest ? YEAR : YEAR) : "30d";
  const token = jwt.sign({ userId }, secret!, {
    expiresIn: expiration,
  });
  return token;
};

export const generateAdminToken = (
  type: "access" | "refresh",
  adminId: number,
  email: string,
  isTest?: boolean
) => {
  const secret =
    type === "access"
      ? process.env.JWT_ACCESS_SECRET
      : process.env.JWT_REFRESH_SECRET;
  const expiration = type === "access" ? (isTest ? YEAR : YEAR) : "30d";
  // const expiration = type === "access" ? (isTest ? YEAR : "10s") : "1m";
  const token = jwt.sign({ adminId, email }, secret!, {
    expiresIn: expiration,
  });
  return token;
};
