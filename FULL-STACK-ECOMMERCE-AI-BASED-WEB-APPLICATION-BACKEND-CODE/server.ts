import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import { connectDB } from "./database/db.js";
import app from "./app.js";
import { v2 as cloudinary } from "cloudinary";
import { createTables } from "./utils/createTables.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

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
