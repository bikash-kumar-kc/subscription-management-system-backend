export const generateTemplateForCancellationSummary = ({
  userName,
  successfulCancellations = [],
  unsuccessfulCancellations = [],
}) => `
      <div style="width:100%; background-color:#f3f3f3; padding:20px;">
         <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:20px; border-radius:8px; font-family:Arial, Helvetica, sans-serif; box-shadow:0px 0px 10px rgba(0,0,0,0.1);">
             <h1 style="text-align:center; color:#333; margin-bottom:10px;">
                 Cancellation Summary </h1>
              <h2 style="text-align:center; color:#555; font-size:16px; font-weight:normal; line-height:1.5;">
                 Hello <strong>${userName}</strong>, here is the summary of your recent cancellation request made at <strong>${new Date().toLocaleString()}</strong> 
                 </h2> <!-- Successful Cancellations --> <div style="margin-top:20px;"> <h3 style="color:#2e7d32; margin-bottom:8px;">Successful Cancellations</h3> ${successfulCancellations.length ? successfulCancellations.map((item) => ` <div style="margin-bottom:12px; padding:10px; border:1px solid #ddd; border-radius:6px;"> <p style="margin:5px 0; color:#333;"> <strong>Service Provider:</strong> ${item.serviceProvider} </p> <p style="margin:5px 0; color:#333;"> <strong>Service Name:</strong> ${item.serviceName} </p> <p style="margin:5px 0; color:#333;"> <strong>Price:</strong> ${item.price} </p> <p style="margin:5px 0; color:#333;"> <strong>Return Amount:</strong> ${item.returnAmount} </p> <p style="margin:5px 0; color:#333;"> <strong>Total Days Service Used:</strong> ${item.totalDaysServiceUsed} </p> </div> `).join("") : `<p style="color:#666;">No successful cancellations.</p>`} </div> <!-- Unsuccessful Cancellations --> <div style="margin-top:20px;"> <h3 style="color:#c62828; margin-bottom:8px;">Unsuccessful Cancellations</h3> ${unsuccessfulCancellations.length ? unsuccessfulCancellations.map((item) => ` <div style="margin-bottom:12px; padding:10px; border:1px solid #ddd; border-radius:6px;"> <p style="margin:5px 0; color:#333;"> <strong>Service Provider:</strong> ${item.serviceProvider} </p> <p style="margin:5px 0; color:#333;"> <strong>Service Name:</strong> ${item.serviceName} </p> </div> `).join("") : `<p style="color:#666;">No unsuccessful cancellations.</p>`} </div> </div> </div> `;
