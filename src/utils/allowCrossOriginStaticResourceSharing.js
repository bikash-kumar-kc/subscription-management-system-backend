import { config } from "../config/config.js";

export const allowCrossOriginStaticResourceSharing = async (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-policy", "cross-origin");
  res.setHeader("Access-Control-Allow-Origin", config.FRONTEND_URL);
  next();
};
