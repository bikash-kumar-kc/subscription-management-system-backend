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

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.log("Failed to send renew payment confirmation!!!" + err);
    return false;
  }
};
