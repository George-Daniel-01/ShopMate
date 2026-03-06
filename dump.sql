--
-- PostgreSQL database dump
--

\restrict 40paPaxyBUyRfJLv0zLKxXgtBEZZgrfcGSccHsTRaB6HeuCCz8LAuXBhgHlbngY

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    image text NOT NULL,
    title text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_items_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    buyer_id uuid NOT NULL,
    total_price numeric(10,2) NOT NULL,
    tax_price numeric(10,2) DEFAULT 0 NOT NULL,
    shipping_price numeric(10,2) DEFAULT 0 NOT NULL,
    order_status character varying(20) DEFAULT 'Processing'::character varying,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_order_status_check CHECK (((order_status)::text = ANY ((ARRAY['Processing'::character varying, 'Shipped'::character varying, 'Delivered'::character varying, 'Cancelled'::character varying])::text[]))),
    CONSTRAINT orders_total_price_check CHECK ((total_price >= (0)::numeric))
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    payment_type character varying(20) NOT NULL,
    payment_status character varying(20) NOT NULL,
    payment_intent_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['Paid'::character varying, 'Pending'::character varying, 'Failed'::character varying])::text[]))),
    CONSTRAINT payments_payment_type_check CHECK (((payment_type)::text = 'Online'::text))
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    price numeric(7,2) NOT NULL,
    category character varying(100) NOT NULL,
    ratings numeric(3,2) DEFAULT 0,
    images jsonb DEFAULT '[]'::jsonb,
    stock integer NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT products_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT products_ratings_check CHECK (((ratings >= (0)::numeric) AND (ratings <= (5)::numeric))),
    CONSTRAINT products_stock_check CHECK ((stock >= 0))
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating numeric(3,2) NOT NULL,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric)))
);


