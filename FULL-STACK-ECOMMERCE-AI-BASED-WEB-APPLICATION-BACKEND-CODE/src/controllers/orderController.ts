import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import {
  cancelOrderInDb,
  createPaymentIntent,
  deleteOrderFromDb,
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  placeOrder,
  updateOrderStatusInDb,
} from "../services/orderService.js";
import { ICartItem } from "../types/index.js";

export const placeNewOrder = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { full_name, state, city, country, address, pincode, phone, orderedItems } =
      req.body as {
        full_name: string;
        state: string;
        city: string;
        country: string;
        address: string;
        pincode: string;
        phone: string;
        orderedItems: ICartItem[] | string;
      };

    const items: ICartItem[] = Array.isArray(orderedItems)
      ? orderedItems
      : JSON.parse(orderedItems as string);

    const { orderId, totalPrice } = await placeOrder(
      req.user.id,
      { full_name, state, city, country, address, pincode, phone },
      items
    );

    const paymentResponse = await createPaymentIntent(orderId, totalPrice);
    if (!paymentResponse.success) {
      return next(new ErrorHandler("Payment failed. Try again.", 500));
    }

    res.status(200).json({
      success: true,
      message: "Order placed successfully. Please proceed to payment.",
      orderId,
      paymentIntent: paymentResponse.clientSecret,
      total_price: totalPrice,
    });
  }
);

export const fetchSingleOrder = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { orderId } = req.params as { orderId: string };
    const order = await getSingleOrder(orderId);
    res.status(200).json({ success: true, message: "Order fetched.", orders: order });
  }
);

export const fetchMyOrders = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const orders = await getMyOrders(req.user.id);
    res.status(200).json({ success: true, message: "All your orders are fetched.", myOrders: orders });
  }
);

export const fetchAllOrders = catchAsyncErrors(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const orders = await getAllOrders();
    res.status(200).json({ success: true, message: "All orders fetched.", orders });
  }
);

export const updateOrderStatus = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { status } = req.body as { status: string };
    const { orderId } = req.params as { orderId: string };
    const updatedOrder = await updateOrderStatusInDb(orderId, status);
    res
      .status(200)
      .json({ success: true, message: "Order status updated.", updatedOrder });
  }
);

export const cancelOrder = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { orderId } = req.params as { orderId: string };
    const updatedOrder = await cancelOrderInDb(orderId, req.user.id);
    res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully.", updatedOrder });
  }
);

export const deleteOrder = catchAsyncErrors(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { orderId } = req.params as { orderId: string };
    const order = await deleteOrderFromDb(orderId);
    res.status(200).json({ success: true, message: "Order deleted.", order });
  }
);
