import mongoose from "mongoose";
import { config } from "../../config/config.js";
import otpModel from "./otp.model.js";
import EmailVerification from "../../services/emailVerificationService.js";
import UserModel from "../userResources/user.model.js";
import { generateToken } from "../../services/jwt.js";

class OtpController {
  static verifyOtp = async (req, res, next) => {
    this.isProduction = config.NODE_ENV === "production";
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log("---------here-------------");
    try {
      const { email, otp } = req.body;
      if (!email.trim() || !otp.trim()) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ status: false, message: "email/otp is required!" });
      }

      const user = await UserModel.findOne({ email }).session(session);

      if (!user || user.status) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "user not exist or user email already verified!!!",
        });
      }

      const isOtpVerified = await EmailVerification.verifyOtp({
        email,
        session,
        otp,
      });

      if (!isOtpVerified) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Failed to verify otp !!! Try again",
        });
      }

      const updatedUser = await UserModel.findOneAndUpdate(
        {
          email,
        },
        {
          $set: {
            status: true,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!updatedUser) {
        await session.abortTransaction();
        throw new Error("Failed to update user!!!");
      }

      const token = generateToken(updatedUser._id);

      if (!token) {
        await session.abortTransaction();
        const error = new Error("Failed to generate token!!");
        error.statusCode = 500;
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

      await session.commitTransaction();
      return res.status(200).json({
        success: true,
        message: "user email successfully verifed!",
        data: {
          id: updatedUser._id,
          token: token,
        },
      });
    } catch (err) {
      await session.abortTransaction();
      console.log("here");
      const isProduction = config.NODE_ENV === "production";
      const error = {
        message: isProduction ? "Problem in verify email!!!" : err.message,
        statusCode: err.statusCode || 500,
        stack: isProduction ? undefined : err.stack,
      };
      next(error);
    } finally {
      await session.endSession();
    }
  };

  static otpResend = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { email } = req.body;
      if (!email.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "email is required!!!" });
      }

      const isOtpExist = await otpModel.findOne({ email });
      if (isOtpExist) {
        await session.abortTransaction();
        throw new Error("Valid otp for this email!!!");
      }

      const user = await UserModel.findOne({ email }).session(session);

      if (!user) {
        await session.abortTransaction();
        throw new Error("User not found!!!");
      }

      const storeCredential = await EmailVerification.storeCredential({
        email: user.email,
        session,
      });

      if (!storeCredential) {
        await session.abortTransaction();
        throw new Error("Failed to store credential for email verfication!!!");
      }

      const isEmailSend = await EmailVerification.sendEmail({
        otp: storeCredential.otp,
        email,
        userName: user.name,
      });

      if (!isEmailSend) {
        console.log("failed to send email!!!");
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        message: "OTP send successfully!",
        data: {
          otp: this.isProduction ? undefined : storeCredential.otp,
        },
      });
    } catch (err) {
      await session.abortTransaction();

      const error = {
        message: this.isProduction ? "Problem in verify email!!!" : err.message,
        statusCode: this.err.statusCode || 500,
        stack: this.isProduction ? undefined : err.stack,
      };
      next(error);
    } finally {
      await session.endSession();
    }
  };
}

export default OtpController;
