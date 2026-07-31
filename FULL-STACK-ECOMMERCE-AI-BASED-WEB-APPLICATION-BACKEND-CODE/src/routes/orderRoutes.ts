import express from "express";
import {
  cancelOrder,
  deleteOrder,
  fetchAllOrders,
  fetchMyOrders,
  fetchSingleOrder,
  placeNewOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authorizedRoles, isAuthenticated } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { orderSchema, orderStatusSchema } from "../validations/index.js";

const router = express.Router();

router.post("/new", isAuthenticated, validate(orderSchema), placeNewOrder);
router.get("/orders/me", isAuthenticated, fetchMyOrders);
router.get("/admin/getall", isAuthenticated, authorizedRoles("ADMIN"), fetchAllOrders);
router.put("/cancel/:orderId", isAuthenticated, cancelOrder);
router.put(
  "/admin/update/:orderId",
  isAuthenticated,
  authorizedRoles("ADMIN"),
  validate(orderStatusSchema),
  updateOrderStatus
);
router.delete("/admin/delete/:orderId", isAuthenticated, authorizedRoles("ADMIN"), deleteOrder);
router.get("/:orderId", isAuthenticated, fetchSingleOrder);

export default router;
