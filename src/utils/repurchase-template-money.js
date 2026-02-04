export const generateRepurchaseOfSubscriptionTemplate = ({
  serviceProvider,
  serviceName,
  newRepurchasePrice,
  timeOfRepurchased,
  refundTo,
  emailTo,
  paymentMethod,
}) => {
  return `
<div style="width:100%; background-color:#f3f3f3; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:20px; border-radius:8px; font-family:Arial, Helvetica, sans-serif; box-shadow:0px 0px 10px rgba(0,0,0,0.1);">

    <h1 style="text-align:center; color:#333; margin-bottom:10px;">
      ${paymentMethod.toUpperCase()} REPURCHASE CONFIRMATION
    </h1>

    <p style="text-align:center; color:#555; font-size:16px; line-height:1.5;">
      Hello <strong>${refundTo}</strong>,  
      your subscription repurchase has been successfully processed.
    </p>

    <div style="margin-top:15px; text-align:left; padding:10px; background:#fafafa; border-radius:6px;">
      <p style="color:#333; font-size:15px;">
        <strong>Service Provider:</strong> ${serviceProvider}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Subscription:</strong> ${serviceName}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Repurchase Amount:</strong> ${newRepurchasePrice}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Payment Method:</strong> ${paymentMethod}
      </p>
      <p style="color:#777; font-size:14px;">
        <strong>Date & Time:</strong> ${new Date(timeOfRepurchased).toLocaleString()}
      </p>
      <p style="color:#777; font-size:14px;">
        <strong>Email:</strong> ${emailTo}
      </p>
    </div>

    <p style="text-align:center; color:#555; font-size:14px; margin-top:15px;">
      Thank you for continuing your subscription with us.
    </p>

  </div>
</div>
`;
};
