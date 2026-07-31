/**
 * Centralized application configuration.
 * Keep environment-specific values (like API URLs) here so the rest of the
 * codebase never hardcodes them.
 */
export const APP_NAME = "ShopMate";

export const API_BASE_URL = "https://shop-mate-backend.vercel.app/api/v1";

/** Orders with a subtotal at or above this amount ship for free. */
export const FREE_SHIPPING_THRESHOLD = 50;

/** Flat shipping fee applied below the free-shipping threshold. */
export const SHIPPING_FEE = 2;

/** Sales tax rate applied to every order (18%). */
export const TAX_RATE = 0.18;
