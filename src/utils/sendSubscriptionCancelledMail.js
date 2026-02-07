import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateTemplateForServiceProviderConfirmation } from "./service-provider-template.js";

export const sendSubscriptionCancelledMail = async ({
  serviceProvider,
  serviceName,
  refundTo,
  emailTo,
}) => {
  const html = generateTemplateForServiceProviderConfirmation({
    serviceProvider,
    serviceName,
    refundTo,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Regarding cancellation",
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log(
      "Failed to send email regardaing subscription cancel!!!" + error,
    );
    return false;
  }
};
