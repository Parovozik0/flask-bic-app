--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

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
-- Name: container_status; Type: TYPE; Schema: public
--

CREATE TYPE public.container_status AS ENUM (
    'В Китае',
    'Направлен в Россию',
    'В России',
    'Направлен в Китай'
);

--
-- Name: KPs; Type: TABLE; Schema: public
--

CREATE TABLE public."KPs" (
    number text NOT NULL,
    location text,
    notes text
);

--
-- Name: bookings; Type: TABLE; Schema: public
--

CREATE TABLE public.bookings (
    number text NOT NULL,
    notes text,
    lading text
);

--
-- Name: containers; Type: TABLE; Schema: public
--

CREATE TABLE public.containers (
    number text NOT NULL,
    location text,
    booking text,
    "KP" text,
    notes text,
    chronology text,
    delivery_date date,
    pickup_date date,
    status public.container_status DEFAULT 'В Китае'::public.container_status,
    CONSTRAINT valid_container_number CHECK ((number ~ '^[A-Z]{4}[0-9]{7}$'::text))
);

--
-- Data for Name: KPs; Type: TABLE DATA; Schema: public
--

COPY public."KPs" (number, location, notes) FROM stdin;
123-3321	\N	\N
KP-TRANS-2501	\N	\N
KP-2025-08-09	\N	\N
KP-LOG-25007	\N	\N
KP-25-MAR-005	\N	\N
KP-XYZ-2025	\N	\N
KP-250310-01	\N	\N
KP-AX-25034	\N	\N
KP-03-25-012	\N	\N
KP-2025-001	\N	\N
123	\N	\N
\.

--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public
--

COPY public.bookings (number, notes, lading) FROM stdin;
HD-312	\N	\N
\.

--
-- Data for Name: containers; Type: TABLE DATA; Schema: public
--

COPY public.containers (number, location, booking, "KP", notes, chronology, delivery_date, pickup_date, status) FROM stdin;
RXTU4541757	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU1234952	Shanghai	HD-312	KP-TRANS-2501	Уехал, скоро вернётся	\N	2025-03-11	2025-03-27	Направлен в Китай
RXTU4544381	Shanghai	HD-312	123-3321	\N	\N	2025-03-11	2025-03-28	Направлен в Китай
RXTU4541309	Shanghai	HD-312	KP-LOG-25007	\N	\N	\N	\N	Направлен в Китай
RXTU4544680	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4547610	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4547605	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541021	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541356	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4540940	Shanghai	HD-312	123-3321	\N	\N	2025-03-19	2025-03-29	Направлен в Китай
RXTU4541438	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU2059345	\N	\N	123	\N	\N	\N	\N	Направлен в Китай
RXTU2059343	\N	\N	123	\N	\N	\N	\N	Направлен в Китай
RXTU2058210	\N	\N	123	\N	\N	\N	\N	Направлен в Китай
RXTU4540494	\N	\N	\N	\N	\N	\N	\N	Направлен в Россию
RXTU4541187	\N	\N	\N	\N	\N	\N	\N	В России
RXTU4541248	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541090	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4544355	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541119	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4544653	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4544611	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4544709	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541295	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541192	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4540832	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541551	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU7283945	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4544972	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541823	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541320	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
TCLU1935357	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4548303	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541865	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4547708	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4548540	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541530	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4540621	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4540874	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
FESU2126250	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4544550	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4540982	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4544442	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RTXU7834819	\N	\N	\N	\N	\N	\N	\N	В Китае
RTXU7834818	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541171	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540658	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540637	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541042	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540452	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540597	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541079	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540811	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540895	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540977	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540935	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541401	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541063	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540730	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541037	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540998	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540473	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540540	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540909	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540750	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540869	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540719	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541335	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540679	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540703	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541150	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU2059330	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541103	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540956	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540787	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540431	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540581	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU2059371	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541124	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541166	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541016	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540447	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540827	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541280	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540489	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540642	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541269	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540792	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540853	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541227	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540508	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540555	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540914	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541145	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540600	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541084	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541000	\N	\N	\N	\N	\N	\N	\N	В Китае
CAXU6324187	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4540771	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540920	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541417	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540426	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541211	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541340	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540513	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540684	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540576	\N	\N	\N	\N	\N	\N	\N	В Китае
GLDU5745240	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4540616	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540663	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541206	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540766	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541361	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541377	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540690	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540880	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541382	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540806	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540961	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU2059427	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4540534	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540560	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540848	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4540529	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541593	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541741	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541628	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541696	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541654	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541490	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541567	\N	\N	\N	\N	\N	\N	\N	В Китае
GLDU5740593	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541660	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541736	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541905	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541802	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541464	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU3427384	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU2039485	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU6473648	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU2563748	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU2748395	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU2748392	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU1234567	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541130	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541232	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4545454	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4548108	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU7654321	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4394675	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4394657	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU7635489	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU2345820	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU2059323	\N	\N	123	\N	\N	\N	\N	В Китае
RXTU4834536	\N	\N	123	\N	\N	\N	\N	Направлен в Китай
RXTU1983456	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU7263849	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU7283641	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU2312452	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU7384658	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4234578	\N	\N	\N	\N	\N	\N	\N	В Китае
RXTU4541459	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4540468	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
GLDU5577850	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4540724	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4547950	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4548237	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4545006	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4544946	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4548068	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4547863	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4548520	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4544503	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4544165	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4544231	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4540745	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541546	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4544571	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU4541253	Shanghai	HD-312	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU2058190	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU2058903	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU2059242	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
RXTU2059140	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
TRHU1706602	Гуандун	\N	123-3321	\N	\N	\N	\N	Направлен в Китай
\.

--
-- Name: KPs KPs_pkey; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public."KPs"
    ADD CONSTRAINT "KPs_pkey" PRIMARY KEY (number);

--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (number);

--
-- Name: containers containers_number_number1_key; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT containers_number_number1_key UNIQUE (number) INCLUDE (number);

--
-- Name: containers containers_pkey; Type: CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT containers_pkey PRIMARY KEY (number);

--
-- Name: containers containers_KP_fkey; Type: FK CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT "containers_KP_fkey" FOREIGN KEY ("KP") REFERENCES public."KPs"(number) ON UPDATE CASCADE ON DELETE SET NULL NOT VALID;

--
-- Name: containers containers_booking_fkey; Type: FK CONSTRAINT; Schema: public
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT containers_booking_fkey FOREIGN KEY (booking) REFERENCES public.bookings(number) ON UPDATE CASCADE ON DELETE SET NULL NOT VALID;

--
-- PostgreSQL database dump complete
--