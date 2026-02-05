import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateRenewSubscriptionTemplate } from "./renew-subscription-template.js";



export const sendEmailForSubscriptionRenew = async ({
  serviceProvider,
  serviceName,
  startDate,
  newPrice,
  oldPrice,
  renewalsDate,
  refundTo,
  emailTo,
}) => {
  const html = generateRenewSubscriptionTemplate({
    startDate,
    newPrice,
    oldPrice,
    renewalsDate,
    serviceProvider,
    serviceName,
    userName: refundTo,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Your Subscription Has Been Renewed",
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error)
      return console.log(
        error,
        "Error sending email for renew confirmation!!!",
      );

    console.log("Email send: " + info.response);
    return true;
  });
};
