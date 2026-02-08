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

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.log("Failed to send email confirmation for renew !!!" + err);
    return false;
  }
};
