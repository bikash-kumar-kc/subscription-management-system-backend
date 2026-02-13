import otpModel from "../resources/otpResources/otp.model.js";
import { transporter, accountMail } from "../nodemailer/nodemailer.js";
import { emailVerificationTemplate } from "../utils/emailVerificationTemplate.js";

class EmailVerification {
  static storeCredential = async ({ email, session }) => {
    try {
      const otp = this.generateOtp();
      console.log(otp);
      const isSaved = await otpModel.create(
        [
          {
            email,
            otp,
          },
        ],
        { new: true, session },
      );
      console.log(isSaved);
      return isSaved[0];
    } catch (err) {
      console.log(err);
      throw new Error(
        "failed to store credential for email verification!!!" + err,
      );
    }
  };

  static sendEmail = async ({ otp, email, userName }) => {
    try {
      const html = emailVerificationTemplate({ userName, otp });
      const mailOptions = {
        from: accountMail,
        to: email,
        subject: "Email Verifcation Process!",
        html,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.log(error);
      throw new Error("failed to send email for email verfication!!!");
    }
  };

  static verifyOtp = async ({ email, session, otp }) => {
    try {
      const otpInfo = await otpModel
        .findOne({ email })
        .select("otp")
        .session(session);
      if (!otpInfo) {
        return false;
      }

      if (otpInfo.otp !== otp) {
        return false;
      }

      return true;
    } catch (err) {
      console.log(err);
      throw new Error("failed to verifyOtp!!!");
    }
  };

  static generateOtp = () => {
    let otp = "";
    for (let i = 0; i < 6; i++) {
      otp += Math.floor(Math.random() * 10);
    }

    return otp;
  };
}

export default EmailVerification;
