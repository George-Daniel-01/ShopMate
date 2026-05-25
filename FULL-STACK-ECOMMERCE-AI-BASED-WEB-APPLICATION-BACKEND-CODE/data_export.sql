--
-- PostgreSQL database dump
--

\restrict a1ARknMTf3mBIcJmzgB43J8S02m3FqsuJR3yPQ3ijiIDXNAfjFnsWyKjNh80ZiB

-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, avatar, reset_password_token, reset_password_expire, created_at) FROM stdin;
f24b7338-204c-41c6-9d08-92b3d4daa0aa	Daniel	georgeabiamakadaniel@gmail.com	$2b$10$1wUjI05Ev7fwU0i.wTIF0ezCjixVxFENc61x4oBqdAf2noEm4eYu6	User	\N	04b1c77a26ad321f416c587f3efc180f1c20f5cc9903b5880c0386aae5f21813	2026-05-16 21:04:39.755	2026-05-15 14:19:52.621947
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, buyer_id, total_price, tax_price, shipping_price, order_status, paid_at, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, category, ratings, images, stock, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, price, image, title, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, payment_type, payment_status, payment_intent_id, created_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, product_id, user_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: shipping_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_info (id, order_id, full_name, state, city, country, address, pincode, phone) FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

\unrestrict a1ARknMTf3mBIcJmzgB43J8S02m3FqsuJR3yPQ3ijiIDXNAfjFnsWyKjNh80ZiB

