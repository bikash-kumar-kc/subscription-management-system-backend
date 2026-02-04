export const generateRefundTemplate = ({
  serviceProvider,
  serviceName,
  refundAmount,
  timeOfRefund,
  refundTo,
  paymentMethod,
}) => `

<div class="wrapper" style="background-color: rgb(185, 174, 174);padding:1rem">
        <div>
            <div>
                <h1 style="text-align: center;">${paymentMethod.toUpperCase()}</h1>
            </div>
            <div>
                <p style="text-align: center;">Hello ${refundTo}, this email is to confirm that you have successfully received ${refundAmount} for the cancellation of ${serviceName} provided by ${serviceProvider}</p>
                <p>Date of refund:: ${timeOfRefund}</p>
            </div>
        </div>
    </div>

`;
