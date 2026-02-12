import aj, { arcjectVerifyToken, arcjetResendToken } from "../arcjet/arcjet.js";

const arcjet = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Rate Limit Exceed" });
      }

      if (decision.reason.isBot()) {
        return res.status(401).json({ message: "No bots allowed" });
      }

      return res.status(400).json({ message: "BAD_REQUEST" });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default arcjet;

export const arcjetMiddlewareResendOtp = async (req, res, next) => {
  try {
    const decision = await arcjetResendToken.protect(req, { requested: 1 });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Rate Limit Exceed" });
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const arcjetMiddlewareVerifyOtp = async (req,res,next)=>{
   try {
    const decision = await arcjectVerifyToken.protect(req, { requested: 1 });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Rate Limit Exceed" });
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}


