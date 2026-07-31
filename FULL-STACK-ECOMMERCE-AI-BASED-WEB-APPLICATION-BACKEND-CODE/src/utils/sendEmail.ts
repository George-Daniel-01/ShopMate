import nodeMailer, { SentMessageInfo } from "nodemailer";
import { env, envNum } from "./env.js";

interface SendEmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async ({
  email,
  subject,
  message,
}: SendEmailOptions): Promise<SentMessageInfo> => {
  const transporter = nodeMailer.createTransport({
    host: env("SMTP_HOST"),
    port: envNum("SMTP_PORT"),
    secure: true,
    auth: {
      user: env("SMTP_MAIL"),
      pass: env("SMTP_PASSWORD"),
    },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: env("SMTP_MAIL"),
    to: email,
    subject,
    html: message,
  };

  try {
    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
