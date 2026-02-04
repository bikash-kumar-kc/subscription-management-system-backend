export const generateRepurchaseTemplate = ({
  serviceProvider,
  serviceName,
  repurchaseAmount,
  discount,
  repurchaseTo,
}) => {
  return `
<div style="width:100%; background-color:#f3f3f3; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:20px; border-radius:8px; font-family:Arial, Helvetica, sans-serif; box-shadow:0px 0px 10px rgba(0,0,0,0.1);">

    <h1 style="text-align:center; color:#333; margin-bottom:10px;">
      Repurchase Confirmation
    </h1>

    <p style="text-align:center; color:#555; font-size:16px; line-height:1.5;">
      Hello <strong>${repurchaseTo}</strong>, your repurchase for  
      <strong>${serviceName}</strong> from  
      <strong>${serviceProvider}</strong> has been successfully completed.
    </p>

    <div style="margin-top:15px; text-align:center;">
      <p style="color:#333; font-size:15px;">
        <strong>Repurchase Amount:</strong> ${repurchaseAmount}
      </p>
      <p style="color:#333; font-size:15px;">
        <strong>Discount Applied:</strong> ${discount}%
      </p>
      <p style="color:#777; font-size:14px;">
        <strong>Date:</strong> ${new Date().toLocaleString()}
      </p>
    </div>

  </div>
</div>
`;
};
