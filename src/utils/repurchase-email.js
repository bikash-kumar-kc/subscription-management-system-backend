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

  transporter.sendMail(mailOptions, (error, info) => {
    if (error)
      return console.log(
        error,
        "Error sending email for repurchase subscription!!!",
      );

    console.log("Email send: " + info.response);
    return true;
  });
};
