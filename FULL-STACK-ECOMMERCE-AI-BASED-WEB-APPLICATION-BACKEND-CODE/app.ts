import express, { Request, Response } from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";

import Stripe from "stripe";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import authRouter from "./router/authRoutes.js";
import productRouter from "./router/productRoutes.js";
import adminRouter from "./router/adminRoutes.js";
import orderRouter from "./router/orderRoutes.js";
import { database } from "./database/db.js";

config({ path: "./config/config.env" });


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key:    process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

const app = express();

const allowedOrigins = [
  "https://shop-mate-six-azure.vercel.app",
  "https://shop-dashboard-tan.vercel.app",
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


app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = Stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${(error as Error).message}`);
      return;
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const clientSecret = paymentIntent.client_secret;

      try {
        const paymentResult = await database.query(
          `UPDATE payments SET payment_status = $1 WHERE payment_intent_id = $2 RETURNING *`,
          ["Paid", clientSecret]
        );
        const orderId = paymentResult.rows[0].order_id as string;

        await database.query(
          `UPDATE orders SET paid_at = NOW() WHERE id = $1`,
          [orderId]
        );

        const { rows: orderedItems } = await database.query<{ product_id: string; quantity: number }>(
          `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
          [orderId]
        );

        for (const item of orderedItems) {
          await database.query(
            `UPDATE products SET stock = stock - $1 WHERE id = $2`,
            [item.quantity, item.product_id]
          );
        }
      } catch {
        res.status(500).send("Error updating payment/order records.");
        return;
      }
    }

    res.status(200).send({ received: true });
  }
);

app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: os.tmpdir(),
}));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/order", orderRouter);

app.use(errorMiddleware);

export default app;


