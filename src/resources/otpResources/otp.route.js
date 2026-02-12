import express from "express";
import { body } from "express-validator";
import OtpController from "./otp.controller.js";

import { validator } from "../../middleware/validator.js";
import {
  arcjetMiddlewareResendOtp,
  arcjetMiddlewareVerifyOtp,
} from "../../middleware/arcjet.middleware.js";

const otpRouter = express.Router();

otpRouter.post(
  "/verify",
  arcjetMiddlewareVerifyOtp,
  [
    body("email")
      .notEmpty()
      .withMessage("email is required!!!")
      .normalizeEmail()
      .isEmail()
      .withMessage("Invalid email!!!"),
    body("otp").notEmpty().withMessage("otp is required"),
  ],
  validator,
  OtpController.verifyOtp,
);

otpRouter.post(
  "/re-send-otp",
  arcjetMiddlewareResendOtp,
  [
    body("email")
      .notEmpty()
      .withMessage("email is required!!!")
      .normalizeEmail()
      .isEmail()
      .withMessage("Invalid email!!!"),
  ],
  validator,
  OtpController.otpResend,
);

export default otpRouter;
