import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateTemplateForResumeSubscription } from "./resume-template.js";

export const sendEmailForSubscriptionResume = async ({
  serviceProvider,
  serviceName,
  newRenewalsDate,
  pauseAt,
  pausesUsed,
  pausesRemaining,
  refundTo,
  emailTo,
}) => {
  const html = generateTemplateForResumeSubscription({
    serviceProvider,
    serviceName,
    pausesUsed,
    pausesRemaining,
    newRenewalsDate,
    userName: refundTo,
    pauseAt,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Your Subscription Has Been Resumed",
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.log(
      "Failed to send email confiramtion for resume subscription!!!" + err,
    );
    return false;
  }
};
