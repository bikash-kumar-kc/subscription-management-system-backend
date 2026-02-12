import { config } from "../../config/config.js";
import EmailVerification from "../../services/emailVerificationService.js";
// import { generateToken } from "../../services/jwt.js";
import UserModel from "../userResources/user.model.js";
import mongoose from "mongoose";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;
    const isExist = await UserModel.isUserExist(email);

    if (isExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist!!!" });
    }
    const newUser = await UserModel.create(
      [{ name: name, email: email, password: password, status: false }],
      { session },
    );

    const storeCredential = await EmailVerification.storeCredential({
      email,
      session,
    });

    if (!storeCredential) {
      await session.abortTransaction();
      throw new Error("Failed to store credential for email verfication!!!");
    }

    // FIRST OTP SENDS FROM HERE
    const isEmailSend = await EmailVerification.sendEmail({
      otp: storeCredential.otp,
      email,
      userName: name,
    });

    if (!isEmailSend) {
      console.log("failed to send email!!!");
    }

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "User created Successfully!",
      data: {
        user: newUser[0],
        status: newUser.status,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    const isProduction = config.NODE_ENV === "production" ? true : false;
    const error = {
      message: isProduction
        ? "Problem in cancelling subscription"
        : err.message,
      statusCode: err.statusCode || 500,
      stack: isProduction ? undefined : err.stack,
    };
    next(error);
  } finally {
    session.endSession();
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    if (accessToken) {
      const error = new Error("User is already logged in !!!");
      error.statusCode = 400;
      next(error);
      return;
    }

    const { email, password } = req.body;
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      const error = new Error("User not found !!!");
      error.statusCode = 404;
      next(error);
      return;
    }
    const token = await user.matchPasswordAndGenerateToken(password);
    if (!token) {
      const error = new Error("Password does not matched !!!");
      error.statusCode = 401;
      next(error);
      return;
    }

    const isProduction = !(config.NODE_ENV === "development");

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    res.cookie("accessToken", token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successFully!",
      data: {
        id: user._id,
        token: token,
      },
    });
  } catch (err) {
    const error = new Error("Problem in server!!!");
    error.errors = err.errors;
    next(error);
    return;
  }
};

export const signOut = async (req, res, next) => {
  try {
    const isProduction = !(config.NODE_ENV === "development");
    const { accessToken } = req.cookies;
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successfully!",
      data: {
        token: accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};
