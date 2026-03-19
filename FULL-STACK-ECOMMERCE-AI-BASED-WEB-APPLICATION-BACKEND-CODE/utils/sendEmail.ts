import nodeMailer, { SentMessageInfo } from "nodemailer";

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
    host: process.env.SMTP_HOST as string,
    port: parseInt(process.env.SMTP_PORT as string),
    secure: true,
    auth: {
      user: process.env.SMTP_MAIL as string,
      pass: process.env.SMTP_PASSWORD as string,
    },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL as string,
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
