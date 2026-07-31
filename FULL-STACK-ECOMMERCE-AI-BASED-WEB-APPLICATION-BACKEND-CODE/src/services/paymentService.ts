import { database } from "../database/db.js";

/**
 * Marks a Stripe payment as paid, stamps the order with a paid_at timestamp,
 * and decrements stock for every item in the order. Runs inside the
 * payment_intent.succeeded webhook handler.
 */
export const processPaymentIntentSucceeded = async (
  clientSecret: string
): Promise<void> => {
  const paymentResult = await database.query<{ order_id: string }>(
    `UPDATE payments SET payment_status = $1 WHERE payment_intent_id = $2 RETURNING *`,
    ["Paid", clientSecret]
  );
  if (paymentResult.rows.length === 0) {
    throw new Error("Payment not found for this payment intent.");
  }
  const orderId = paymentResult.rows[0].order_id as string;

  await database.query(`UPDATE orders SET paid_at = NOW() WHERE id = $1`, [orderId]);

  const { rows: orderedItems } = await database.query<{
    product_id: string;
    quantity: number;
  }>(`SELECT product_id, quantity FROM order_items WHERE order_id = $1`, [orderId]);

  for (const item of orderedItems) {
    await database.query(
      `UPDATE products SET stock = stock - $1 WHERE id = $2`,
      [item.quantity, item.product_id]
    );
  }
};
