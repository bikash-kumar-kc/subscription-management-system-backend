import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateRepurchaseTemplate } from "./repurchase-template.js";

export const sendEmailForRepurchaseConfirmation = async ({
  serviceProvider,
  serviceName,
  emailTo,
  repurchaseAmount,
  discount,
  refundTo,
}) => {
  const html = generateRepurchaseTemplate({
    serviceProvider,
    serviceName,
    repurchaseAmount,
    discount,
    repurchaseTo: refundTo,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Your Subscription Has Been Repurchased",
    html,
  };

  try {
    await transporter.sendMail(mailOptions)
    return true;
  } catch (err) {
    console.log("failed to send email for repurchase confirmation!!!"+err)
    return false;
  }
};
