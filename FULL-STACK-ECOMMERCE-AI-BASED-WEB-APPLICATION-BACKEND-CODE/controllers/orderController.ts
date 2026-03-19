import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { database } from "../database/db.js";
import { generatePaymentIntent } from "../utils/generatePaymentIntent.js";
import { ICartItem } from "../types/index.js";

export const placeNewOrder = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { full_name, state, city, country, address, pincode, phone, orderedItems } =
      req.body as {
        full_name: string; state: string; city: string; country: string;
        address: string; pincode: string; phone: string;
        orderedItems: ICartItem[] | string;
      };

    if (!full_name || !state || !city || !country || !address || !pincode || !phone)
      return next(new ErrorHandler("Please provide complete shipping details.", 400));

    const items: ICartItem[] = Array.isArray(orderedItems)
      ? orderedItems
      : JSON.parse(orderedItems as string);

    if (!items || items.length === 0)
      return next(new ErrorHandler("No items in cart.", 400));

    const productIds = items.map((item) => item.product.id);
    const { rows: products } = await database.query<{
      id: string; price: number; stock: number; name: string;
    }>(`SELECT id, price, stock, name FROM products WHERE id = ANY($1::uuid[])`, [productIds]);

    let total_price = 0;
    const values: (string | number | null)[] = [];
    const placeholders: string[] = [];

    items.forEach((item, index) => {
      const product = products.find((p) => p.id === item.product.id);
      if (!product) {
        next(new ErrorHandler(`Product not found for ID: ${item.product.id}`, 404));
        return;
      }
      if (item.quantity > product.stock) {
        next(new ErrorHandler(`Only ${product.stock} units available for ${product.name}`, 400));
        return;
      }
      total_price += product.price * item.quantity;
      values.push(null, product.id, item.quantity, product.price, item.product.images[0]?.url ?? "", product.name);
      const offset = index * 6;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`
      );
    });

    const tax_price = 0.18;
    const shipping_price = total_price >= 50 ? 0 : 2;
    total_price = Math.round(total_price + total_price * tax_price + shipping_price);

    const orderResult = await database.query<{ id: string }>(
      `INSERT INTO orders (buyer_id, total_price, tax_price, shipping_price) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, total_price, tax_price, shipping_price]
    );
    const orderId = orderResult.rows[0].id;

    for (let i = 0; i < values.length; i += 6) values[i] = orderId;

    await database.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price, image, title) VALUES ${placeholders.join(", ")} RETURNING *`,
      values
    );
    await database.query(
      `INSERT INTO shipping_info (order_id, full_name, state, city, country, address, pincode, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [orderId, full_name, state, city, country, address, pincode, phone]
    );

    const paymentResponse = await generatePaymentIntent(orderId, total_price);
    if (!paymentResponse.success)
      return next(new ErrorHandler("Payment failed. Try again.", 500));

    res.status(200).json({
      success: true, message: "Order placed successfully. Please proceed to payment.",
      orderId, paymentIntent: paymentResponse.clientSecret, total_price,
    });
  }
);

export const fetchSingleOrder = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { orderId } = req.params;
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
    res.status(200).json({ success: true, message: "Order fetched.", orders: result.rows[0] });
  }
);

export const fetchMyOrders = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await database.query(
      `SELECT o.*,
        COALESCE(json_agg(json_build_object(
          'order_item_id', oi.id, 'order_id', oi.order_id, 'product_id', oi.product_id,
          'quantity', oi.quantity, 'price', oi.price, 'image', oi.image, 'title', oi.title
        )) FILTER (WHERE oi.id IS NOT NULL), '[]') AS order_items,
        json_build_object(
          'full_name', s.full_name, 'state', s.state, 'city', s.city,
          'country', s.country, 'address', s.address, 'pincode', s.pincode, 'phone', s.phone
        ) AS shipping_info
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN shipping_info s ON o.id = s.order_id
       WHERE o.buyer_id = $1 GROUP BY o.id, s.id ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, message: "All your orders are fetched.", myOrders: result.rows });
  }
);

export const fetchAllOrders = catchAsyncErrors(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await database.query(
      `SELECT o.*,
        COALESCE(json_agg(json_build_object(
          'order_item_id', oi.id, 'order_id', oi.order_id, 'product_id', oi.product_id,
          'quantity', oi.quantity, 'price', oi.price, 'image', oi.image, 'title', oi.title
        )) FILTER (WHERE oi.id IS NOT NULL), '[]') AS order_items,
        json_build_object(
          'full_name', s.full_name, 'state', s.state, 'city', s.city,
          'country', s.country, 'address', s.address, 'pincode', s.pincode, 'phone', s.phone
        ) AS shipping_info
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN shipping_info s ON o.id = s.order_id
       GROUP BY o.id, s.id ORDER BY o.created_at DESC`
    );
    res.status(200).json({ success: true, message: "All orders fetched.", orders: result.rows });
  }
);

export const updateOrderStatus = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { status } = req.body as { status: string };
    const { orderId } = req.params;
    if (!status) return next(new ErrorHandler("Provide a valid status for order.", 400));
    const results = await database.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    if (results.rows.length === 0) return next(new ErrorHandler("Invalid order ID.", 404));
    const updatedOrder = await database.query(
      `UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *`, [status, orderId]
    );
    res.status(200).json({ success: true, message: "Order status updated.", updatedOrder: updatedOrder.rows[0] });
  }
);

export const deleteOrder = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { orderId } = req.params;
    const results = await database.query(`DELETE FROM orders WHERE id = $1 RETURNING *`, [orderId]);
    if (results.rows.length === 0) return next(new ErrorHandler("Invalid order ID.", 404));
    res.status(200).json({ success: true, message: "Order deleted.", order: results.rows[0] });
  }
);
