import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import { connectDB } from "./database/db.js";
import app from "./app.js";
import { v2 as cloudinary } from "cloudinary";
import { createTables } from "./utils/createTables.js";

const start = async (): Promise<void> => {
  await connectDB();
  await createTables();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
  });

  app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
  });
};

start();

export default app;
