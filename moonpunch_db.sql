--
-- PostgreSQL database dump
--

\restrict OTqPSoCz9bzfmHpSWyw0xwVbAtqEFCaQD2d84viGqEToHyU1wg6MVCwaWxDb7Dj

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

-- Started on 2026-04-13 15:22:10

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

--
-- TOC entry 863 (class 1247 OID 24634)
-- Name: LicenseType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LicenseType" AS ENUM (
    'standard',
    'premium',
    'enterprise'
);


ALTER TYPE public."LicenseType" OWNER TO postgres;

--
-- TOC entry 857 (class 1247 OID 24620)
-- Name: MediaType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MediaType" AS ENUM (
    'image',
    'video'
);


ALTER TYPE public."MediaType" OWNER TO postgres;

--
-- TOC entry 854 (class 1247 OID 24612)
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE public."ProductStatus" OWNER TO postgres;

--
-- TOC entry 851 (class 1247 OID 24605)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'user',
    'moderator',
    'admin'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- TOC entry 860 (class 1247 OID 24626)
-- Name: SubscriptionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionType" AS ENUM (
    'beta_tester',
    'early_access',
    'newsletter'
);


ALTER TYPE public."SubscriptionType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 24593)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 24653)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    color_hex character varying(7)
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24681)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    user_id uuid,
    content text NOT NULL,
    rating integer,
    is_approved boolean DEFAULT false NOT NULL,
    parent_id uuid,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24699)
-- Name: licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.licenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    license_key character varying(255) NOT NULL,
    license_type public."LicenseType" DEFAULT 'standard'::public."LicenseType" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    activated_at timestamp(3) without time zone,
    expires_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.licenses OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24671)
-- Name: product_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    media_type public."MediaType" NOT NULL,
    url text NOT NULL,
    caption character varying(255),
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_media OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 24659)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    project_explanation text NOT NULL,
    short_description character varying(500),
    video_url text,
    thumbnail_url text,
    category_id uuid,
    status public."ProductStatus" DEFAULT 'draft'::public."ProductStatus" NOT NULL,
    release_date date,
    store_url text,
    download_count integer DEFAULT 0 NOT NULL,
    avg_rating numeric(3,2) DEFAULT 0.00 NOT NULL,
    created_by uuid,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24708)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    refresh_token text NOT NULL,
    ip_address character varying(45),
    user_agent text,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24691)
-- Name: subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    subscription_type public."SubscriptionType" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    subscribed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    unsubscribed_at timestamp(3) without time zone
);


ALTER TABLE public.subscribers OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 24641)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255),
    role public."Role" DEFAULT 'user'::public."Role" NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(20),
    avatar_url text,
    bio text,
    oauth_provider character varying(50),
    oauth_id character varying(255),
    is_verified boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4896 (class 0 OID 24593)
-- Dependencies: 215
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c0ebe40e-dbf1-41bc-abed-8a0437e30ef1	9b3e5edf06544717434285c3a64e3094b192f644811b877b5461b3cafa285ba0	2026-04-13 13:21:55.009117+03	20260413102154_init	\N	\N	2026-04-13 13:21:54.891223+03	1
\.


--
-- TOC entry 4898 (class 0 OID 24653)
-- Dependencies: 217
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, color_hex) FROM stdin;
6ee0fbfb-5770-4771-8c31-778ee9de4e22	Game	game	#ff4500
4077b8de-7143-4e71-8932-7dcc24d46b15	Software	software	#007bff
13430098-2414-4950-9c08-4c0f0c6a6e61	Tool	tool	#28a745
\.


--
-- TOC entry 4901 (class 0 OID 24681)
-- Dependencies: 220
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, product_id, user_id, content, rating, is_approved, parent_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4903 (class 0 OID 24699)
-- Dependencies: 222
-- Data for Name: licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.licenses (id, user_id, product_id, license_key, license_type, is_active, activated_at, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 4900 (class 0 OID 24671)
-- Dependencies: 219
-- Data for Name: product_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_media (id, product_id, media_type, url, caption, sort_order, created_at) FROM stdin;
\.


--
-- TOC entry 4899 (class 0 OID 24659)
-- Dependencies: 218
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, project_name, slug, project_explanation, short_description, video_url, thumbnail_url, category_id, status, release_date, store_url, download_count, avg_rating, created_by, created_at, updated_at) FROM stdin;
21e4bc9d-db37-4eb8-99d7-eee33d808273	Kavunn	kavunn	An immersive action adventure set in a handcrafted world with deep combat mechanics. Built with Unreal Engine and crafted over 3 years of passionate development.	Our flagship action adventure title.	https://www.youtube.com/embed/dQw4w9WgXcQ	/assets/img/portfolio/1.jpg	6ee0fbfb-5770-4771-8c31-778ee9de4e22	published	2024-01-01	https://store.steampowered.com/	0	0.00	\N	2026-04-13 10:22:45.829	2026-04-13 10:22:45.829
\.


