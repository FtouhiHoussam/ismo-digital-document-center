import nodemailer from "nodemailer";

// Using Ethereal Email for testing purposes.
// This is a fake SMTP service. You can see the emails on ethereal.email.
// To use a real email (like Gmail), replace these credentials with an app password.
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
    // Don't throw, we don't want to crash the app if email fails
  }
};
