export const generateRefundTemplate = ({
  serviceProvider,
  serviceName,
  refundAmount,
  timeOfRefund,
  refundTo,
  paymentMethod,
}) => `
<div style="width:100%; background-color:#f3f3f3; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:20px; border-radius:8px; font-family:Arial, Helvetica, sans-serif; box-shadow:0px 0px 10px rgba(0,0,0,0.1);">

    <h1 style="text-align:center; color:#333; margin-bottom:10px;">
      ${paymentMethod.toUpperCase()}
    </h1>

    <p style="text-align:center; color:#555; font-size:16px; line-height:1.5;">
      Hello <strong>${refundTo}</strong>, this email is to confirm that you have successfully received 
      <strong>$${refundAmount} cent</strong> for the cancellation of 
      <strong>${serviceName}</strong> provided by 
      <strong>${serviceProvider}</strong>.
    </p>

    <p style="text-align:center; color:#777; font-size:14px; margin-top:10px;">
      <strong>Date of refund:</strong> ${timeOfRefund}
    </p>

  </div>
</div>
`;
