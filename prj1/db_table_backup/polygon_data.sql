PGDMP  
                    |            boot %   14.11 (Ubuntu 14.11-0ubuntu0.22.04.1)    16.2 	    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    150614    boot    DATABASE     o   CREATE DATABASE boot WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE boot;
                scott    false            �            1259    297056    polygon_data    TABLE     �  CREATE TABLE public.polygon_data (
    id integer NOT NULL,
    area bigint,
    round bigint,
    develop_value integer,
    conserve_value integer,
    value_comp integer,
    geom public.geometry(Polygon,3857),
    slope_poly integer,
    height_poly integer,
    dist_gi_str_poly integer,
    dist_gong_ntwk_poly integer,
    rate_city_poly integer,
    rate_city_touch_poly integer,
    dist_road_touch_poly integer,
    rate_kyungji_poly integer,
    rate_saengtae_poly integer,
    rate_gongjuck_poly integer,
    dist_gongjuck_poly integer,
    rate_jdgarea_poly integer,
    rate_nongup_poly integer,
    rate_limsangdo_poly integer,
    rate_bojunmount_poly integer,
    dist_kyungji_poly integer
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
            public          scott    false    220            �          0    297056    polygon_data 
   TABLE DATA           �  COPY public.polygon_data (id, area, round, develop_value, conserve_value, value_comp, geom, slope_poly, height_poly, dist_gi_str_poly, dist_gong_ntwk_poly, rate_city_poly, rate_city_touch_poly, dist_road_touch_poly, rate_kyungji_poly, rate_saengtae_poly, rate_gongjuck_poly, dist_gongjuck_poly, rate_jdgarea_poly, rate_nongup_poly, rate_limsangdo_poly, rate_bojunmount_poly, dist_kyungji_poly) FROM stdin;
    public          scott    false    220   X       �           0    0    polygon_data_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.polygon_data_id_seq', 53, true);
          public          scott    false    219                       2606    297062    polygon_data polygon_data_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.polygon_data
    ADD CONSTRAINT polygon_data_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.polygon_data DROP CONSTRAINT polygon_data_pkey;
       public            scott    false    220            �      x������ � �     