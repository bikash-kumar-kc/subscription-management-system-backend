import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateRenewSubscriptionTemplateMoney } from "./renew-money-template.js";

export const sendEmailForSubscriptionRenewMoney = async ({
  serviceProvider,
  serviceName,
  startDate,
  newPrice,
  paymentMethod,
  refundTo,
  emailTo,
}) => {
  const html = generateRenewSubscriptionTemplateMoney({
    serviceProvider,
    paymentMethod,
    transactionDate: startDate,
    packageName: serviceName,
    newPrice,
    user: refundTo,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Regarding Subscription Renewels Payment",
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error)
      return console.log(
        error,
        "Error sending email for renew confirmation money!!!",
      );

    console.log("Email send: " + info.response);
    return true;
  });
};
