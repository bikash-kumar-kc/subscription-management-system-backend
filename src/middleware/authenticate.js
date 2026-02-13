import { config } from "../config/config.js";
import UserModel from "../resources/userResources/user.model.js";
import { verifyToken } from "../services/jwt.js";

const authenticate = async (req, res, next) => {
  try {
    let token;
    let isProduction = config.NODE_ENV === "production" ? true : false;

    if (isProduction) {
      if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
      }
    } else {
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }
    }

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is required" });
    }

    const decode = verifyToken(token);

    if (!decode) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized!!!" });
    }

    const user = await UserModel.findById(decode.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!!!",
        data: { id: decode.id },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.send(401).json({ success: false, message: "Unauthorized!!!" });
  }
};

export default authenticate;
