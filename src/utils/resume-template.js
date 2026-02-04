export const generateTemplateForResumeSubscription = async({
  serviceProvider,
  serviceName,
  newRenewalsDate,
  pauseAt,
  pausesUsed,
  pausesRemaining,
  userName,
}) => {
  return `
  <div style="width:100%; background-color:#f3f3f3; padding:20px;">
    {" "}
    <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:20px; border-radius:8px; font-family:Arial, Helvetica, sans-serif; box-shadow:0px 0px 10px rgba(0,0,0,0.1);">
      {" "}
      <h1 style="text-align:center; color:#333; margin-bottom:10px;">
        {" "}
        ${serviceProvider}{" "}
      </h1>{" "}
      <h2 style="text-align:center; color:#555; font-size:16px; font-weight:normal; line-height:1.5;">
        {" "}
        Hello <strong>${userName}</strong>, your subscription named{" "}
        <strong>${serviceName}</strong> has been resumed at{" "}
        <strong>${new Date().toLocaleString()}</strong>{" "}
      </h2>{" "}
      <div style="margin-top:15px; padding:10px; border:1px solid #ddd; border-radius:6px;">
        {" "}
        <p style="margin:5px 0; color:#333;">
          {" "}
          <strong>Paused At:</strong> ${new Date(pauseAt).toLocaleString()}{" "}
        </p>{" "}
        <p style="margin:5px 0; color:#333;">
          {" "}
          <strong>New Renewal Date:</strong> $
          {new Date(newRenewalsDate).toLocaleString()}{" "}
        </p>{" "}
        <p style="margin:5px 0; color:#333;">
          {" "}
          <strong>Pauses Used:</strong> ${pausesUsed}{" "}
        </p>{" "}
        <p style="margin:5px 0; color:#333;">
          {" "}
          <strong>Pauses Remaining:</strong> ${pausesRemaining}{" "}
        </p>{" "}
        <p style="margin:5px 0; color:#333;">
          {" "}
          <strong>New RenewalsDate:</strong> ${newRenewalsDate}{" "}
        </p>{" "}
      </div>{" "}
    </div>{" "}
  </div> `;
};
