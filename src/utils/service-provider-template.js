

export const generateTemplateForServiceProviderConfirmation = ({
    serviceProvider,
    serviceName,
    refundTo,
})=> 
    `
 <div class="wrapper" style="background-color: rgb(185, 174, 174);padding:1rem">
        <div>
            <div>
                <h1 style="text-align: center;">${serviceProvider}</h1>
            </div>
            <div>
                <h2 style="text-align: center;">Hello ${refundTo}, Your Subscription named: ${serviceName} has been cancelled at${new Date()}</h2>
            </div>
        </div>
    </div>

`