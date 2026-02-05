export const generateRenewSubscriptionTemplateMoney = ({
  serviceProvider,
  paymentMethod,
  transactionDate,
  user,
  packageName,
  newPrice,
}) => {
  return `
<div style="width:100%; background-color:#f3f3f3; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:20px; border-radius:8px; font-family:Arial, Helvetica, sans-serif; box-shadow:0px 0px 10px rgba(0,0,0,0.1);">

    <h1 style="text-align:center; color:#333; margin-bottom:10px;">
      ${paymentMethod.toUpperCase()} — RENEWAL CONFIRMATION
    </h1>

    <p style="text-align:center; color:#555; font-size:16px; line-height:1.5;">
      Hello <strong>${user}</strong>, your subscription has been successfully renewed.
    </p>

    <div style="margin-top:15px; text-align:left; padding:12px; background:#fafafa; border-radius:6px;">
      <p style="color:#333; font-size:15px;">
        <strong>Service Provider:</strong> ${serviceProvider}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Package:</strong> ${packageName}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Payment Method:</strong> ${paymentMethod}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>New Price:</strong> ${newPrice}
      </p>
      <p style="color:#777; font-size:14px;">
        <strong>Transaction Date:</strong> ${new Date(transactionDate).toLocaleString()}
      </p>
    </div>

    <p style="text-align:center; color:#555; font-size:14px; margin-top:15px;">
      Thank you for continuing your subscription with ${serviceProvider}.
    </p>

  </div>
</div>
`;
};