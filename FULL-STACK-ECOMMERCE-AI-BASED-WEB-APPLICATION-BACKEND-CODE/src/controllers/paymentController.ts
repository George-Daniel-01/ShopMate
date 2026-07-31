import { Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../utils/env.js";
import { processPaymentIntentSucceeded } from "../services/paymentService.js";

/** Collects the raw request body when express.json() is disabled for this route. */
const collectRawBody = (req: Request): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

/**
 * Stripe webhook handler. Registered before express.json() so the raw body is
 * available for signature verification. Updates payment + order records when a
 * payment intent succeeds.
 */
export const handleStripeWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sig = req.headers["stripe-signature"];
  if (!sig) {
    res.status(400).send("Webhook Error: No stripe-signature header.");
    return;
  }

  let payload: Buffer;
  if (Buffer.isBuffer(req.body) && req.body.length > 0) {
    payload = req.body;
  } else {
    try {
      payload = await collectRawBody(req);
    } catch {
      res.status(400).send("Webhook Error: Could not read payload.");
      return;
    }
  }

  if (payload.length === 0) {
    res.status(400).send("Webhook Error: Empty payload.");
    return;
  }

  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(payload, sig, env("STRIPE_WEBHOOK_SECRET"));
  } catch (error) {
    res.status(400).send(`Webhook Error: ${(error as Error).message}`);
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    try {
      await processPaymentIntentSucceeded(paymentIntent.client_secret ?? "");
    } catch {
      res.status(500).send("Error updating payment/order records.");
      return;
    }
  }

  res.status(200).send({ received: true });
};
