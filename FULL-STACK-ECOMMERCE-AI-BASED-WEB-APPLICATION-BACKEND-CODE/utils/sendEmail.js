import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  // Convert port to number (fix #1)
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT), // Must be a number!
    secure: true, // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    // Add TLS options for Gmail compatibility (fix #2)
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: message,
  };

  // Add error handling with more details (fix #3)
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error; // Re-throw so controller can catch it
  }
};