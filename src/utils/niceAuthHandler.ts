// services/NiceAuthHandler.ts
import axios from "axios";
import { CustomError } from "../middlewares/errorHandler";
import { ReqData } from "../types/nice";

const iconv = require("iconv-lite");
const crypto = require("crypto");

export class NiceAuthHandler {
  clientId: string;
  accessToken: string;
  productId: string;

  constructor(clientId: string, accessToken: string, productId: string) {
    this.clientId = clientId;
    this.accessToken = accessToken;
    this.productId = productId;
  }

  // 날짜 데이터 형변환(YYYYMMDDHH24MISS)
  formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const formattedDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;
    return formattedDateTime;
  }

  async getEncryptionToken(
    reqDtim: string,
    currentTimestamp: number,
    reqNo: string
  ) {
    try {
      const authorization = Buffer.from(
        this.accessToken + ":" + currentTimestamp + ":" + this.clientId
      ).toString("base64");
      console.log(this.accessToken);
      console.log(currentTimestamp);
      console.log(this.clientId);
      console.log(this.productId);

      const response = await axios({
        method: "POST",
        url: "https://svc.niceapi.co.kr:22001/digital/niceid/api/v1.0/common/crypto/token",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${authorization}`,
          client_id: this.clientId,
          productID: this.productId,
        },
        data: {
          dataHeader: {
            CNTY_CD: "ko", // 이용언어 : ko, en, cn
          },
          dataBody: {
            req_dtim: reqDtim, // 요청일시
            req_no: reqNo, // 요청고유번호
            enc_mode: "1", // 사용할 암복호화 구분 1 : AES128/CBC/PKCS7
          },
        },
      });

      const resData = response.data;

      // P000 성공, 이외 모두 오류
      if (
        resData.dataHeader.GW_RSLT_CD !== "1200" &&
        resData.dataBody.rsp_cd !== "P000"
      ) {
        throw new CustomError(400, response.data.dataBody.rsp_cd);
      }

      // 사이트 코드, 서버 토큰 값, 서버 토큰 버전 반환
      return {
        siteCode: resData.dataBody.site_code,
        tokenVal: resData.dataBody.token_val,
        tokenVersionId: resData.dataBody.token_version_id,
      };
    } catch (error) {
      throw new CustomError(400, "Failed to get encryption token");
    }
  }

  generateSymmetricKey(reqDtim: string, reqNo: string, tokenVal: string) {
    try {
      if (!reqDtim || !reqNo || !tokenVal) {
        throw new CustomError(400, "Empty parameter");
      }

      const value = reqDtim.trim() + reqNo.trim() + tokenVal.trim();

      // SHA256 암호화 후 Base64 encoding
      const hash = crypto.createHash("sha256").update(value).digest("base64");

      return {
        key: hash.slice(0, 16), // 앞에서부터 16byte
        iv: hash.slice(-16), // 뒤에서부터 16byte
        hmacKey: hash.slice(0, 32), // 앞에서부터 32byte
      };
    } catch (error) {
      throw new CustomError(400, "Failed to generate symmetric key");
    }
  }

  encryptData(data: ReqData, key: string, iv: string) {
    try {
      if (!data || !key || !iv) {
        throw new Error("Empty parameter");
      }

      const strData = JSON.stringify(data).trim();

      // AES128/CBC/PKCS7 암호화
      const cipher = crypto.createCipheriv(
        "aes-128-cbc",
        Buffer.from(key),
        Buffer.from(iv)
      );
      let encrypted = cipher.update(strData, "utf-8", "base64");
      encrypted += cipher.final("base64");

      return encrypted;
    } catch (error) {
      throw new CustomError(400, "Failed to encrypt data");
    }
  }

  hmac256(data: string, hmacKey: string) {
    try {
      if (!data || !hmacKey) {
        throw new Error("Empty parameter");
      }

      const hmac = crypto.createHmac("sha256", Buffer.from(hmacKey));
      hmac.update(Buffer.from(data));

      const integrityValue = hmac.digest().toString("base64");

      return integrityValue;
    } catch (error) {
      throw new CustomError(400, "Failed to generate HMACSHA256 encrypt");
    }
  }

  decryptData(data: string, key: string, iv: string) {
    try {
      if (!data || !key || !iv) {
        throw new Error("Empty parameter");
      }

      const decipher = crypto.createDecipheriv(
        "aes-128-cbc",
        Buffer.from(key),
        Buffer.from(iv)
      );
      let decrypted = decipher.update(data, "base64", "binary");
      decrypted += decipher.final("binary");

      // 'binary'에서 'euc-kr'로 디코딩
      decrypted = iconv.decode(Buffer.from(decrypted, "binary"), "euc-kr");

      const resData = JSON.parse(decrypted);
      return resData;
    } catch (error) {
      console.log(error);
      throw new CustomError(400, "Failed to decrypt data");
    }
  }
} // NiceAuthHandler.class
