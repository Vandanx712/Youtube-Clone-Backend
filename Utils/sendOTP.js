import nodemailer from 'nodemailer'

const sendOTP = async (email,otp) => {
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
            user: process.env.SENDER_MAIL,
            pass: process.env.SENDER_MAIL_PASSWORD
        }
    })

    const mailoptions = {
        from: process.env.SENDER_MAIL,
        to: email,
        subject: 'your otp code ',
        text: String(otp)
    }

    await transporter.sendMail(mailoptions)
}

export default sendOTP