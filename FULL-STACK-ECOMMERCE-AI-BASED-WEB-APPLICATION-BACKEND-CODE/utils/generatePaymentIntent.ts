import { database } from "../database/db.js";
import Stripe from "stripe";
import { IPaymentResult } from "../types/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function generatePaymentIntent(
  orderId: string,
  totalPrice: number
): Promise<IPaymentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100,
      currency: "usd",
    });

    await database.query(
      "INSERT INTO payments (order_id, payment_type, payment_status, payment_intent_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [orderId, "Online", "Pending", paymentIntent.client_secret]
    );

    return {
      success: true,
      clientSecret: paymentIntent.client_secret ?? undefined,
    };
  } catch (error) {
    console.error("Payment Error:", (error as Error).message ?? error);
    return { success: false, message: "Payment Failed." };
  }
}
