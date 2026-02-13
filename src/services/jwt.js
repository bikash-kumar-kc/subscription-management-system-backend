import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET_KEY, {
    expiresIn: String(config.JWT_TOKEN_EXPIRE),
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET_KEY, {
    expiresIn: String(config.JWT_TOKEN_EXPIRE),
  });
};
