import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateRepurchaseOfSubscriptionTemplate } from "./repurchase-template-money.js";

export const sendEmailForRepurchaseConfirmationMoney = async ({
  serviceProvider,
  serviceName,
  newRepurchasePrice,
  timeOfRepurchased,
  refundTo,
  emailTo,
  paymentMethod,
}) => {
  const html = generateRepurchaseOfSubscriptionTemplate({
    serviceProvider,
    serviceName,
    newRepurchasePrice,
    paymentMethod,
    timeOfRepurchased,
    refundTo,
    emailTo,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Regarding payment successful for subscription repurchase!!",
    html,
  };


  try {
    await transporter.sendMail(mailOptions)
    return true;
  } catch (err) {
    console.log("failed to send email for payment confirmation!!!"+err)
    return false;
  }
  
};
