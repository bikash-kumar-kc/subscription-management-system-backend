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

  transporter.sendMail(mailOptions, (error, info) => {
    if (error)
      return console.log(error, "Error sending email for cancellation!!!");

    console.log("Email send: " + info.response);
  });
};
