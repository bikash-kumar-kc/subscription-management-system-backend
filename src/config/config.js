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
};

export const config = Object.freeze(_config);
