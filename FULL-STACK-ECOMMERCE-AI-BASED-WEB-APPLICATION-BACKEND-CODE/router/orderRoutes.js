import express from "express";
import {
  fetchSingleOrder,
  placeNewOrder,
  fetchMyOrders,
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import {
  isAuthenticated,
  authorizedRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/new", isAuthenticated, placeNewOrder);

// ✅ FIX 1: /orders/me MUST come BEFORE /:orderId
// Otherwise Express matches "orders" as the orderId param and never reaches this route
router.get("/orders/me", isAuthenticated, fetchMyOrders);

router.get("/:orderId", isAuthenticated, fetchSingleOrder);
router.get(
  "/admin/getall",
  isAuthenticated,
  authorizedRoles("Admin"),
  fetchAllOrders
);
router.put(
  "/admin/update/:orderId",
  isAuthenticated,
  authorizedRoles("Admin"),
  updateOrderStatus
);
router.delete(
  "/admin/delete/:orderId",
  isAuthenticated,
  authorizedRoles("Admin"),
  deleteOrder
);

export default router;
