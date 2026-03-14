import nodemailer from "nodemailer";




export const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'tre.reichel91@ethereal.email',
      pass: 'P9g77BtfZt496JsqPZ'
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"ISMO Digital" <noreply@ismo-digital.ofppt.ma>',
      to,
      subject,
      html,
    });
    console.log("Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
   
  }
};
