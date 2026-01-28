import { emailTemplates } from "./email-template.js";
import dayjs from "dayjs";
import { accountMail, transporter } from "../nodemailer/nodemailer.js";


export const sendReminderEmail = async({to,type,subscription})=>{

    if(!to || !type) throw new Error("Missing required parameters");

    const template = emailTemplates.find((t)=> t.label === type);

    if(!template) throw new Error("Invalid email type");

    const mailInfo = {
        userName:subscription.user.name,
        subscriptionName:subscription.name,
        renewalsDate:dayjs(subscription.renewalsDate).format("DD/MM/YYYY"),
        planName:subscription.frequency,
        price:`${subscription.currency} ${subscription.price} (${subscription.frequency})`,
        paymentMethod:subscription.paymentMethod,
    };

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    const mailOptions = {
        from:accountMail,
        to:to,
        subject:subject,
        html:message,
    };

    transporter.sendMail(mailOptions,(error,info)=>{
        if(error)return console.log(error, 'Error sending email');

        console.log('Email send: '+ info.response)
    })
}