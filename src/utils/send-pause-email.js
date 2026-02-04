import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateTemplateForSubscriptionPaused } from "./pause-subscription-template.js";

export const sendEmailForSubscriptionPaused = async ({
  serviceProvider,
  serviceName,
  emailTo,
  pausesUsed,
  pausesRemaining,
  refundTo,
}) => {
  const html = generateTemplateForSubscriptionPaused({
    serviceProvider,
    serviceName,
    pausesUsed,
    pausesRemaining,
    refundTo,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Your Subscription Has Been Paused",
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error)
      return console.log(
        error,
        "Error sending email for pauses confirmation!!!",
      );

    console.log("Email send: " + info.response);
      return true;
  });


};
