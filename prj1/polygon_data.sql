PGDMP      "    	            |            boot %   14.11 (Ubuntu 14.11-0ubuntu0.22.04.1)    16.2 	    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    150614    boot    DATABASE     o   CREATE DATABASE boot WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE boot;
                scott    false            �            1259    297056    polygon_data    TABLE     �   CREATE TABLE public.polygon_data (
    id integer NOT NULL,
    area bigint,
    round bigint,
    develop_value integer,
    conserve_value integer,
    value_comp integer,
    geom public.geometry(Polygon,3857)
);
     DROP TABLE public.polygon_data;
       public         heap    scott    false            �            1259    297055    polygon_data_id_seq    SEQUENCE     �   ALTER TABLE public.polygon_data ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.polygon_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          scott    false    246            �          0    297056    polygon_data 
   TABLE DATA           h   COPY public.polygon_data (id, area, round, develop_value, conserve_value, value_comp, geom) FROM stdin;
    public          scott    false    246   <	       �           0    0    polygon_data_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.polygon_data_id_seq', 31, true);
          public          scott    false    245                       2606    297062    polygon_data polygon_data_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.polygon_data
    ADD CONSTRAINT polygon_data_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.polygon_data DROP CONSTRAINT polygon_data_pkey;
       public            scott    false    246            �      x������ � �     