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

  transporter.sendMail(mailOptions, (error, info) => {
    if (error)
      return console.log(
        error,
        "Error sending email for resume confirmation!!!",
      );

    console.log("Email send: " + info.response);
    return true;
  });
};
