import { config as conf } from "dotenv";
conf();

const _config = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_DB: process.env.MONGO_DB,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_TOKEN_EXPIRE: process.env.JWT_TOKEN_EXPIRE,
  ARCJET_TOKEN: process.env.ARCJET_TOKEN,
  ARCJECT_ENV: process.env.ARCJECT_ENV,
  QSTASH_URL:process.env.QSTASH_URL,
  QSTASH_TOKEN:process.env.QSTASH_TOKEN,
  QSTASH_CURRENT_SIGNING_KEY:process.env.QSTASH_CURRENT_SIGNING_KEY,
  QSTASH_NEXT_SIGNING_KEY:process.env.QSTASH_NEXT_SIGNING_KEY,
  LOCAL_SERVER_URL:process.env.LOCAL_SERVER_URL,
  APP_PASSWORD:process.env.APP_PASSWORD,
};

export const config = Object.freeze(_config);
