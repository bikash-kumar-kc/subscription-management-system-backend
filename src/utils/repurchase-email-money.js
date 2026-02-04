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

  transporter.sendMail(mailOptions, (error, info) => {
    if (error)
      return console.log(
        error,
        "Error sending email for repurchase payment!!!",
      );

    console.log("Email send: " + info.response);
    return true;
  });
};
