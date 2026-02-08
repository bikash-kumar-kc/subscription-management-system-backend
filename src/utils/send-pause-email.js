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

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.log(
      "Failed to send email confiramtion for subscription paused!!!" + err,
    );
    return false;
  }
};
