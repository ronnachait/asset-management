import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "notifysatt@gmail.com", // อีเมลผู้ส่ง
    pass: process.env.GMAIL_APP_PASSWORD, // App Password ที่ได้มา ใส่ใน .env
  },
});

export async function sendGmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: '"AMIS แจ้งเตือน" <notifysatt@gmail.com>',
    to,
    subject,
    html,
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}