--
-- Name: shipping_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_info (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    full_name character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    city character varying(100) NOT NULL,
    country character varying(100) NOT NULL,
    address text NOT NULL,
    pincode character varying(10) NOT NULL,
    phone character varying(20) NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    role character varying(10) DEFAULT 'User'::character varying,
    avatar jsonb,
    reset_password_token text,
    reset_password_expire timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_name_check CHECK ((char_length((name)::text) >= 3)),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['User'::character varying, 'Admin'::character varying])::text[])))
);


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, quantity, price, image, title, created_at) FROM stdin;
034ac35e-4900-4bcc-a03a-d58e6c568078	4a755818-348b-48c0-8bbc-3d5beb4d217b	606176c4-4e74-4041-a6cc-8c1b62e82640	2	1590.11	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-02-23 05:04:38.643569
48b5f22d-325a-4ba8-a3b7-57ac1384b7d0	b80b7d58-6cea-4d84-8f6c-bdbc34e4b299	606176c4-4e74-4041-a6cc-8c1b62e82640	4	1590.11	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-02-23 05:57:31.677762
f02ba028-2a5b-46b3-a1da-6d143ccb66dc	d14e99ef-3281-4d33-9e4e-f9e26d3b499d	abdbb7d3-d2fd-4f79-9bec-2b1743175572	2	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-02-25 07:05:18.196581
42375e90-dd0a-4378-8534-c38e3eeceb13	8b50f68c-e491-420b-a4c2-95659f88fb9b	abdbb7d3-d2fd-4f79-9bec-2b1743175572	7	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-02-25 10:00:13.967298
265b5f6f-c00d-46eb-9de6-c0648b50d2be	fb32dc9a-c032-460a-9b62-aa08cd5e7f4b	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 05:48:25.768894
bb4e891e-4917-4be1-9f50-e08370bc1a26	119ee020-9edc-492a-90f3-533663931c83	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 05:48:28.95827
6b1f8c32-2595-455d-a23d-0042b152df4e	5039c6cd-7fa1-46b2-bd0d-2d4124e58054	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 05:48:30.920425
61117f58-1ed9-4882-b60e-2dca61fb5ebb	71b21b47-cf11-4664-a88e-e0788a1007d2	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 05:48:31.601195
5fbe3740-c790-433c-b071-611e78074ccb	de762603-5d27-429d-aefa-a43ceab0d9bd	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:53:00.62618
95a38136-9569-4ceb-b24d-696991446f9c	03a14248-b1f4-4c63-a4f0-9f71da590d8d	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:53:38.420104
71fd7e3d-b54b-4af7-b34c-44abfb6a08c5	27186347-5d61-4eed-a2c3-1141a9b0cdd1	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:53:42.028035
13d6f30e-c7a1-422d-8b94-3bb16d6b7857	5d7ffbcb-995f-41b3-9a26-c580cf63d635	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:53:44.362757
30b56059-acf0-4aa8-814b-97f6792a3413	a3f216cc-702b-494a-af68-f5fa06f0811b	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:53:45.744653
c9fc1617-7421-44b9-b241-55b5d3031cf9	f1d55873-71e4-4659-8386-7ab2804479b3	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:53:46.227362
86cc1ef8-5174-4a86-b562-5726f3e0c72d	5fe4ab11-14a5-4fdc-9804-8c7faba5e7fc	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:53:46.74494
ee909fac-a9ca-4153-abeb-1000e17a1282	7d664f66-3333-41ba-9b13-4002c93bd0cc	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:53:47.219619
7b942869-3ea4-4232-b8dd-5504624cc7d7	73edb2bb-514a-446a-b754-866ccdb4744a	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:53:47.777668
a8f45243-2020-4cd5-ba06-bdd03e91e0cd	397fb065-c5d6-4533-9702-0fb39e843d9a	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:53:48.257252
282886c7-fbdc-487f-862d-fa2044784ec7	d02048ed-e337-45f3-b7cb-da99c9d472e5	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:54:53.28041
43b27e43-3b78-4b89-8ec7-e297580b6b1a	96b317b2-04d0-4a51-8255-e8abb6815eeb	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:54:55.187339
e06774e6-4151-46ed-8462-f250d6067ce6	7bf805bd-1096-4996-b50e-70db8b0f9159	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:54:56.171748
e8c6706f-d5a5-4373-96c2-7e0937796fac	a870d816-8841-4e43-8022-43cf99d47cf6	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:54:57.400128
c7449248-5253-46c4-aaba-07e96b27c393	78b9dd61-003d-4f8e-a4d2-4a0fe3d67f52	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:54:58.28156
ecca62ca-e247-483f-b8ea-079da6f6d6e2	4ead3600-78ee-46f5-acd7-1fff0fbc563f	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:58:47.510476
2263d4a8-f08f-4635-86ab-4d2603cbdb73	0e017d2d-8857-4fd8-ae90-2b70a6a49edd	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:58:49.796402
45af2a23-e580-42f6-b808-9053c785de14	3e72abaf-a663-44c6-9ef3-2cb12d2d549c	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:58:50.292272
5f4f5f86-8922-4773-a470-be8edcdb20c1	fdf38932-95be-4d55-a123-18c3d220c456	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:58:50.755831
a7733cb5-6788-4f1b-ac24-4f742bda5dfc	19602fba-6687-43f7-be4a-a19f97a03c71	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-04 05:58:51.255808
bc0b3a6f-4a2d-4b0e-a1e1-a06998c8eac6	d6ee4b43-7ae5-49f0-8b9a-031f7e91a75e	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:19:55.500612
c9e613ce-03aa-4585-a0c5-a7d0715ff8b8	4c692795-c8d5-46ee-87f8-b17ea4082539	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:19:57.766485
026dd22c-1860-43f5-b2c1-eb19d550e144	68db74eb-97e0-45b3-b2d2-7821c473f610	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:19:58.263403
c35abf8b-bfe0-4496-9401-38a689d30f06	5b90dd9b-8a84-4b55-86dd-43c97a8b73a0	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:19:58.658497
f4e93c75-c4ce-4bb5-a29a-1318dcde0675	bd769497-144d-4fae-8803-5c19c7a13d71	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:19:59.179772
5ed612a1-f28a-434c-8747-4b3102d249b8	eba68680-0e35-4dbe-bda5-5c671b1a2c42	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:19:59.857955
d8c5d513-d0e6-4f62-af33-5abe4ba872c6	1e411f9c-0743-43e2-8cc8-baa1d66c1a86	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:20:00.393841
044cf2a2-5669-4cca-a2a3-51922cefc398	4837d12e-5bce-4a10-87c3-f3e9352aaa64	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:20:00.840748
9a21778f-e296-4bf7-9de5-758d86f3c94e	b8b6893e-40fb-44c3-91da-04ebeac69528	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:20:01.295627
9daf947b-e99f-4a1c-9cd8-34fd4e7d3e7f	20a7a99b-6759-4750-8bcd-1953fe307649	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:20:01.828044
b5c4e19d-f1a2-43d8-ac1d-7dfed0e40a82	e8b1415b-02bf-43d4-b982-7bda7cdcce7d	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:20:02.346338
d3552f1b-8ad7-4b45-8070-fa70f5e7c2ef	5d55abca-1d95-4cfa-bcc7-a7e3069a6a62	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:28:49.375929
767a852d-f028-4489-b3ea-aac588d0e827	96be889a-07d7-4390-a96a-5af4e72a8d8a	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:30:31.781379
2fc5434d-d6ec-4f15-822f-c1458c455d50	71b360a4-086d-4af2-9a55-fc67dc7a3b06	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:30:33.559527
9b5dffe4-b25d-4ab8-8758-746c1bbf2aea	bb55d68a-b74e-417f-9237-f23834a75c52	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:30:34.019225
aa6d39cd-c401-445b-95c8-40bdfbb366c6	5ca99e1b-fce9-4ede-8680-dc0aca3b1ea6	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:30:34.641586
d2f724c3-ba7f-4e5f-8249-c48c920e88b3	e0bb778f-7554-48c3-a581-7e880b6cc157	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:32:45.703342
4194ecf8-b20e-466d-ad94-d42c64a291f9	e058759a-3777-4c67-97d6-b1b7e55fbd71	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:34:08.447874
3a723175-a6c9-4592-af3c-b2f3a2a877c0	c183cc01-8dd0-4a3a-b086-4577e4d04de9	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:34:22.816351
83481f34-9d9d-4eca-ad7f-336206659c49	012d41c2-4ed4-477b-8212-41dd176a1062	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:34:24.731802
89e1f50d-d32f-49c0-9af4-9b41946f9dc6	c168eefa-971b-4555-b7cb-09e27ba475cb	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:41:37.888726
521b7b90-ec12-42d3-ac42-c988dc2cff6e	c4e1ceec-fe6e-4090-9738-202df242ab02	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:41:52.308176
05813240-9c94-40f2-ba5b-94c890c5b2da	9f523593-4bd9-4f7b-a488-abc71240ae52	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:42:44.87041
3fc3d0ea-f1fb-459f-9e64-bc2985ff67a1	27b06c0b-0201-4d00-8dee-f736d65d26d6	606176c4-4e74-4041-a6cc-8c1b62e82640	2	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-04 06:42:47.824532
c5999773-4545-4a90-9439-bcdd88e0555d	064832ab-41bf-4215-bc53-35214f8b6519	abdbb7d3-d2fd-4f79-9bec-2b1743175572	1	0.01	https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png	bf	2026-03-05 07:43:15.150956
faaa2626-c0d8-4d32-8841-872331d95f19	aae2788a-27a5-4c3b-be37-3c77cfc3c4e7	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-05 07:43:47.281416
0848a9c8-8ab8-46d7-bd00-a904af7ec299	c59e3f23-a475-4b3c-b60a-9caf9d707c00	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-05 07:44:27.988428
87220f06-77b9-4bcb-ba30-b12ee6150e5b	344592ca-ebca-46a8-b301-36bf81ddb9fe	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-05 07:49:49.284026
ec366031-d575-4d4f-a8d8-dae55d1ff6a8	58085010-41f4-4fc0-b738-46d3588e88e4	606176c4-4e74-4041-a6cc-8c1b62e82640	1	3.53	https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg	Samsung S25 Ultra	2026-03-05 07:51:50.176552
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, buyer_id, total_price, tax_price, shipping_price, order_status, paid_at, created_at) FROM stdin;
c406d9ba-f942-42c2-b8f3-4e5ce567a94b	9c7ddd92-c529-4fd1-80b0-907a89622445	1876.00	0.18	0.00	Processing	\N	2026-02-19 12:25:20.383795
43dd479c-6393-4cc2-b6fe-8bfe7db1f130	9c7ddd92-c529-4fd1-80b0-907a89622445	1876.00	0.18	0.00	Processing	\N	2026-02-19 12:26:56.409597
7976a77a-2237-42f6-9347-cf0e705e0742	9c7ddd92-c529-4fd1-80b0-907a89622445	1876.00	0.18	0.00	Processing	\N	2026-02-19 12:28:19.719333
4da8289b-1930-4ca9-9dc5-a09cb92b1729	9c7ddd92-c529-4fd1-80b0-907a89622445	1876.00	0.18	0.00	Processing	\N	2026-02-19 12:28:55.009184
c1398feb-3863-44bd-9d5d-196483a6cf31	9c7ddd92-c529-4fd1-80b0-907a89622445	2.00	0.18	2.00	Processing	\N	2026-02-19 12:29:46.467118
3d5ac4c5-7ab1-4ece-aac5-6fee7e8f0cc7	9c7ddd92-c529-4fd1-80b0-907a89622445	18763.00	0.18	0.00	Processing	\N	2026-02-19 12:29:58.689612
aae2788a-27a5-4c3b-be37-3c77cfc3c4e7	9c7ddd92-c529-4fd1-80b0-907a89622445	6.00	0.18	2.00	Processing	\N	2026-03-05 07:43:47.278955
4a755818-348b-48c0-8bbc-3d5beb4d217b	9c7ddd92-c529-4fd1-80b0-907a89622445	3753.00	0.18	0.00	Processing	\N	2026-02-23 05:04:38.622107
7e2ab3f0-ed77-448d-b8a3-2b5f6e33e5a8	9c7ddd92-c529-4fd1-80b0-907a89622445	1876.00	0.18	0.00	Processing	\N	2026-02-23 05:18:48.643491
b80b7d58-6cea-4d84-8f6c-bdbc34e4b299	9c7ddd92-c529-4fd1-80b0-907a89622445	7505.00	0.18	0.00	Processing	\N	2026-02-23 05:57:31.674736
cec94cab-645f-40eb-872d-fe863c7aab30	cda860be-a6ea-4ffe-9907-ce420d345310	7505.00	0.18	0.00	Processing	\N	2026-02-23 14:10:05.422082
cd222a59-17f7-49f0-87b8-7385927681db	9c7ddd92-c529-4fd1-80b0-907a89622445	2.00	0.18	2.00	Processing	\N	2026-02-25 06:59:38.013354
c59e3f23-a475-4b3c-b60a-9caf9d707c00	9c7ddd92-c529-4fd1-80b0-907a89622445	6.00	0.18	2.00	Processing	\N	2026-03-05 07:44:27.985575
344592ca-ebca-46a8-b301-36bf81ddb9fe	9c7ddd92-c529-4fd1-80b0-907a89622445	6.00	0.18	2.00	Processing	\N	2026-03-05 07:49:49.281224
58085010-41f4-4fc0-b738-46d3588e88e4	9c7ddd92-c529-4fd1-80b0-907a89622445	6.00	0.18	2.00	Processing	\N	2026-03-05 07:51:50.174325
d14e99ef-3281-4d33-9e4e-f9e26d3b499d	9c7ddd92-c529-4fd1-80b0-907a89622445	2.00	0.18	2.00	Delivered	\N	2026-02-25 07:05:18.193877
8b50f68c-e491-420b-a4c2-95659f88fb9b	cda860be-a6ea-4ffe-9907-ce420d345310	2.00	0.18	2.00	Shipped	\N	2026-02-25 10:00:13.941377
fb32dc9a-c032-460a-9b62-aa08cd5e7f4b	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 05:48:25.757521
119ee020-9edc-492a-90f3-533663931c83	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 05:48:28.956623
5039c6cd-7fa1-46b2-bd0d-2d4124e58054	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 05:48:30.917735
71b21b47-cf11-4664-a88e-e0788a1007d2	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 05:48:31.597867
de762603-5d27-429d-aefa-a43ceab0d9bd	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:53:00.622162
03a14248-b1f4-4c63-a4f0-9f71da590d8d	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:53:38.41823
27186347-5d61-4eed-a2c3-1141a9b0cdd1	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:53:42.026473
5d7ffbcb-995f-41b3-9a26-c580cf63d635	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:53:44.360865
a3f216cc-702b-494a-af68-f5fa06f0811b	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:53:45.743653
f1d55873-71e4-4659-8386-7ab2804479b3	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:53:46.225103
5fe4ab11-14a5-4fdc-9804-8c7faba5e7fc	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:53:46.74405
7d664f66-3333-41ba-9b13-4002c93bd0cc	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:53:47.216796
73edb2bb-514a-446a-b754-866ccdb4744a	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:53:47.775667
397fb065-c5d6-4533-9702-0fb39e843d9a	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:53:48.255264
d02048ed-e337-45f3-b7cb-da99c9d472e5	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:54:53.27566
96b317b2-04d0-4a51-8255-e8abb6815eeb	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:54:55.185284
7bf805bd-1096-4996-b50e-70db8b0f9159	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:54:56.169914
a870d816-8841-4e43-8022-43cf99d47cf6	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:54:57.398104
78b9dd61-003d-4f8e-a4d2-4a0fe3d67f52	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:54:58.279515
4ead3600-78ee-46f5-acd7-1fff0fbc563f	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:58:47.507423
0e017d2d-8857-4fd8-ae90-2b70a6a49edd	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:58:49.794451
3e72abaf-a663-44c6-9ef3-2cb12d2d549c	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:58:50.290603
fdf38932-95be-4d55-a123-18c3d220c456	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:58:50.754135
19602fba-6687-43f7-be4a-a19f97a03c71	9c7ddd92-c529-4fd1-80b0-907a89622445	2.01	0.00	2.00	Processing	\N	2026-03-04 05:58:51.253758
d6ee4b43-7ae5-49f0-8b9a-031f7e91a75e	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:19:55.497065
4c692795-c8d5-46ee-87f8-b17ea4082539	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:19:57.763744
68db74eb-97e0-45b3-b2d2-7821c473f610	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:19:58.261327
5b90dd9b-8a84-4b55-86dd-43c97a8b73a0	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:19:58.657057
bd769497-144d-4fae-8803-5c19c7a13d71	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:19:59.178056
eba68680-0e35-4dbe-bda5-5c671b1a2c42	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:19:59.855709
1e411f9c-0743-43e2-8cc8-baa1d66c1a86	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:20:00.392416
4837d12e-5bce-4a10-87c3-f3e9352aaa64	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:20:00.839389
b8b6893e-40fb-44c3-91da-04ebeac69528	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:20:01.294465
20a7a99b-6759-4750-8bcd-1953fe307649	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:20:01.826493
e8b1415b-02bf-43d4-b982-7bda7cdcce7d	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:20:02.34407
5d55abca-1d95-4cfa-bcc7-a7e3069a6a62	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:28:49.369738
96be889a-07d7-4390-a96a-5af4e72a8d8a	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:30:31.779507
71b360a4-086d-4af2-9a55-fc67dc7a3b06	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:30:33.556534
bb55d68a-b74e-417f-9237-f23834a75c52	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:30:34.017862
5ca99e1b-fce9-4ede-8680-dc0aca3b1ea6	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:30:34.640094
e0bb778f-7554-48c3-a581-7e880b6cc157	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:32:45.697273
e058759a-3777-4c67-97d6-b1b7e55fbd71	9c7ddd92-c529-4fd1-80b0-907a89622445	6.17	0.64	2.00	Processing	\N	2026-03-04 06:34:08.439357
c183cc01-8dd0-4a3a-b086-4577e4d04de9	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:34:22.813605
012d41c2-4ed4-477b-8212-41dd176a1062	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:34:24.728619
c168eefa-971b-4555-b7cb-09e27ba475cb	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:41:37.884623
c4e1ceec-fe6e-4090-9738-202df242ab02	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:41:52.30477
9f523593-4bd9-4f7b-a488-abc71240ae52	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:42:44.866989
27b06c0b-0201-4d00-8dee-f736d65d26d6	9c7ddd92-c529-4fd1-80b0-907a89622445	10.33	1.27	2.00	Processing	\N	2026-03-04 06:42:47.821551
064832ab-41bf-4215-bc53-35214f8b6519	9c7ddd92-c529-4fd1-80b0-907a89622445	2.00	0.18	2.00	Processing	\N	2026-03-05 07:43:15.021084
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, order_id, payment_type, payment_status, payment_intent_id, created_at) FROM stdin;
812523a4-9dc9-4ad5-9c9d-451e299a0502	4da8289b-1930-4ca9-9dc5-a09cb92b1729	Online	Pending	pi_3T2dqFGYwxTwogKW0JjMTaRB_secret_DnnLHluGNFg5DttCUreoFv3vD	2026-02-19 12:28:55.907042
5c3ed2b6-b89e-4bc1-88df-1d1ce1482f9a	3d5ac4c5-7ab1-4ece-aac5-6fee7e8f0cc7	Online	Pending	pi_3T2drHGYwxTwogKW06YanwTq_secret_wcZxNNImqX98IHf7e1vxVmLYJ	2026-02-19 12:29:59.265168
8cbdc01c-33e3-4f8d-915d-989decf72e31	4a755818-348b-48c0-8bbc-3d5beb4d217b	Online	Pending	pi_3T3yoVGYwxTwogKW1YSYLe0a_secret_lxHGWL0LfAJxdEwUd6BZI3mmR	2026-02-23 05:04:39.7021
02a0285a-5050-4857-96c2-74a5471bda88	7e2ab3f0-ed77-448d-b8a3-2b5f6e33e5a8	Online	Pending	pi_3T3z2DGYwxTwogKW0HJEEKWU_secret_xB4HHWh10IHjkfA09vxGHYII9	2026-02-23 05:18:49.66433
9144ec97-9923-48cd-9c93-d42b6baa48de	b80b7d58-6cea-4d84-8f6c-bdbc34e4b299	Online	Pending	pi_3T3zdgGYwxTwogKW3UwgtE0o_secret_hP1tbjkFq69FC8SNAI4QzTnsU	2026-02-23 05:57:32.707749
9bb5b80e-047e-4e32-b0e2-825928c8bf74	cec94cab-645f-40eb-872d-fe863c7aab30	Online	Pending	pi_3T47KMGYwxTwogKW3KYlq63D_secret_eu9A0moFtuXvwzHBuJKkpv1pk	2026-02-23 14:10:06.783776
05117147-beee-4d8f-8042-f8a23183bdfa	cd222a59-17f7-49f0-87b8-7385927681db	Online	Pending	pi_3T4jYwGYwxTwogKW1YIzezIq_secret_7HxFNLWkTzbnBQeUvKJPVJWji	2026-02-25 06:59:38.919807
4c0b18ff-9c08-4552-89ed-65288b3cbb75	d14e99ef-3281-4d33-9e4e-f9e26d3b499d	Online	Pending	pi_3T4jeQGYwxTwogKW1Cz0ku1X_secret_SlCSRcnyUyfeVlEbScQbyXclo	2026-02-25 07:05:19.085443
72e78fbd-db57-4135-9dc0-0a0388af2b41	8b50f68c-e491-420b-a4c2-95659f88fb9b	Online	Pending	pi_3T4mNjGYwxTwogKW0I7wSFZv_secret_03XjpXk0uKoDwc6eaWZSi3JSA	2026-02-25 10:00:16.314048
cec59dae-dab6-44af-93b3-2cc0bca07286	064832ab-41bf-4215-bc53-35214f8b6519	Online	Pending	pi_3T7e3WGYwxTwogKW0oETBc30_secret_eKCX2gPKGUfK7afPBqSh3qdaR	2026-03-05 07:43:16.084931
52db33e6-9704-439b-b90e-8a82e1b9221c	aae2788a-27a5-4c3b-be37-3c77cfc3c4e7	Online	Pending	pi_3T7e41GYwxTwogKW0v4CH16I_secret_b2DpozeBCmPygJ00KEjhaM2ma	2026-03-05 07:43:47.816406
f97e39d7-e9c6-4180-90f1-aef149f912ed	c59e3f23-a475-4b3c-b60a-9caf9d707c00	Online	Pending	pi_3T7e4gGYwxTwogKW1EsG2de1_secret_VX05qSLtnknHGM2DRNINqaR7i	2026-03-05 07:44:28.477276
1576cfbb-aff8-4278-8276-e5c986e289e0	344592ca-ebca-46a8-b301-36bf81ddb9fe	Online	Pending	pi_3T7e9sGYwxTwogKW0XOU5bSe_secret_KSp2L0fOdWHd6IxnGEdFo592k	2026-03-05 07:49:50.059791
32d58f84-2bdf-427e-8866-69a720e38987	58085010-41f4-4fc0-b738-46d3588e88e4	Online	Pending	pi_3T7eBpGYwxTwogKW2psMFRbs_secret_V4Lo8V2IJT0tYtETZWgwGV1mV	2026-03-05 07:51:50.998415
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, description, price, category, ratings, images, stock, created_by, created_at) FROM stdin;
606176c4-4e74-4041-a6cc-8c1b62e82640	Samsung S25 Ultra	good smartphone.	3.53	Electronics	0.00	[{"url": "https://res.cloudinary.com/dhljktf9k/image/upload/v1771828479/Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj.jpg", "public_id": "Ecommerce_Product_Images/lqwmyflcc5bxfaijd4mj"}, {"url": "https://res.cloudinary.com/dhljktf9k/image/upload/v1771828480/Ecommerce_Product_Images/tuaix3g3j57vuuoqavc4.png", "public_id": "Ecommerce_Product_Images/tuaix3g3j57vuuoqavc4"}]	16	9c7ddd92-c529-4fd1-80b0-907a89622445	2026-02-22 22:34:47.489461
abdbb7d3-d2fd-4f79-9bec-2b1743175572	bf	,cxytguh	0.01	Electronics	1.00	[{"url": "https://res.cloudinary.com/dhljktf9k/image/upload/v1772031878/Ecommerce_Product_Images/ux0rrfv40mekzaulthbj.png", "public_id": "Ecommerce_Product_Images/ux0rrfv40mekzaulthbj"}]	7	9c7ddd92-c529-4fd1-80b0-907a89622445	2026-02-25 07:04:36.47291
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, product_id, user_id, rating, comment, created_at) FROM stdin;
7e999591-26a8-4e90-8e89-1e6b9d193877	abdbb7d3-d2fd-4f79-9bec-2b1743175572	9c7ddd92-c529-4fd1-80b0-907a89622445	1.00	4cdc	2026-02-25 12:24:48.727627
\.


