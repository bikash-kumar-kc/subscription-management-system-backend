import { accountMail, transporter } from "../nodemailer/nodemailer.js";
import { generateRefundTemplate } from "./refund-template.js";
export const sendMoneyRefundEmail = async ({
  serviceProvider,
  serviceName,
  refundAmount,
  timeOfRefund,
  refundTo,
  emailTo,
  paymentMethod,
}) => {
  const html = generateRefundTemplate({
    serviceProvider,
    serviceName,
    refundAmount,
    timeOfRefund,
    refundTo,
    emailTo,
    paymentMethod,
  });

  const mailOptions = {
    from: accountMail,
    to: emailTo,
    subject: "Regarding refund",
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error, "Error sending email for refund!!!");

    console.log("Email send: " + info.response);
  });
};
