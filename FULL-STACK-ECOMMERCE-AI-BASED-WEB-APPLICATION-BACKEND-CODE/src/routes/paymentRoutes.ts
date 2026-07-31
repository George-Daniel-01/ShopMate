import express from "express";
import { handleStripeWebhook } from "../controllers/paymentController.js";

const router = express.Router();

// Registered before express.json() in app.ts so the raw body is preserved.
router.post("/webhook", handleStripeWebhook);

export default router;
