import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateTemplateForCancellationSummary } from "./mass-cancellation-template.js";


export const sendEmailForMassSubcriptionCancellation = async ({

  successfulCancellations = [],
  unsuccessfulCancellations = [],
  refundTo,
  emailTo,
}) => {
  const html = generateTemplateForCancellationSummary({
    userName:refundTo,
    successfulCancellations,
    unsuccessfulCancellations,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Your Subscriptions Has Been Cancellation",
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error)
      return console.log(
        error,
        "Error sending email for mass subscription cancellation!!!",
      );

    console.log("Email send: " + info.response);
    return true;
  });
};
