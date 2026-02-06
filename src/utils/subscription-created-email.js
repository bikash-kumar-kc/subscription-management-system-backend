import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateSubscriptionCreatedTemplate } from "./subscription-created-template.js";

export const sendEmailForSubcriptionCreated = async ({
  serviceProvider,
  serviceName,
  startDate,
  renewalsDate,
  price,
  emailTo,
  refundTo,
}) => {
  const html = generateSubscriptionCreatedTemplate({
    serviceProvider,
    serviceName,
    startDate,
    renewalsDate,
    price: "$" + price + "cent",
    userName: refundTo,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Regarding Successful Subscription created!!",
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("successfully email sent!");
    return true;
  } catch (error) {
    console.log("problem in sending mail!!!" + error.message);
    return false;
  }
};
