import nodemailer from "nodemailer";
import { config } from "../config/config.js";

export const accountMail = config.AUTHOR_MAIL;
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: accountMail,
    pass: config.APP_PASSWORD,
  },
});
