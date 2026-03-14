--
-- PostgreSQL database dump
--


-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.reseller_topups DROP CONSTRAINT IF EXISTS reseller_topups_reseller_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reseller_topups DROP CONSTRAINT IF EXISTS reseller_topups_package_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reseller_key_pool DROP CONSTRAINT IF EXISTS reseller_key_pool_panel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reseller_key_orders DROP CONSTRAINT IF EXISTS reseller_key_orders_reseller_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reseller_key_orders DROP CONSTRAINT IF EXISTS reseller_key_orders_panel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reseller_key_orders DROP CONSTRAINT IF EXISTS reseller_key_orders_key_id_fkey;
ALTER TABLE IF EXISTS ONLY public.panels DROP CONSTRAINT IF EXISTS panels_section_id_fkey;
ALTER TABLE IF EXISTS ONLY public.panel_images DROP CONSTRAINT IF EXISTS panel_images_panel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_panel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customer_key_pool DROP CONSTRAINT IF EXISTS customer_key_pool_panel_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customer_key_pool DROP CONSTRAINT IF EXISTS customer_key_pool_assigned_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_key_key;
ALTER TABLE IF EXISTS ONLY public.sections DROP CONSTRAINT IF EXISTS sections_pkey;
ALTER TABLE IF EXISTS ONLY public.resellers DROP CONSTRAINT IF EXISTS resellers_username_key;
ALTER TABLE IF EXISTS ONLY public.resellers DROP CONSTRAINT IF EXISTS resellers_pkey;
ALTER TABLE IF EXISTS ONLY public.reseller_topups DROP CONSTRAINT IF EXISTS reseller_topups_pkey;
ALTER TABLE IF EXISTS ONLY public.reseller_packages DROP CONSTRAINT IF EXISTS reseller_packages_pkey;
ALTER TABLE IF EXISTS ONLY public.reseller_packages DROP CONSTRAINT IF EXISTS reseller_packages_amount_usd_key;
ALTER TABLE IF EXISTS ONLY public.reseller_key_pool DROP CONSTRAINT IF EXISTS reseller_key_pool_pkey;
ALTER TABLE IF EXISTS ONLY public.reseller_key_orders DROP CONSTRAINT IF EXISTS reseller_key_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.promo_codes DROP CONSTRAINT IF EXISTS promo_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.promo_codes DROP CONSTRAINT IF EXISTS promo_codes_code_key;
ALTER TABLE IF EXISTS ONLY public.panels DROP CONSTRAINT IF EXISTS panels_pkey;
ALTER TABLE IF EXISTS ONLY public.panel_images DROP CONSTRAINT IF EXISTS panel_images_pkey;
ALTER TABLE IF EXISTS ONLY public.panel_files DROP CONSTRAINT IF EXISTS panel_files_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_key_pool DROP CONSTRAINT IF EXISTS customer_key_pool_pkey;
ALTER TABLE IF EXISTS ONLY public.admins DROP CONSTRAINT IF EXISTS admins_username_key;
ALTER TABLE IF EXISTS ONLY public.admins DROP CONSTRAINT IF EXISTS admins_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sections ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.resellers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reseller_topups ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reseller_packages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reseller_key_pool ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reseller_key_orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.promo_codes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.panels ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.panel_images ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.panel_files ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.customer_key_pool ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.admins ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.settings_id_seq;
DROP TABLE IF EXISTS public.settings;
DROP SEQUENCE IF EXISTS public.sections_id_seq;
DROP TABLE IF EXISTS public.sections;
DROP SEQUENCE IF EXISTS public.resellers_id_seq;
DROP TABLE IF EXISTS public.resellers;
DROP SEQUENCE IF EXISTS public.reseller_topups_id_seq;
DROP TABLE IF EXISTS public.reseller_topups;
DROP SEQUENCE IF EXISTS public.reseller_packages_id_seq;
DROP TABLE IF EXISTS public.reseller_packages;
DROP SEQUENCE IF EXISTS public.reseller_key_pool_id_seq;
DROP TABLE IF EXISTS public.reseller_key_pool;
DROP SEQUENCE IF EXISTS public.reseller_key_orders_id_seq;
DROP TABLE IF EXISTS public.reseller_key_orders;
DROP SEQUENCE IF EXISTS public.promo_codes_id_seq;
DROP TABLE IF EXISTS public.promo_codes;
DROP SEQUENCE IF EXISTS public.panels_id_seq;
DROP TABLE IF EXISTS public.panels;
DROP SEQUENCE IF EXISTS public.panel_images_id_seq;
DROP TABLE IF EXISTS public.panel_images;
DROP SEQUENCE IF EXISTS public.panel_files_id_seq;
DROP TABLE IF EXISTS public.panel_files;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.customer_key_pool_id_seq;
DROP TABLE IF EXISTS public.customer_key_pool;
DROP SEQUENCE IF EXISTS public.admins_id_seq;
DROP TABLE IF EXISTS public.admins;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'admin'::character varying,
    permissions jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: customer_key_pool; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_key_pool (
    id integer NOT NULL,
    panel_id integer,
    duration_days integer NOT NULL,
    key_value text NOT NULL,
    status character varying(20) DEFAULT 'available'::character varying,
    assigned_order_id integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: customer_key_pool_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_key_pool_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_key_pool_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_key_pool_id_seq OWNED BY public.customer_key_pool.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    panel_id integer,
    panel_name character varying(255) NOT NULL,
    duration character varying(50) NOT NULL,
    price numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0,
    final_price numeric(10,2) NOT NULL,
    promo_code character varying(100) DEFAULT ''::character varying,
    utr_number character varying(255) DEFAULT ''::character varying,
    payment_method character varying(50) DEFAULT 'upi'::character varying,
    status character varying(50) DEFAULT 'pending_payment'::character varying,
    customer_username character varying(255) DEFAULT ''::character varying,
    customer_telegram character varying(255) DEFAULT ''::character varying,
    customer_email character varying(255) DEFAULT ''::character varying,
    key_delivered text DEFAULT ''::text,
    admin_notes text DEFAULT ''::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    delivered_files text DEFAULT ''::text,
    payment_proof_image text DEFAULT ''::text
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: panel_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.panel_files (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text DEFAULT ''::text,
    version character varying(50) DEFAULT '1.0'::character varying,
    file_size character varying(50) DEFAULT ''::character varying,
    update_date character varying(50) DEFAULT ''::character varying,
    thumbnail character varying(255) DEFAULT ''::character varying,
    file_path character varying(255) NOT NULL,
    original_filename character varying(255) DEFAULT ''::character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: panel_files_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.panel_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: panel_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.panel_files_id_seq OWNED BY public.panel_files.id;


--
-- Name: panel_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.panel_images (
    id integer NOT NULL,
    panel_id integer,
    filename character varying(500) NOT NULL,
    original_name character varying(500) NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    media_type character varying(10) DEFAULT 'image'::character varying
);


--
-- Name: panel_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.panel_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: panel_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.panel_images_id_seq OWNED BY public.panel_images.id;


--
-- Name: panels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.panels (
    id integer NOT NULL,
    section_id integer,
    name character varying(255) NOT NULL,
    description text DEFAULT ''::text,
    image_url text DEFAULT ''::text,
    platform character varying(50) DEFAULT 'both'::character varying,
    price_1day numeric(10,2) DEFAULT 0,
    price_7day numeric(10,2) DEFAULT 0,
    price_30day numeric(10,2) DEFAULT 0,
    price_60day numeric(10,2) DEFAULT 0,
    is_in_stock boolean DEFAULT true,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    features text DEFAULT ''::text,
    created_at timestamp without time zone DEFAULT now(),
    reseller_price_1day numeric(10,2) DEFAULT 0,
    reseller_price_7day numeric(10,2) DEFAULT 0,
    reseller_price_30day numeric(10,2) DEFAULT 0,
    reseller_price_60day numeric(10,2) DEFAULT 0,
    custom_prices jsonb DEFAULT '{}'::jsonb,
    hidden_durations jsonb DEFAULT '{}'::jsonb
);


--
-- Name: panels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.panels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: panels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.panels_id_seq OWNED BY public.panels.id;


--
-- Name: promo_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promo_codes (
    id integer NOT NULL,
    code character varying(100) NOT NULL,
    discount_percent integer DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    min_order numeric(10,2) DEFAULT 0,
    max_uses integer DEFAULT 0,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: promo_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.promo_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: promo_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.promo_codes_id_seq OWNED BY public.promo_codes.id;


--
-- Name: reseller_key_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reseller_key_orders (
    id integer NOT NULL,
    reseller_id integer,
    duration_days integer NOT NULL,
    price_usd numeric(10,2) NOT NULL,
    key_id integer,
    key_value text DEFAULT ''::text,
    status character varying(20) DEFAULT 'delivered'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    panel_id integer
);


--
-- Name: reseller_key_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reseller_key_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reseller_key_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reseller_key_orders_id_seq OWNED BY public.reseller_key_orders.id;


--
-- Name: reseller_key_pool; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reseller_key_pool (
    id integer NOT NULL,
    duration_days integer NOT NULL,
    key_value text NOT NULL,
    status character varying(20) DEFAULT 'available'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    panel_id integer
);


--
-- Name: reseller_key_pool_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reseller_key_pool_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reseller_key_pool_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reseller_key_pool_id_seq OWNED BY public.reseller_key_pool.id;


--
-- Name: reseller_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reseller_packages (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    amount_usd numeric(10,2) NOT NULL,
    price_usd numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: reseller_packages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reseller_packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reseller_packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reseller_packages_id_seq OWNED BY public.reseller_packages.id;


--
-- Name: reseller_topups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reseller_topups (
    id integer NOT NULL,
    reseller_id integer,
    package_id integer,
    amount_usd numeric(10,2) NOT NULL,
    price_usd numeric(10,2) NOT NULL,
    payment_method character varying(50) DEFAULT 'upi'::character varying,
    utr_number character varying(255) DEFAULT ''::character varying,
    status character varying(50) DEFAULT 'pending_payment'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: reseller_topups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reseller_topups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reseller_topups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reseller_topups_id_seq OWNED BY public.reseller_topups.id;


--
-- Name: resellers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resellers (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    display_name character varying(255) DEFAULT ''::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    wallet_balance numeric(10,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: resellers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.resellers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: resellers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.resellers_id_seq OWNED BY public.resellers.id;


--
-- Name: sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sections (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text DEFAULT ''::text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sections_id_seq OWNED BY public.sections.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value text NOT NULL
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    telegram_username character varying(255) DEFAULT ''::character varying,
    is_admin boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: customer_key_pool id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_key_pool ALTER COLUMN id SET DEFAULT nextval('public.customer_key_pool_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: panel_files id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.panel_files ALTER COLUMN id SET DEFAULT nextval('public.panel_files_id_seq'::regclass);


--
-- Name: panel_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.panel_images ALTER COLUMN id SET DEFAULT nextval('public.panel_images_id_seq'::regclass);


--
-- Name: panels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.panels ALTER COLUMN id SET DEFAULT nextval('public.panels_id_seq'::regclass);


--
-- Name: promo_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_codes ALTER COLUMN id SET DEFAULT nextval('public.promo_codes_id_seq'::regclass);


--
-- Name: reseller_key_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_key_orders ALTER COLUMN id SET DEFAULT nextval('public.reseller_key_orders_id_seq'::regclass);


--
-- Name: reseller_key_pool id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_key_pool ALTER COLUMN id SET DEFAULT nextval('public.reseller_key_pool_id_seq'::regclass);


--
-- Name: reseller_packages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_packages ALTER COLUMN id SET DEFAULT nextval('public.reseller_packages_id_seq'::regclass);


--
-- Name: reseller_topups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_topups ALTER COLUMN id SET DEFAULT nextval('public.reseller_topups_id_seq'::regclass);


--
-- Name: resellers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resellers ALTER COLUMN id SET DEFAULT nextval('public.resellers_id_seq'::regclass);


--
-- Name: sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections ALTER COLUMN id SET DEFAULT nextval('public.sections_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, username, password, role, permissions, created_at) FROM stdin;
\.


--
-- Data for Name: customer_key_pool; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, user_id, panel_id, panel_name, duration, price, discount, final_price, promo_code, utr_number, payment_method, status, customer_username, customer_telegram, customer_email, key_delivered, admin_notes, created_at, updated_at, delivered_files, payment_proof_image) FROM stdin;
\.


--
-- Data for Name: panel_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.panel_files (id, title, description, version, file_size, update_date, thumbnail, file_path, original_filename, created_at) FROM stdin;
\.


--
-- Data for Name: panel_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.panel_images (id, panel_id, filename, original_name, sort_order, created_at, media_type) FROM stdin;
\.


--
-- Data for Name: panels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) FROM stdin;
1	1	Head Panel V1 - Basic	Basic headshot panel with auto-aim assist. Works on both iOS and Android.		both	1.00	3.00	8.00	12.00	t	t	0	Auto Headshot,Aim Assist,Anti-Ban Protection,Easy Setup	2026-03-08 06:07:18.361983	0.00	0.00	0.00	0.00	{}	{}
2	1	Head Panel V2 - Pro	Advanced headshot panel with enhanced accuracy and speed.		both	1.50	5.00	12.00	22.00	t	t	0	Pro Headshot,Speed Boost,Custom Sensitivity,Anti-Ban V2	2026-03-08 06:07:18.365675	0.00	0.00	0.00	0.00	{}	{}
3	2	Magic Bullet Panel - Standard	Standard magic bullet panel with auto tracking.		both	1.00	3.50	9.00	15.00	t	t	0	Magic Bullet,Auto Track,Smooth Aim,Anti-Detection	2026-03-08 06:07:18.368045	0.00	0.00	0.00	0.00	{}	{}
4	2	Magic Bullet Panel - Premium	Premium magic bullet with advanced tracking and custom settings.		both	1.50	5.00	15.00	25.00	t	t	0	Premium Bullet,Advanced Track,Custom Config,Priority Support	2026-03-08 06:07:18.370881	0.00	0.00	0.00	0.00	{}	{}
5	3	ESP Panel - Lite	Lightweight ESP panel with basic player detection.		both	1.00	2.00	6.00	10.00	t	t	0	Player ESP,Box ESP,Distance Show,Low Resource	2026-03-08 06:07:18.373663	0.00	0.00	0.00	0.00	{}	{}
6	3	ESP Panel - Full	Full ESP panel with all detection features included.		both	1.50	5.00	12.00	20.00	t	t	0	Full ESP,Aimbot ESP,Loot ESP,Vehicle ESP,Health Bar	2026-03-08 06:07:18.376992	0.00	0.00	0.00	0.00	{}	{}
7	4	Fluorite Key - Standard	Standard Fluorite activation key for FF panels.		both	1.00	2.00	5.00	8.00	t	t	0	Instant Activation,All Panels Support,Auto Update,24/7 Uptime	2026-03-08 06:07:18.379615	0.00	0.00	0.00	0.00	{}	{}
8	4	Fluorite Key - Premium	Premium Fluorite key with priority access and extra features.		both	1.00	3.00	7.00	12.00	t	t	0	Priority Access,Premium Features,Fast Updates,VIP Support	2026-03-08 06:07:18.382627	0.00	0.00	0.00	0.00	{}	{}
\.


--
-- Data for Name: promo_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promo_codes (id, code, discount_percent, discount_amount, min_order, max_uses, used_count, is_active, expires_at, created_at) FROM stdin;
1	WELCOME10	10	0.00	0.00	100	0	t	\N	2026-03-08 06:07:18.386088
\.


--
-- Data for Name: reseller_key_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reseller_key_orders (id, reseller_id, duration_days, price_usd, key_id, key_value, status, created_at, panel_id) FROM stdin;
\.


--
-- Data for Name: reseller_key_pool; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reseller_key_pool (id, duration_days, key_value, status, created_at, panel_id) FROM stdin;
1	1	Ahahva	available	2026-03-11 11:41:31.936388	2
\.


--
-- Data for Name: reseller_packages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reseller_packages (id, name, amount_usd, price_usd, is_active, sort_order, created_at) FROM stdin;
321	$10 Balance	10.00	10.00	t	1	2026-03-11 10:10:05.598187
322	$25 Balance	25.00	25.00	t	2	2026-03-11 10:10:05.611865
323	$50 Balance	50.00	50.00	t	3	2026-03-11 10:10:05.615277
324	$100 Balance	100.00	100.00	t	4	2026-03-11 10:10:05.6181
325	$200 Balance	200.00	200.00	t	5	2026-03-11 10:10:05.621261
326	$500 Balance	500.00	500.00	t	6	2026-03-11 10:10:05.623769
327	$1000 Balance	1000.00	1000.00	t	7	2026-03-11 10:10:05.626139
\.


--
-- Data for Name: reseller_topups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reseller_topups (id, reseller_id, package_id, amount_usd, price_usd, payment_method, utr_number, status, created_at) FROM stdin;
\.


--
-- Data for Name: resellers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.resellers (id, username, password, display_name, status, wallet_balance, created_at) FROM stdin;
1	Rakib	$2b$10$ctVkK88VdWYZmFgpI7W3c.0x6X/zut2JW6CCHrr9JESVAn7dq1ZF2	Rakib	active	100.00	2026-03-11 11:39:57.73513
\.


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sections (id, name, description, sort_order, is_active, created_at) FROM stdin;
1	Headshot Panels	Auto headshot panels for maximum accuracy	1	t	2026-03-08 06:07:18.348566
2	Magic Bullet Panels	Magic bullet panels with advanced features	2	t	2026-03-08 06:07:18.352402
3	ESP Panels	ESP panels with wallhack and player detection	3	t	2026-03-08 06:07:18.354831
4	Fluorite Keys	FF Fluorite activation keys for all durations	4	t	2026-03-08 06:07:18.357781
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, key, value) FROM stdin;
1	store_name	Aci Store
3	store_description	Premium FF Panels for iOS & Android
4	announcement	
5	telegram_support	Test
2	upi_id	yourupi@bank
6	payment_method_upi	true
7	payment_method_crypto	true
8	crypto_btc_address	1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
9	crypto_usdt_trc20_address	TExampleUSDTAddressTRC20here
10	crypto_usdt_erc20_address	0xExampleUSDTAddressERC20here
11	crypto_usdt_bep20_address	0xExampleUSDTAddressBEP20here
12	paypal_id	
13	payment_method_paypal	false
14	bkash_number	
15	nagad_number	
16	payment_method_bd	false
17	particle_effect	sparkles
18	banner_data	{"enabled":false,"type":"news","title":"","text":"","color":""}
19	telegram_reseller_link	
20	reseller_key_price_1day	3
21	reseller_key_price_3day	7
22	reseller_key_price_7day	12
23	reseller_key_price_14day	20
24	reseller_key_price_30day	35
313	theme_color	#3b82f6
1370	whatsapp_support	Test
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password, telegram_username, is_admin, created_at) FROM stdin;
1	Shariyan1	admin@ffpanel.com	$2b$10$olAxno8LHjLASmEbnNdIVOunjM6KsNwQO9d5SuRl/km9BE14oaMnO		t	2026-03-08 06:07:18.343605
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, false);


--
-- Name: customer_key_pool_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_key_pool_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: panel_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.panel_files_id_seq', 1, false);


--
-- Name: panel_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.panel_images_id_seq', 1, false);


--
-- Name: panels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.panels_id_seq', 8, true);


--
-- Name: promo_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.promo_codes_id_seq', 1, true);


--
-- Name: reseller_key_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reseller_key_orders_id_seq', 1, false);


--
-- Name: reseller_key_pool_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reseller_key_pool_id_seq', 1, true);


--
-- Name: reseller_packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reseller_packages_id_seq', 971, true);


--
-- Name: reseller_topups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reseller_topups_id_seq', 1, false);


--
-- Name: resellers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.resellers_id_seq', 1, true);


--
-- Name: sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sections_id_seq', 4, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_id_seq', 3896, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- Name: customer_key_pool customer_key_pool_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_key_pool
    ADD CONSTRAINT customer_key_pool_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: panel_files panel_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.panel_files
    ADD CONSTRAINT panel_files_pkey PRIMARY KEY (id);


--
-- Name: panel_images panel_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.panel_images
    ADD CONSTRAINT panel_images_pkey PRIMARY KEY (id);


--
-- Name: panels panels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.panels
    ADD CONSTRAINT panels_pkey PRIMARY KEY (id);


--
-- Name: promo_codes promo_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_code_key UNIQUE (code);


--
-- Name: promo_codes promo_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_pkey PRIMARY KEY (id);


--
-- Name: reseller_key_orders reseller_key_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_key_orders
    ADD CONSTRAINT reseller_key_orders_pkey PRIMARY KEY (id);


--
-- Name: reseller_key_pool reseller_key_pool_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_key_pool
    ADD CONSTRAINT reseller_key_pool_pkey PRIMARY KEY (id);


--
-- Name: reseller_packages reseller_packages_amount_usd_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_packages
    ADD CONSTRAINT reseller_packages_amount_usd_key UNIQUE (amount_usd);


--
-- Name: reseller_packages reseller_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_packages
    ADD CONSTRAINT reseller_packages_pkey PRIMARY KEY (id);


--
-- Name: reseller_topups reseller_topups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_topups
    ADD CONSTRAINT reseller_topups_pkey PRIMARY KEY (id);


--
-- Name: resellers resellers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resellers
    ADD CONSTRAINT resellers_pkey PRIMARY KEY (id);


--
-- Name: resellers resellers_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resellers
    ADD CONSTRAINT resellers_username_key UNIQUE (username);


--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


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
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: customer_key_pool customer_key_pool_assigned_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_key_pool
    ADD CONSTRAINT customer_key_pool_assigned_order_id_fkey FOREIGN KEY (assigned_order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: customer_key_pool customer_key_pool_panel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_key_pool
    ADD CONSTRAINT customer_key_pool_panel_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id) ON DELETE CASCADE;


--
-- Name: orders orders_panel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_panel_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: panel_images panel_images_panel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.panel_images
    ADD CONSTRAINT panel_images_panel_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id) ON DELETE CASCADE;


--
-- Name: panels panels_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.panels
    ADD CONSTRAINT panels_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE;


--
-- Name: reseller_key_orders reseller_key_orders_key_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_key_orders
    ADD CONSTRAINT reseller_key_orders_key_id_fkey FOREIGN KEY (key_id) REFERENCES public.reseller_key_pool(id) ON DELETE SET NULL;


--
-- Name: reseller_key_orders reseller_key_orders_panel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_key_orders
    ADD CONSTRAINT reseller_key_orders_panel_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id) ON DELETE SET NULL;


--
-- Name: reseller_key_orders reseller_key_orders_reseller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_key_orders
    ADD CONSTRAINT reseller_key_orders_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.resellers(id) ON DELETE CASCADE;


--
-- Name: reseller_key_pool reseller_key_pool_panel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_key_pool
    ADD CONSTRAINT reseller_key_pool_panel_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id) ON DELETE CASCADE;


--
-- Name: reseller_topups reseller_topups_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_topups
    ADD CONSTRAINT reseller_topups_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.reseller_packages(id) ON DELETE SET NULL;


--
-- Name: reseller_topups reseller_topups_reseller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reseller_topups
    ADD CONSTRAINT reseller_topups_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.resellers(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


-- =============================================
-- Aci Store PRODUCTION Database Full Backup
-- Generated: 2026-03-13T10:19:31.538Z
-- Source: aciallstore.com (Replit production)
-- =============================================

-- TABLE: sections (5 rows)
INSERT INTO sections (id, name, description, sort_order, is_active, created_at) VALUES (6, E'ANDROID NON ROOT PANEL', E'This is None Root Android Antiban Panel.', 2, TRUE, E'2026-03-11T04:45:47.116252') ON CONFLICT DO NOTHING;
INSERT INTO sections (id, name, description, sort_order, is_active, created_at) VALUES (7, E'ANDROID ROOT PANEL', E'Only Work Rooted Phone.', 3, TRUE, E'2026-03-11T05:30:57.368806') ON CONFLICT DO NOTHING;
INSERT INTO sections (id, name, description, sort_order, is_active, created_at) VALUES (9, E'PUBG &  BGMI PANEL  ', E'Level up your gaming experience with HACKS for iOS & Andriod – smooth, fast, and optimized for competitive gameplay.', 4, TRUE, E'2026-03-11T05:57:04.205448') ON CONFLICT DO NOTHING;
INSERT INTO sections (id, name, description, sort_order, is_active, created_at) VALUES (10, E'8 BALL POOL HACKES', E'This is help to win match. Autoplay game.', 5, TRUE, E'2026-03-11T06:16:02.563735') ON CONFLICT DO NOTHING;
INSERT INTO sections (id, name, description, sort_order, is_active, created_at) VALUES (5, E'FREE FIRE  iOS PANEL', E'This is one of the most Powerful ios panel in Free Fire ', 1, TRUE, E'2026-03-11T04:29:14.327846') ON CONFLICT DO NOTHING;

-- TABLE: panels (18 rows)
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (10, 5, E'iOS CERTIFECATE', E'Certificate Validaty is 1 Year.But Day is  Warrenty 30 Day / 60 Day / 7 Day/ 1 Day', E'', E'ios', 5, 5, 10, 12, TRUE, TRUE, 0, E'E sign, G box, Scarlet, K sign, Feather', E'2026-03-11T04:41:27.845397', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (17, 5, E'PROXY IOS PANEL', E'This panel injecte in wifi Method. No need ipa & File. ', E'', E'ios', 5, 10, 20, 35, TRUE, TRUE, 0, E'Aimbot, Antina Esp, Body Headshot, Drag Headshot, No Recoail ', E'2026-03-11T05:29:13.847637', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (18, 7, E'Drip Client Root ', E'Work on Virtual & Root Devices. Antiban & Safe.', E'', E'android', 2, 6, 12, 22, TRUE, TRUE, 0, E'Aimsilent, Aimbot, Aim megnet, Aimkill, Autofire, Esp, Ghost, Speed, Cs / Br Working ', E'2026-03-11T05:35:29.167695', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (12, 6, E'HG CHEAT APKMOD', E'Directly Works on you\'r Phone - No Virtual & Root Needed. Antiban & Safe.', E'', E'android', 1.5, 5, 10, 20, TRUE, TRUE, 0, E'Aim silent, Headshort Hack, Aim Visible, Speed Hack, Ghost Mode, Esp Line Location,  Cs/Br Working', E'2026-03-11T04:59:47.4574', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (13, 6, E'PATOTEAM APKMOD', E'Directly Works on you\'r Phone - No Virtual & Root Needed. Antiban & Safe.', E'', E'android', 2, 7, 15, 30, TRUE, TRUE, 0, E'Aim silent, Headshort Hack, Aim Visible, Speed Hack, Ghost Mode, Esp Line Location,  Cs/Br Working', E'2026-03-11T05:04:54.364627', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (9, 5, E'FLUORITE IOS PANEL', E'Level up your gaming experience with Fluorite  for iOS – smooth, fast, and optimized for competitive gameplay.', E'', E'ios', 5, 15, 25, 50, TRUE, TRUE, 0, E'Aim silent, Aimbot, Esp, Recoail, Autofire,Back jump, StreamMod', E'2026-03-11T04:33:09.460458', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (14, 5, E'FLUCK V2', E'iOS Brutal Aimkill Antiban Panel.', E'', E'ios', 3, 8, 16, 30, TRUE, TRUE, 0, E'Aim Silent, Aimbot, Esp Location, Aimkill, Aimkill v2, Telekill, Teleport, Fly, Autofire,No Recoail, Ai kill,Speed,Ghost,Stream Mod,', E'2026-03-11T05:11:37.116604', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (15, 5, E'MIGUL PRO', E'Antiban & Safe iOS Brutal Panel.', E'', E'ios', 5, 15, 25, 45, TRUE, TRUE, 0, E'Aim Silent, Aimbot, Aim Fov, Esp Location, Aimkill, Speed,Fast Switch, No Recoail, Fast Medkit,Fast Reload,Fly, Cover Enime Kill,Teleport 8m, Stream Mod', E'2026-03-11T05:17:34.359719', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (16, 5, E'MIGUL LITE', E'Antiban & Safe iPhone Streamer Panel.', E'', E'ios', 4, 8, 18, 35, TRUE, TRUE, 0, E'Aim Silent, Aimbot, Aim Fov, Esp Location, No Recoail, Stream Mod', E'2026-03-11T05:19:57.697784', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (21, 7, E'HAXX CREK PRO', E'Work on Virtual & Root Devices. Antiban & Safe.', E'', E'android', 2, 6, 10, 18, TRUE, TRUE, 0, E'Aimbot, Aim Fov, Head Shot Rate, Esp Location , Stream Mod', E'2026-03-11T05:46:58.744377', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (26, 10, E'ZOLO CHEAT 8BALL', E'Antiban & Safe Andriod  Panel', E'', E'android', 2, 9, 20, 38, TRUE, TRUE, 0, E'Auto aim, Autoplay, Esp Line.', E'2026-03-11T06:22:00.823174', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (11, 6, E'DRIP CLIENT  APKMOD', E'Directly Works on you\'r Phone - No Virtual & Root Needed. Antiban & Safe.', E'', E'android', 1, 4, 10, 20, TRUE, TRUE, 0, E'Aimsilent, Aimbot, Aim megnet, Aimkill, Autofire, Esp, Ghost, Speed, Cs / Br Working ', E'2026-03-11T04:53:17.116045', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (19, 7, E'HG CHEAT ROOT ', E'Work on Virtual & Root Devices. Antiban & Safe.', E'', E'android', 1.5, 6, 12, 22, TRUE, TRUE, 0, E'Aim silent, Headshort Hack, Aim Visible, Speed Hack, Ghost Mode, Esp Line Location,  Cs/Br Working', E'2026-03-11T05:40:28.242854', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (20, 7, E'BR ROOT ', E'Work on Virtual & Root Devices. Antiban & Safe.', E'', E'android', 2, 5, 10, 18, TRUE, TRUE, 0, E'Aim silent, Headshort Hack, Aim Visible, Speed Hack, Ghost Mode, Esp Line Location,  Cs/Br Working', E'2026-03-11T05:42:08.776732', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (22, 6, E'PRIME APKMOD', E'Directly Works on you\'r Phone - No Virtual & Root Needed. Antiban & Safe', E'', E'android', 1, 5, 14, 25, TRUE, TRUE, 0, E'Aim silent, Headshort Hack, Aim Visible, Speed Hack, Ghost Mode, Esp Line Location,  Cs/Br Working', E'2026-03-11T05:51:38.455763', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (23, 9, E'PUBG CLOUD IOS', E'Antiban & Safe iOS Panel.', E'', E'ios', 5, 16, 40, 75, TRUE, TRUE, 0, E'Auto Aim, Head Short, Esp Location, No Recoail, Stream Mod, Safe & Secure.', E'2026-03-11T06:00:48.456483', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (24, 9, E'PUBG ZOLO CHEAT ', E'Antiban & Safe  Andriod  Panel.', E'', E'android', 3, 10, 20, 35, TRUE, TRUE, 0, E'Auto Aim, Head Short, Esp Location, No Recoail, Stream Mod, Safe & Secure.', E'2026-03-11T06:09:35.699554', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;
INSERT INTO panels (id, section_id, name, description, image_url, platform, price_1day, price_7day, price_30day, price_60day, is_in_stock, is_active, sort_order, features, created_at, reseller_price_1day, reseller_price_7day, reseller_price_30day, reseller_price_60day, custom_prices, hidden_durations) VALUES (25, 10, E'WIZZARD 8BALL HACK', E'Antiban & Safe iOS Panel.', E'', E'ios', 6, 12, 25, 48, TRUE, TRUE, 0, E'Auto aim, Autoplay, Esp Line.', E'2026-03-11T06:20:06.81992', 0, 0, 0, 0, '{}', '{}') ON CONFLICT DO NOTHING;

-- TABLE: panel_images (1 rows)
INSERT INTO panel_images (id, panel_id, filename, original_name, sort_order, created_at, media_type) VALUES (3, 9, E'1773292556829_bbfd101be864ebbc.mp4', E'WhatsApp Video 2026-03-12 at 11.14.27 AM.mp4', 1, E'2026-03-12T05:15:57.227664', E'video') ON CONFLICT DO NOTHING;

-- TABLE: panel_files (0 rows)

-- TABLE: settings (28 rows)
INSERT INTO settings (id, key, value) VALUES (13, E'payment_method_paypal', E'false') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (14, E'bkash_number', E'01639431907') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (15, E'nagad_number', E'01823373439') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (16, E'payment_method_bd', E'true') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (17, E'particle_effect', E'stars') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (18, E'banner_data', E'{"enabled":true,"type":"discount","title":"WELCOME OFFER","text":"10% Discount For Members, Use Code WELCOME10","color":""}') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (19, E'telegram_reseller_link', E'https://t.me/cheatios9880') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (20, E'reseller_key_price_1day', E'3') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (3143, E'payment_method_binance', E'true') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (3198, E'binance_uid', E'858249871') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (6, E'payment_method_upi', E'false') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (7, E'payment_method_crypto', E'true') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (2, E'upi_id', E'yourupi@bank') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (8, E'crypto_btc_address', E'1ARAwi8uGqdvD5zgoL7W24bCpHUd3TELvN') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (9, E'crypto_usdt_trc20_address', E'TSAuqqtVf4QNKoFbys3F4UjmbafEDT7nQp') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (10, E'crypto_usdt_erc20_address', E'0x71462d44eccb1593cfe9819cff3120b212536245') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (11, E'crypto_usdt_bep20_address', E'0x71462d44eccb1593cfe9819cff3120b212536245') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (1, E'store_name', E'ACI STORE') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (3, E'store_description', E'Premium FF Panels for iOS & Android') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (4, E'announcement', E'WELCOME TO ACI STORE') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (5, E'telegram_support', E'https://t.me/shariyan221') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (21, E'reseller_key_price_3day', E'7') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (22, E'reseller_key_price_7day', E'12') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (23, E'reseller_key_price_14day', E'20') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (24, E'reseller_key_price_30day', E'35') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (169, E'theme_color', E'#3b82f6') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (1904, E'whatsapp_support', E'https://wa.me/message/IF6FUHVR7D2KB1') ON CONFLICT DO NOTHING;
INSERT INTO settings (id, key, value) VALUES (12, E'paypal_id', E'') ON CONFLICT DO NOTHING;

-- TABLE: users (7 rows)
INSERT INTO users (id, username, email, password, telegram_username, is_admin, created_at) VALUES (1, E'Shariyan1', E'admin@ffpanel.com', E'$2b$10$bFznz/pgfnOMPfUD0sbCH.E8cC2y0dJeidduFXecOLtwNjJR/6XoW', E'', TRUE, E'2026-03-08T06:16:09.094719') ON CONFLICT DO NOTHING;
INSERT INTO users (id, username, email, password, telegram_username, is_admin, created_at) VALUES (2, E'bhavisss', E'bhavisluffy@gmail.com', E'$2b$10$jckEE.RVlKEXu7zUoeElCewRtVDxJFIoisrIkMwXJWrZ3xOiZWy.6', E'@bhavisss', FALSE, E'2026-03-10T17:37:15.296434') ON CONFLICT DO NOTHING;
INSERT INTO users (id, username, email, password, telegram_username, is_admin, created_at) VALUES (3, E'ibrahim', E'ibrahimprodan221@gmail.com', E'$2b$10$B1imP3LrLwR9eK9UOI.I/e6LODCY/GRUEwPJWeSziNswurP13D3Va', E'', FALSE, E'2026-03-10T17:52:34.203305') ON CONFLICT DO NOTHING;
INSERT INTO users (id, username, email, password, telegram_username, is_admin, created_at) VALUES (4, E'rakib', E'modbilla1@gmail.com', E'$2b$10$.9u0Ky//AP/e1Cq2Ybsvl.xay0Bn6QlyeIdU4.I4H60Jj0scc/rHm', E'', FALSE, E'2026-03-11T03:48:17.246315') ON CONFLICT DO NOTHING;
INSERT INTO users (id, username, email, password, telegram_username, is_admin, created_at) VALUES (5, E'rakib9', E'rakib988@gmail.com', E'$2b$10$d4dA7L/lJlRPBE4F3TozwekAU4xXGc8BJDpic75gMjGl93QtEnksy', E'', FALSE, E'2026-03-11T04:02:24.453065') ON CONFLICT DO NOTHING;
INSERT INTO users (id, username, email, password, telegram_username, is_admin, created_at) VALUES (6, E'rakib050', E'mdrakibulff050@gmail.com', E'$2b$10$.MBwIIti20ZuPx2TZymDJub3.MunjPLK3PWuAVGFoAFa0WpoisHsq', E'rakib050', FALSE, E'2026-03-11T06:56:41.798499') ON CONFLICT DO NOTHING;
INSERT INTO users (id, username, email, password, telegram_username, is_admin, created_at) VALUES (7, E'Dark', E'divyashekhar0@icloud.com', E'$2b$10$gLp0/LnFuZJeL45/bHeyWeqTsKPlaSImRtoxnJeDm9xOoQ7GxQIL2', E'Dark', FALSE, E'2026-03-12T04:56:45.255446') ON CONFLICT DO NOTHING;

-- TABLE: promo_codes (1 rows)
INSERT INTO promo_codes (id, code, discount_percent, discount_amount, min_order, max_uses, used_count, is_active, expires_at, created_at) VALUES (1, E'WELCOME10', 10, 0, 0, 100, 0, TRUE, NULL, E'2026-03-08T06:16:09.772918') ON CONFLICT DO NOTHING;

-- TABLE: reseller_packages (7 rows)
INSERT INTO reseller_packages (id, name, amount_usd, price_usd, is_active, sort_order, created_at) VALUES (331, E'$10 Balance', 10, 10, TRUE, 1, E'2026-03-11T10:19:45.340169') ON CONFLICT DO NOTHING;
INSERT INTO reseller_packages (id, name, amount_usd, price_usd, is_active, sort_order, created_at) VALUES (332, E'$25 Balance', 25, 25, TRUE, 2, E'2026-03-11T10:19:45.340169') ON CONFLICT DO NOTHING;
INSERT INTO reseller_packages (id, name, amount_usd, price_usd, is_active, sort_order, created_at) VALUES (333, E'$50 Balance', 50, 50, TRUE, 3, E'2026-03-11T10:19:45.340169') ON CONFLICT DO NOTHING;
INSERT INTO reseller_packages (id, name, amount_usd, price_usd, is_active, sort_order, created_at) VALUES (334, E'$100 Balance', 100, 100, TRUE, 4, E'2026-03-11T10:19:45.340169') ON CONFLICT DO NOTHING;
INSERT INTO reseller_packages (id, name, amount_usd, price_usd, is_active, sort_order, created_at) VALUES (335, E'$200 Balance', 200, 200, TRUE, 5, E'2026-03-11T10:19:45.340169') ON CONFLICT DO NOTHING;
INSERT INTO reseller_packages (id, name, amount_usd, price_usd, is_active, sort_order, created_at) VALUES (336, E'$500 Balance', 500, 500, TRUE, 6, E'2026-03-11T10:19:45.340169') ON CONFLICT DO NOTHING;
INSERT INTO reseller_packages (id, name, amount_usd, price_usd, is_active, sort_order, created_at) VALUES (337, E'$1000 Balance', 1000, 1000, TRUE, 7, E'2026-03-11T10:19:45.340169') ON CONFLICT DO NOTHING;

-- TABLE: resellers (1 rows)
INSERT INTO resellers (id, username, password, display_name, status, wallet_balance, created_at) VALUES (1, E'rakib', E'$2b$10$1vXmf1d1fiSHc4ATJcLHG.AkjU5jk670vho94W8M.pzuetOBxCq/e', E'rakib', E'active', 0, E'2026-03-11T03:25:13.275482') ON CONFLICT DO NOTHING;

-- TABLE: customer_key_pool (18 rows)
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (4, 9, 30, E'491CA6C852CC43A4A391', E'available', NULL, E'2026-03-11T16:51:40.306664') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (5, 9, 30, E'3A3FC0B509DD45BFB7E5', E'available', NULL, E'2026-03-11T16:51:40.351765') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (6, 9, 30, E'D723995ACBD041A1896D', E'available', NULL, E'2026-03-11T16:51:40.395867') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (7, 9, 30, E'F67BE05D121C4B6D8D19', E'available', NULL, E'2026-03-11T16:51:40.440122') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (8, 9, 30, E'EA538A8B7F5246A89185', E'available', NULL, E'2026-03-11T16:51:40.484447') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (9, 9, 30, E'8E2A5FDB20CB4BBCA064', E'available', NULL, E'2026-03-11T16:51:40.528353') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (10, 9, 30, E'03F79970D84547A289F6', E'available', NULL, E'2026-03-11T16:51:40.885906') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (11, 9, 30, E'174142A116174DE09358', E'available', NULL, E'2026-03-11T16:51:40.929666') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (12, 9, 30, E'EFE22BFFD3C74D1C8ACF', E'available', NULL, E'2026-03-11T16:51:40.973439') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (13, 9, 30, E'491CA6C852CC43A4A391', E'available', NULL, E'2026-03-11T16:51:41.017456') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (14, 9, 30, E'3A3FC0B509DD45BFB7E5', E'available', NULL, E'2026-03-11T16:51:41.061852') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (15, 9, 30, E'D723995ACBD041A1896D', E'available', NULL, E'2026-03-11T16:51:41.106282') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (16, 9, 30, E'F67BE05D121C4B6D8D19', E'available', NULL, E'2026-03-11T16:51:41.149874') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (17, 9, 30, E'EA538A8B7F5246A89185', E'available', NULL, E'2026-03-11T16:51:41.193701') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (18, 9, 30, E'8E2A5FDB20CB4BBCA064', E'available', NULL, E'2026-03-11T16:51:41.237593') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (1, 9, 30, E'03F79970D84547A289F6', E'sold', NULL, E'2026-03-11T16:51:40.164212') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (2, 9, 30, E'174142A116174DE09358', E'sold', NULL, E'2026-03-11T16:51:40.216815') ON CONFLICT DO NOTHING;
INSERT INTO customer_key_pool (id, panel_id, duration_days, key_value, status, assigned_order_id, created_at) VALUES (3, 9, 30, E'EFE22BFFD3C74D1C8ACF', E'sold', 10, E'2026-03-11T16:51:40.262716') ON CONFLICT DO NOTHING;

-- TABLE: reseller_key_pool (2 rows)
INSERT INTO reseller_key_pool (id, duration_days, key_value, status, created_at, panel_id) VALUES (11, 30, E'F1C63B0FEF2D4F2CB780', E'available', E'2026-03-11T09:13:12.661384', 9) ON CONFLICT DO NOTHING;
INSERT INTO reseller_key_pool (id, duration_days, key_value, status, created_at, panel_id) VALUES (12, 30, E'661109D950594A948364', E'available', E'2026-03-11T09:13:12.705067', 9) ON CONFLICT DO NOTHING;

-- TABLE: orders (1 rows)
INSERT INTO orders (id, user_id, panel_id, panel_name, duration, price, discount, final_price, promo_code, utr_number, payment_method, status, customer_username, customer_telegram, customer_email, key_delivered, admin_notes, created_at, updated_at, delivered_files, payment_proof_image) VALUES (10, 1, 9, E'FLUORITE IOS PANEL', E'30day', 25, 0, 25, E'', E'6u5ty0-', E'binance', E'delivered', E'Shariyan1', E'', E'admin@ffpanel.com', E'EFE22BFFD3C74D1C8ACF', E'', E'2026-03-13T07:01:24.85587', E'2026-03-13T07:01:57.153451', E'', E'') ON CONFLICT DO NOTHING;

-- TABLE: reseller_key_orders (9 rows)
INSERT INTO reseller_key_orders (id, reseller_id, duration_days, price_usd, key_id, key_value, status, created_at, panel_id) VALUES (1, 1, 30, 25, NULL, E'E61726F9B86F4988B02E', E'delivered', E'2026-03-11T09:15:40.148265', 9) ON CONFLICT DO NOTHING;
INSERT INTO reseller_key_orders (id, reseller_id, duration_days, price_usd, key_id, key_value, status, created_at, panel_id) VALUES (2, 1, 30, 25, NULL, E'8D8C0CFA76254A729103', E'delivered', E'2026-03-11T10:29:23.890789', 9) ON CONFLICT DO NOTHING;
INSERT INTO reseller_key_orders (id, reseller_id, duration_days, price_usd, key_id, key_value, status, created_at, panel_id) VALUES (3, 1, 30, 25, NULL, E'3448BAF96C6A45568353', E'delivered', E'2026-03-11T12:09:31.010843', 9) ON CONFLICT DO NOTHING;
INSERT INTO reseller_key_orders (id, reseller_id, duration_days, price_usd, key_id, key_value, status, created_at, panel_id) VALUES (4, 1, 30, 25, NULL, E'0103FCA7B9034CAB9EE8', E'delivered', E'2026-03-11T13:58:20.113854', 9) ON CONFLICT DO NOTHING;
INSERT INTO reseller_key_orders (id, reseller_id, duration_days, price_usd, key_id, key_value, status, created_at, panel_id) VALUES (5, 1, 30, 25, NULL, E'1AD8705D1F7249E49BE3', E'delivered', E'2026-03-11T13:58:50.501287', 9) ON CONFLICT DO NOTHING;
INSERT INTO reseller_key_orders (id, reseller_id, duration_days, price_usd, key_id, key_value, status, created_at, panel_id) VALUES (6, 1, 30, 25, NULL, E'589A70E015DB4F3BAE22', E'delivered', E'2026-03-11T15:20:37.794323', 9) ON CONFLICT DO NOTHING;
INSERT INTO reseller_key_orders (id, reseller_id, duration_days, price_usd, key_id, key_value, status, created_at, panel_id) VALUES (7, 1, 30, 25, NULL, E'3F4C1A84D41D41319A1C', E'delivered', E'2026-03-11T15:22:35.612143', 9) ON CONFLICT DO NOTHING;
INSERT INTO reseller_key_orders (id, reseller_id, duration_days, price_usd, key_id, key_value, status, created_at, panel_id) VALUES (8, 1, 30, 25, NULL, E'1F2F777B180C4D29B8CF', E'delivered', E'2026-03-11T15:25:21.412589', 9) ON CONFLICT DO NOTHING;
INSERT INTO reseller_key_orders (id, reseller_id, duration_days, price_usd, key_id, key_value, status, created_at, panel_id) VALUES (9, 1, 30, 25, NULL, E'03E77E696F834D69904A', E'delivered', E'2026-03-11T15:25:22.489764', 9) ON CONFLICT DO NOTHING;

-- TABLE: reseller_topups (0 rows)

-- Reset sequences
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'sections_id_seq') THEN PERFORM setval('sections_id_seq', COALESCE((SELECT MAX(id) FROM sections), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'panels_id_seq') THEN PERFORM setval('panels_id_seq', COALESCE((SELECT MAX(id) FROM panels), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'panel_images_id_seq') THEN PERFORM setval('panel_images_id_seq', COALESCE((SELECT MAX(id) FROM panel_images), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'panel_files_id_seq') THEN PERFORM setval('panel_files_id_seq', COALESCE((SELECT MAX(id) FROM panel_files), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'settings_id_seq') THEN PERFORM setval('settings_id_seq', COALESCE((SELECT MAX(id) FROM settings), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_id_seq') THEN PERFORM setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'promo_codes_id_seq') THEN PERFORM setval('promo_codes_id_seq', COALESCE((SELECT MAX(id) FROM promo_codes), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reseller_packages_id_seq') THEN PERFORM setval('reseller_packages_id_seq', COALESCE((SELECT MAX(id) FROM reseller_packages), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'resellers_id_seq') THEN PERFORM setval('resellers_id_seq', COALESCE((SELECT MAX(id) FROM resellers), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'customer_key_pool_id_seq') THEN PERFORM setval('customer_key_pool_id_seq', COALESCE((SELECT MAX(id) FROM customer_key_pool), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reseller_key_pool_id_seq') THEN PERFORM setval('reseller_key_pool_id_seq', COALESCE((SELECT MAX(id) FROM reseller_key_pool), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'orders_id_seq') THEN PERFORM setval('orders_id_seq', COALESCE((SELECT MAX(id) FROM orders), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reseller_key_orders_id_seq') THEN PERFORM setval('reseller_key_orders_id_seq', COALESCE((SELECT MAX(id) FROM reseller_key_orders), 1)); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reseller_topups_id_seq') THEN PERFORM setval('reseller_topups_id_seq', COALESCE((SELECT MAX(id) FROM reseller_topups), 1)); END IF; END $$;
