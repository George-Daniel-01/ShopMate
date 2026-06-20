import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import { connectDB } from "./database/db.js";
import app from "./app.js";
import { createTables } from "./utils/createTables.js";

const requiredEnvVars = [
  "DATABASE_URL", "JWT_SECRET_KEY", "JWT_EXPIRES_IN", "COOKIE_EXPIRES_IN",
  "CLOUDINARY_CLIENT_NAME", "CLOUDINARY_CLIENT_API", "CLOUDINARY_CLIENT_SECRET",
  "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET",
  "SMTP_HOST", "SMTP_MAIL", "SMTP_PASSWORD",
  "OPENROUTER_API_KEY",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    if (process.env.VERCEL !== "1") process.exit(1);
  }
}

// Only listen when running locally, NOT on Vercel
if (process.env.VERCEL !== "1") {
  const start = async (): Promise<void> => {
    await connectDB();
    await createTables();
    app.listen(process.env.PORT || 4000, () => {
      console.log("Server running on port " + (process.env.PORT || 4000));
    });
  };
  start();
} else {
  // On Vercel: init DB and tables without listening
  connectDB().then(() => createTables());
}

export default app;



