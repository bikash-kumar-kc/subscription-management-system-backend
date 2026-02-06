
export const generateSubscriptionCreatedTemplate = ({
  serviceProvider,
  serviceName,
  startDate,
  renewalsDate,
  price,
  userName,
}) => {
  return `
<div style="width:100%; background-color:#f3f3f3; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:25px; border-radius:8px; font-family:Arial, Helvetica, sans-serif; box-shadow:0px 0px 10px rgba(0,0,0,0.1);">

    <h1 style="text-align:center; color:#333; margin-bottom:15px;">
      🎉 Subscription Created Successfully!
    </h1>

    <p style="text-align:center; color:#555; font-size:16px; line-height:1.5;">
      Hello <strong>${userName}</strong>, thank you for subscribing! We’re excited to have you on board.
    </p>

    <div style="margin-top:20px; padding:15px; background:#fafafa; border-radius:6px; text-align:left;">
      <p style="color:#333; font-size:15px;">
        <strong>Service Provider:</strong> ${serviceProvider}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Subscription Name:</strong> ${serviceName}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Next Renewal Date:</strong> ${new Date(renewalsDate).toLocaleDateString()}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Price:</strong> ${price}
      </p>
    </div>

    <p style="text-align:center; color:#555; font-size:14px; margin-top:20px;">
      We hope you enjoy your subscription and make the most of our services! 🌟
    </p>

  </div>
</div>
`;
};