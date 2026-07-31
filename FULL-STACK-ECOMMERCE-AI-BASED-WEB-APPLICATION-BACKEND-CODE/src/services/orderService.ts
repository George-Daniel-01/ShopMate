import { database } from "../database/db.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { generatePaymentIntent } from "../utils/generatePaymentIntent.js";
import { ICartItem } from "../types/index.js";

const TAX_RATE = 0.18;
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 2;

export interface ShippingDetails {
  full_name: string;
  state: string;
  city: string;
  country: string;
  address: string;
  pincode: string;
  phone: string;
}

export const placeOrder = async (
  userId: string,
  shipping: ShippingDetails,
  items: ICartItem[]
): Promise<{ orderId: string; totalPrice: number }> => {
  if (!items || items.length === 0) throw new ErrorHandler("No items in cart.", 400);

  const productIds = items.map((item) => item.product.id);
  const { rows: products } = await database.query<{
    id: string;
    price: number;
    stock: number;
    name: string;
  }>(`SELECT id, price, stock, name FROM products WHERE id = ANY($1::uuid[])`, [productIds]);

  let total_price = 0;
  const values: (string | number | null)[] = [];
  const placeholders: string[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.product.id);
    if (!product) {
      throw new ErrorHandler(`Product not found for ID: ${item.product.id}`, 404);
    }
    if (item.quantity > product.stock) {
      throw new ErrorHandler(`Only ${product.stock} units available for ${product.name}`, 400);
    }
    total_price += product.price * item.quantity;
  }

  const taxAmount = Math.round(total_price * TAX_RATE);
  const shippingPrice = total_price >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const finalTotal = Math.round(total_price + taxAmount + shippingPrice);

  const client = await database.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query<{ id: string }>(
      `INSERT INTO orders (buyer_id, total_price, tax_price, shipping_price) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, finalTotal, taxAmount, shippingPrice]
    );
    const orderId = orderResult.rows[0].id;

    for (const [index, item] of items.entries()) {
      const product = products.find((p) => p.id === item.product.id)!;
      values.push(
        orderId,
        product.id,
        item.quantity,
        product.price,
        item.product.images[0]?.url ?? "",
        product.name
      );
      const offset = index * 6;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`
      );
    }

    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price, image, title) VALUES ${placeholders.join(", ")}`,
      values
    );
    await client.query(
      `INSERT INTO shipping_info (order_id, full_name, state, city, country, address, pincode, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [orderId, shipping.full_name, shipping.state, shipping.city, shipping.country, shipping.address, shipping.pincode, shipping.phone]
    );

    await client.query("COMMIT");
    return { orderId, totalPrice: finalTotal };
  } catch (error) {
    await client.query("ROLLBACK");
    throw new ErrorHandler("Failed to place order. Please try again.", 500);
  } finally {
    client.release();
  }
};

export const createPaymentIntent = async (orderId: string, totalPrice: number) => {
  return generatePaymentIntent(orderId, totalPrice);
};

const ORDER_SELECT = `SELECT o.*,
  COALESCE(json_agg(json_build_object(
    'order_item_id', oi.id, 'order_id', oi.order_id, 'product_id', oi.product_id,
    'quantity', oi.quantity, 'price', oi.price, 'image', oi.image, 'title', oi.title
  )) FILTER (WHERE oi.id IS NOT NULL), '[]') AS order_items,
  json_build_object(
    'full_name', s.full_name, 'state', s.state, 'city', s.city,
    'country', s.country, 'address', s.address, 'pincode', s.pincode, 'phone', s.phone
  ) AS shipping_info`;

export const getSingleOrder = async (orderId: string) => {
  const result = await database.query(
    `SELECT o.*,
      COALESCE(json_agg(json_build_object(
        'order_item_id', oi.id, 'order_id', oi.order_id,
        'product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price
      )) FILTER (WHERE oi.id IS NOT NULL), '[]') AS order_items,
      json_build_object(
        'full_name', s.full_name, 'state', s.state, 'city', s.city,
        'country', s.country, 'address', s.address, 'pincode', s.pincode, 'phone', s.phone
      ) AS shipping_info
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN shipping_info s ON o.id = s.order_id
     WHERE o.id = $1 GROUP BY o.id, s.id;`,
    [orderId]
  );
  if (!result.rows[0]) throw new ErrorHandler("Order not found.", 404);
  return result.rows[0];
};

export const getMyOrders = async (userId: string) => {
  const result = await database.query(
    `${ORDER_SELECT}
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN shipping_info s ON o.id = s.order_id
     WHERE o.buyer_id = $1 GROUP BY o.id, s.id ORDER BY o.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const getAllOrders = async () => {
  const result = await database.query(
    `${ORDER_SELECT}
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN shipping_info s ON o.id = s.order_id
     GROUP BY o.id, s.id ORDER BY o.created_at DESC`
  );
  return result.rows;
};

export const updateOrderStatusInDb = async (
  orderId: string,
  status: string
): Promise<unknown> => {
  const results = await database.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
  if (results.rows.length === 0) throw new ErrorHandler("Invalid order ID.", 404);
  const updatedOrder = await database.query(
    `UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return updatedOrder.rows[0];
};

export const cancelOrderInDb = async (orderId: string, userId: string): Promise<unknown> => {
  const results = await database.query(
    `SELECT * FROM orders WHERE id = $1 AND buyer_id = $2`,
    [orderId, userId]
  );
  if (results.rows.length === 0) throw new ErrorHandler("Order not found.", 404);
  if (results.rows[0].order_status !== "Processing")
    throw new ErrorHandler("Only orders in Processing status can be cancelled.", 400);
  const cancelled = await database.query(
    `UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *`,
    ["Cancelled", orderId]
  );
  return cancelled.rows[0];
};

export const deleteOrderFromDb = async (orderId: string): Promise<unknown> => {
  const results = await database.query(`DELETE FROM orders WHERE id = $1 RETURNING *`, [orderId]);
  if (results.rows.length === 0) throw new ErrorHandler("Invalid order ID.", 404);
  return results.rows[0];
};
