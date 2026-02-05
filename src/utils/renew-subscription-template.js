export const generateRenewSubscriptionTemplate = ({
  startDate,
  newPrice,
  oldPrice,
  renewalsDate,
  serviceProvider,
  serviceName,
  userName,
}) => {
  const savedAmount =
    Number(oldPrice) - Number(newPrice) > 0
      ? Number(oldPrice) - Number(newPrice)
      : 0;

  return `
<div style="width:100%; background-color:#f3f3f3; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:20px; border-radius:8px; font-family:Arial, Helvetica, sans-serif; box-shadow:0px 0px 10px rgba(0,0,0,0.1);">

    <h1 style="text-align:center; color:#333; margin-bottom:10px;">
      Subscription Renewal Confirmation
    </h1>

    <p style="text-align:center; color:#555; font-size:16px; line-height:1.5;">
      Hello <strong>${userName}</strong>, your subscription has been successfully renewed.
    </p>

    <div style="margin-top:15px; text-align:left; padding:12px; background:#fafafa; border-radius:6px;">
      <p style="color:#333; font-size:15px;">
        <strong>Service Provider:</strong> ${serviceProvider}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Subscription:</strong> ${serviceName}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Subscription Start Date:</strong> ${new Date(startDate).toLocaleDateString()}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Next Renewal Date:</strong> ${new Date(renewalsDate).toLocaleDateString()}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Old Price:</strong> ${oldPrice}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>New Price:</strong> ${newPrice}
      </p>
      <p style="color:#2a7f2e; font-size:15px;">
        <strong>You Saved:</strong> ${savedAmount}
      </p>
    </div>

    <p style="text-align:center; color:#555; font-size:14px; margin-top:15px;">
      Thank you for continuing your subscription with ${serviceProvider}.
    </p>

  </div>
</div>
`}