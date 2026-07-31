import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";

import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import authRouter from "./routes/authRoutes.js";
import productRouter from "./routes/productRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import docsRouter from "./routes/docsRoutes.js";
import { healthCheck } from "./controllers/healthController.js";

config({ path: "./config/config.env" });

import { env, envNum } from "./utils/env.js";

cloudinary.config({
  cloud_name: env("CLOUDINARY_CLIENT_NAME"),
  api_key:    env("CLOUDINARY_CLIENT_API"),
  api_secret: env("CLOUDINARY_CLIENT_SECRET"),
});

const app = express();

const frontendUrl = process.env.FRONTEND_URL || "https://shop-mate-six-azure.vercel.app";
const dashboardUrl = process.env.DASHBOARD_URL || "https://shop-dashboard-tan.vercel.app";
const allowedOrigins = [
  frontendUrl,
  dashboardUrl,
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use("/api/v1/payment", paymentRouter);

app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/", limits: { fileSize: 10 * 1024 * 1024 }, abortOnLimit: true }));

app.get("/api/v1/health", healthCheck);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/docs", docsRouter);

app.use(errorMiddleware);

export default app;