--
-- TOC entry 4904 (class 0 OID 24708)
-- Dependencies: 223
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, refresh_token, ip_address, user_agent, expires_at, created_at) FROM stdin;
cb421ba6-88b8-4df3-b8d6-9d5073e655c0	999b6b15-3d80-4f80-9451-2e3e6ede7452	$2b$08$Yhpk21Mst6pWByXsgpPBv.3qSP.wxq3ozHS4rMCRwJXF7VHqc2beO	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 OPR/129.0.0.0	2026-04-20 10:57:14.657	2026-04-13 10:57:14.658
734b058b-0bc4-4097-860a-19b611cdbc8c	999b6b15-3d80-4f80-9451-2e3e6ede7452	$2b$08$6oajzlT.9W9mpflPsLO2EOnIuGumP86qqmbot2orr4nfHDHIq2fDG	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 OPR/129.0.0.0	2026-04-20 11:27:30.375	2026-04-13 11:27:30.377
7d4339fc-26d8-4c8f-9ba8-921d5ed6a06d	999b6b15-3d80-4f80-9451-2e3e6ede7452	$2b$08$fO89n/lCfX4I/R1Ljtbcx.QOkLBEjlHxqvo8HMAbYNWd0t7BvQAmC	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 OPR/129.0.0.0	2026-04-20 11:32:22.076	2026-04-13 11:32:22.077
43711020-c2a8-4042-922d-c3ce7cea0ee6	999b6b15-3d80-4f80-9451-2e3e6ede7452	$2b$08$.ZS4ymQARbJL2wXu3Je6y.DiCCzRdfHDlxtjG7cAc7V9GYoWS/viy	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 OPR/129.0.0.0	2026-04-20 11:32:58.99	2026-04-13 11:32:58.991
2e809cd7-d4ea-4ce1-bc50-0ce65cc0a07d	999b6b15-3d80-4f80-9451-2e3e6ede7452	$2b$08$vaaaNlNlUbblAXKoLPrICOtEmeTNIW3.PMmxtdrQlO4xizz8Fz612	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 OPR/129.0.0.0	2026-04-20 12:11:34.307	2026-04-13 12:11:34.309
\.


--
-- TOC entry 4902 (class 0 OID 24691)
-- Dependencies: 221
-- Data for Name: subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscribers (id, user_id, product_id, subscription_type, is_active, subscribed_at, unsubscribed_at) FROM stdin;
\.


--
-- TOC entry 4897 (class 0 OID 24641)
-- Dependencies: 216
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, username, password_hash, role, first_name, last_name, phone, avatar_url, bio, oauth_provider, oauth_id, is_verified, is_active, last_login_at, created_at, updated_at) FROM stdin;
999b6b15-3d80-4f80-9451-2e3e6ede7452	admin@moonpunch.com	moonpunch_admin	$2b$12$/0ps1MsiQM4lcb0uGnTnbeY5umMN4y3TZtGk1UjAk8pDUHU.7.RSe	admin	MOON	PUNCH	\N	\N	\N	\N	\N	t	t	2026-04-13 12:11:34.274	2026-04-13 10:22:45.82	2026-04-13 12:11:34.276
\.


--
-- TOC entry 4709 (class 2606 OID 24601)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4717 (class 2606 OID 24658)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4730 (class 2606 OID 24690)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4738 (class 2606 OID 24707)
-- Name: licenses licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);


--
-- TOC entry 4727 (class 2606 OID 24680)
-- Name: product_media product_media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_media
    ADD CONSTRAINT product_media_pkey PRIMARY KEY (id);


--
-- TOC entry 4721 (class 2606 OID 24670)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4740 (class 2606 OID 24716)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4734 (class 2606 OID 24698)
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- TOC entry 4713 (class 2606 OID 24652)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4715 (class 1259 OID 24720)
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- TOC entry 4718 (class 1259 OID 24721)
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- TOC entry 4728 (class 1259 OID 24729)
-- Name: comments_is_approved_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comments_is_approved_idx ON public.comments USING btree (is_approved);


--
-- TOC entry 4731 (class 1259 OID 24727)
-- Name: comments_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comments_product_id_idx ON public.comments USING btree (product_id);


--
-- TOC entry 4732 (class 1259 OID 24728)
-- Name: comments_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comments_user_id_idx ON public.comments USING btree (user_id);


--
-- TOC entry 4736 (class 1259 OID 24731)
-- Name: licenses_license_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX licenses_license_key_key ON public.licenses USING btree (license_key);


--
-- TOC entry 4719 (class 1259 OID 24724)
-- Name: products_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);


--
-- TOC entry 4722 (class 1259 OID 24726)
-- Name: products_release_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_release_date_idx ON public.products USING btree (release_date);


--
-- TOC entry 4723 (class 1259 OID 24723)
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- TOC entry 4724 (class 1259 OID 24722)
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- TOC entry 4725 (class 1259 OID 24725)
-- Name: products_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_status_idx ON public.products USING btree (status);


--
-- TOC entry 4741 (class 1259 OID 24732)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- TOC entry 4735 (class 1259 OID 24730)
-- Name: subscribers_user_id_product_id_subscription_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX subscribers_user_id_product_id_subscription_type_key ON public.subscribers USING btree (user_id, product_id, subscription_type);


--
-- TOC entry 4710 (class 1259 OID 24717)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 4711 (class 1259 OID 24719)
-- Name: users_oauth_provider_oauth_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_oauth_provider_oauth_id_idx ON public.users USING btree (oauth_provider, oauth_id);


--
-- TOC entry 4714 (class 1259 OID 24718)
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- TOC entry 4745 (class 2606 OID 24758)
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4746 (class 2606 OID 24748)
-- Name: comments comments_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4747 (class 2606 OID 24753)
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4750 (class 2606 OID 24778)
-- Name: licenses licenses_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4751 (class 2606 OID 24773)
-- Name: licenses licenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4744 (class 2606 OID 24743)
-- Name: product_media product_media_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_media
    ADD CONSTRAINT product_media_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4742 (class 2606 OID 24733)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4743 (class 2606 OID 24738)
-- Name: products products_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4752 (class 2606 OID 24783)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4748 (class 2606 OID 24768)
-- Name: subscribers subscribers_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4749 (class 2606 OID 24763)
-- Name: subscribers subscribers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-04-13 15:22:10

--
-- PostgreSQL database dump complete
--

\unrestrict OTqPSoCz9bzfmHpSWyw0xwVbAtqEFCaQD2d84viGqEToHyU1wg6MVCwaWxDb7Dj

