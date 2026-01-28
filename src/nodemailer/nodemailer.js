import nodemailer from "nodemailer";
import { config } from "../config/config.js";

export const accountMail= "kcbikash886@gmail.com"
export const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:accountMail,
        pass:config.APP_PASSWORD,
    },
});