--
-- Data for Name: shipping_info; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_info (id, order_id, full_name, state, city, country, address, pincode, phone) FROM stdin;
06f6a542-76ee-498f-bd3b-e07a20b99e4e	c406d9ba-f942-42c2-b8f3-4e5ce567a94b	Muhammad Zeeshan	Sindh	Karachi	Pakistan	House No. 123, Street 4	74000	03123456789
76748620-a7fb-4d42-86ae-db1313dc4953	43dd479c-6393-4cc2-b6fe-8bfe7db1f130	Muhammad Zeeshan	Sindh	Karachi	Pakistan	House No. 123, Street 4	74000	03123456789
a23097c4-e270-4e10-95bd-fec02dfcc357	7976a77a-2237-42f6-9347-cf0e705e0742	Muhammad Zeeshan	Sindh	Karachi	Pakistan	House No. 123, Street 4	74000	03123456789
9a66b57e-3b5f-4501-8252-61aeacca38d7	4da8289b-1930-4ca9-9dc5-a09cb92b1729	Muhammad Zeeshan	Sindh	Karachi	Pakistan	House No. 123, Street 4	74000	03123456789
74916b68-84c5-49f4-bfda-fad9cbbfd9a3	3d5ac4c5-7ab1-4ece-aac5-6fee7e8f0cc7	Muhammad Zeeshan	Sindh	Karachi	Pakistan	House No. 123, Street 4	74000	03123456789
b8110ae8-ef1f-4aac-ab07-b424e77cfdfb	4a755818-348b-48c0-8bbc-3d5beb4d217b	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
07acadc3-83f1-469a-a799-9517c16833b2	7e2ab3f0-ed77-448d-b8a3-2b5f6e33e5a8	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
b673e22a-508d-4b7d-97fa-8046050d7ca9	b80b7d58-6cea-4d84-8f6c-bdbc34e4b299	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
9b0593ad-53c3-4930-985b-e9ec0790ef0d	cec94cab-645f-40eb-872d-fe863c7aab30	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
7ce4a03e-b25f-4b7e-be4c-3b7ed4f35ce8	cd222a59-17f7-49f0-87b8-7385927681db	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
dd39f91a-0938-4f9a-ae13-ffcb64f58175	d14e99ef-3281-4d33-9e4e-f9e26d3b499d	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
cb4ce89b-b33e-4590-9205-57c55b8f192a	8b50f68c-e491-420b-a4c2-95659f88fb9b	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
c5f19821-a616-40c6-8198-c58e9225246d	fb32dc9a-c032-460a-9b62-aa08cd5e7f4b	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
dfcd1803-aa30-4379-a6fb-e2a0cf73ad49	119ee020-9edc-492a-90f3-533663931c83	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
7f779340-b661-480b-8fa0-4802481c543c	5039c6cd-7fa1-46b2-bd0d-2d4124e58054	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
eb95437d-e72b-49c1-b185-4e588c90b5b8	71b21b47-cf11-4664-a88e-e0788a1007d2	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
627a590b-3ac3-4a15-beec-77d2501444d0	de762603-5d27-429d-aefa-a43ceab0d9bd	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
dd7535f0-f487-4c5c-98e5-bb48c05aa4f1	03a14248-b1f4-4c63-a4f0-9f71da590d8d	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
fdc674c9-4063-4b3e-bb89-db31ce78a26b	27186347-5d61-4eed-a2c3-1141a9b0cdd1	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
97d97c47-2f97-4a41-8aa4-4d7457be8c6b	5d7ffbcb-995f-41b3-9a26-c580cf63d635	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
6db5a3ff-f56b-4f43-8fd3-9e242263689a	a3f216cc-702b-494a-af68-f5fa06f0811b	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
3e500bcf-02e2-486b-b657-a30fd6f4ab8c	f1d55873-71e4-4659-8386-7ab2804479b3	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
736c4b6e-5913-479a-b3ec-bdddf69340ee	5fe4ab11-14a5-4fdc-9804-8c7faba5e7fc	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
8a0bf9e3-ce4d-4cda-8098-8da586a3c207	7d664f66-3333-41ba-9b13-4002c93bd0cc	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
306bcd48-da8c-4223-9d25-5b6b9f3b9720	73edb2bb-514a-446a-b754-866ccdb4744a	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
131d4421-85b0-4938-ae0f-793386bf9da9	397fb065-c5d6-4533-9702-0fb39e843d9a	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
a18bd91c-ddea-4db7-b650-8329e9e4ba4d	d02048ed-e337-45f3-b7cb-da99c9d472e5	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
6f6472f1-efe5-49e3-8a0e-2aabea66b392	96b317b2-04d0-4a51-8255-e8abb6815eeb	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
a4da589e-2e5f-4cb5-b6a7-13574fc0eaf0	7bf805bd-1096-4996-b50e-70db8b0f9159	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
92aa4733-85a6-4a58-b913-9a4bf8d41755	a870d816-8841-4e43-8022-43cf99d47cf6	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
eaa21521-5474-41d5-8dc8-952a48937b22	78b9dd61-003d-4f8e-a4d2-4a0fe3d67f52	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
564669a9-f9e2-441f-9f26-3bf697e5543e	4ead3600-78ee-46f5-acd7-1fff0fbc563f	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
0d5e93dd-b743-4c33-99f2-f189088528b1	0e017d2d-8857-4fd8-ae90-2b70a6a49edd	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
d47a0fc4-01b2-4814-b0ee-ea7104da7869	3e72abaf-a663-44c6-9ef3-2cb12d2d549c	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
dd3cb5a6-ce2c-4c38-a47d-7ffb7f3ffe79	fdf38932-95be-4d55-a123-18c3d220c456	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
55626da7-400e-47c2-a0c4-c48f36305b52	19602fba-6687-43f7-be4a-a19f97a03c71	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
388cd995-0945-4c8d-8532-0c143837ad84	d6ee4b43-7ae5-49f0-8b9a-031f7e91a75e	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
2da7b121-c608-44c6-bd1b-69bd76e74eb8	4c692795-c8d5-46ee-87f8-b17ea4082539	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
56ae103a-54c6-4757-87ba-3f82a8a892df	68db74eb-97e0-45b3-b2d2-7821c473f610	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
cfe7e591-e72e-4819-a139-01b892c7f9a8	5b90dd9b-8a84-4b55-86dd-43c97a8b73a0	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
db4fca24-5f18-4eb7-a520-d368b5255215	bd769497-144d-4fae-8803-5c19c7a13d71	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
7c9ab89d-edb8-42a1-ae2e-8480134dc345	eba68680-0e35-4dbe-bda5-5c671b1a2c42	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
c9e5fdaa-36b0-4c62-9c7f-7951934290d9	1e411f9c-0743-43e2-8cc8-baa1d66c1a86	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
10a69a8d-bcf5-4c9f-a1e8-863a5239047f	4837d12e-5bce-4a10-87c3-f3e9352aaa64	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
aa09075e-c4aa-4062-94c6-880defd36cf7	b8b6893e-40fb-44c3-91da-04ebeac69528	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
7a945b69-6ad6-457d-97c2-85c0c6905782	20a7a99b-6759-4750-8bcd-1953fe307649	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
4a9931a7-aba4-47eb-b839-d0e652dcb6d3	e8b1415b-02bf-43d4-b982-7bda7cdcce7d	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
6e128ace-a786-4c16-abab-cbcd5d57d9c8	5d55abca-1d95-4cfa-bcc7-a7e3069a6a62	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
7915924f-c02c-424d-b62e-602847143f6d	96be889a-07d7-4390-a96a-5af4e72a8d8a	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
bbe646a2-8f6c-4f20-989f-ae7c8536f960	71b360a4-086d-4af2-9a55-fc67dc7a3b06	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
1816fd49-7836-4c71-9651-55338da0a060	bb55d68a-b74e-417f-9237-f23834a75c52	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
87232421-3706-4380-b8af-fef8c6d4a5ec	5ca99e1b-fce9-4ede-8680-dc0aca3b1ea6	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
ea43de4b-4056-407c-93d5-199a55a8c851	e0bb778f-7554-48c3-a581-7e880b6cc157	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
f0f78360-1508-4f1e-81d2-197a2c640b50	e058759a-3777-4c67-97d6-b1b7e55fbd71	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
2527b9d3-db74-4698-bcce-cf3f4a6bda4b	c183cc01-8dd0-4a3a-b086-4577e4d04de9	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
72471674-5b23-4e3c-a2ba-efce4bd6171b	012d41c2-4ed4-477b-8212-41dd176a1062	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
c4262c3a-5c20-4d1a-822e-d0840e22a40a	c168eefa-971b-4555-b7cb-09e27ba475cb	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
153cc59c-c1c3-481e-a425-85c0261a7979	c4e1ceec-fe6e-4090-9738-202df242ab02	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
62a407d4-1f44-4822-8eda-f1b18bcfd40b	9f523593-4bd9-4f7b-a488-abc71240ae52	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
411de051-30b4-459d-bc40-2a019f4cd914	27b06c0b-0201-4d00-8dee-f736d65d26d6	Daniel Daniel	Lagos	Lagos	United Kingdom	Line 1: 123 Test Street	100001	08012345678
4c5d4a6f-11be-4810-9a5d-691103332ae9	064832ab-41bf-4215-bc53-35214f8b6519	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
dcc4d52e-01ee-4356-aac2-27d8025e8ace	aae2788a-27a5-4c3b-be37-3c77cfc3c4e7	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
01aac492-6d19-4355-bc17-9b6f3a6a26b1	c59e3f23-a475-4b3c-b60a-9caf9d707c00	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
1a31607e-552c-449e-8301-2c6319a3487f	344592ca-ebca-46a8-b301-36bf81ddb9fe	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
a126661c-e14b-4419-a722-ba2d137b7222	58085010-41f4-4fc0-b738-46d3588e88e4	Daniel Daniel	Karachi	Lagos	Pakistan	Line 1: 123 Test Street	100001	08012345678
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password, role, avatar, reset_password_token, reset_password_expire, created_at) FROM stdin;
cda860be-a6ea-4ffe-9907-ce420d345310	Daniel	georgeabiamakadaniel@example.com	$2b$10$kJtFokh37sXkFppQ7SmtmeaHF/Q/s56QwDPWrj7uTAh8H326TyZ5u	User	\N	\N	\N	2026-02-23 14:09:21.009394
8b20f302-fb04-4c94-9f87-263bb09d258f	Daniel	\ngeorgeabiamakadaniel@gmail.com	$2b$10$sb4qZvr5c6n7GwsPt54ut.e9O6/Dv3pbY23tS5ExwzYaJ8BafZNPy	Admin	{"url": "https://res.cloudinary.com/dhljktf9k/image/upload/v1771453012/Ecommerce_Avatars/vbao6x0wowpzzco5h8fc.png", "public_id": "Ecommerce_Avatars/vbao6x0wowpzzco5h8fc"}	\N	\N	2026-02-18 10:47:36.627325
9c7ddd92-c529-4fd1-80b0-907a89622445	Daniel George	georgeabiamakadaniel@gmail.com	$2b$10$6QylhVkFP2KRKAmg2QFYYug0xJqWMQf.xd3cbgLomqXCAkjPA9rRC	Admin	{"url": "https://res.cloudinary.com/dhljktf9k/image/upload/v1771706253/Ecommerce_Avatars/qtypag1ymupgoi6wkezw.png", "public_id": "Ecommerce_Avatars/qtypag1ymupgoi6wkezw"}	\N	\N	2026-02-19 08:27:53.230318
\.


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_key UNIQUE (order_id);


--
-- Name: payments payments_payment_intent_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_intent_id_key UNIQUE (payment_intent_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: shipping_info shipping_info_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_info
    ADD CONSTRAINT shipping_info_order_id_key UNIQUE (order_id);


--
-- Name: shipping_info shipping_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_info
    ADD CONSTRAINT shipping_info_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: orders orders_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: products products_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shipping_info shipping_info_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_info
    ADD CONSTRAINT shipping_info_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 40paPaxyBUyRfJLv0zLKxXgtBEZZgrfcGSccHsTRaB6HeuCCz8LAuXBhgHlbngY

