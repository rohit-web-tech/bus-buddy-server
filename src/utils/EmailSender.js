import nodemailer from "nodemailer";

// creating a transpoter for nodemailer

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 465,
    secure : false ,
    auth: {
        user: process.env.EMAIL_TRAP_ID,
        pass:process.env.EMAIL_TRAP_PASSWORD,
    },
});

// email sending function 
const emailSender = async (sendTo, subject, content) => {
    //sending email
    const info = await transporter.sendMail({
        from: process.env.MY_EMAIL, // sender address
        to: sendTo, // list of receivers
        subject: subject, // Subject line
        html: content, // html body
    });

    console.log("Message sent: %s", info.messageId);
}


//creating profile verification email
const sendProfileVerificationEmail = async (sendTo,name,verificationToken) => {
    const subject = "Verification email from bus buddy!!";
    const content = `
    <p>Hi ${name},<br><br>Thanks for registering on BusBuddy . Please verify your email id by clicking on following link to complete verification process : <a href="${process.env.CLIENT_URL}/verifyEmail?${verificationToken}">${process.env.CLIENT_URL}/verifyEmail?${verificationToken}</a><br><br><b>Note : Link is valid for only 2 hours!!`
    return emailSender(sendTo,subject,content)
}

//creating profile verification email
const sendForgetPasswordEmail = async (sendTo,name,verificationToken) => {
    const subject = "Reset password email from chit chat!!";
    const content = `
    <p>Hi ${name},<br><br>Here is your link to reset you password. You can change you password by clicking on following link : <a href="${process.env.CLIENT_URL}/forgotPassword?${verificationToken}">${process.env.CLIENT_URL}/forgotPassword?${verificationToken}</a><br><br><b>Note : Link is valid for only 2 hours!!`
    return emailSender(sendTo,subject,content)
}

export {
    emailSender,
    sendProfileVerificationEmail,
    sendForgetPasswordEmail
};