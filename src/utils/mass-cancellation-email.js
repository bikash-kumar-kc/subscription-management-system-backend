import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateTemplateForCancellationSummary } from "./mass-cancellation-template.js";

export const sendEmailForMassSubcriptionCancellation = async ({
  successfulCancellations = [],
  unsuccessfulCancellations = [],
  refundTo,
  emailTo,
}) => {
  const html = generateTemplateForCancellationSummary({
    userName: refundTo,
    successfulCancellations,
    unsuccessfulCancellations,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Your Subscriptions Has Been Cancellation",
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.log(
      "Failed to send email confirmation for cancelling mass subscription!!!" +
        err,
    );
    return false;
  }
};
