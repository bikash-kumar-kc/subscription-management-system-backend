import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateRefundTemplate } from "./refund-template.js";
export const sendMoneyRefundEmail = async ({
  serviceProvider,
  serviceName,
  refundAmount,
  timeOfRefund,
  refundTo,
  emailTo,
  paymentMethod,
}) => {
  const html = generateRefundTemplate({
    serviceProvider,
    serviceName,
    refundAmount,
    timeOfRefund,
    refundTo,
    emailTo,
    paymentMethod,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Regarding refund",
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log("failed to return money to user's subscription!!!" + error);
    return false;
  }
};
