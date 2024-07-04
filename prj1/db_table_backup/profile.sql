PGDMP          	            |            boot %   14.11 (Ubuntu 14.11-0ubuntu0.22.04.1)    16.2     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    150614    boot    DATABASE     o   CREATE DATABASE boot WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE boot;
                scott    false            �            1259    355855    profile    TABLE     �   CREATE TABLE public.profile (
    id integer NOT NULL,
    username character varying(20) NOT NULL,
    password text NOT NULL,
    name character varying(20) NOT NULL,
    phone character varying(13) NOT NULL
);
    DROP TABLE public.profile;
       public         heap    scott    false            �            1259    355854    profile_id_seq    SEQUENCE     �   ALTER TABLE public.profile ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          scott    false    222            �          0    355855    profile 
   TABLE DATA           F   COPY public.profile (id, username, password, name, phone) FROM stdin;
    public          scott    false    222   I       �           0    0    profile_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.profile_id_seq', 19, true);
          public          scott    false    221                       2606    355865    profile profile_phone_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_phone_key UNIQUE (phone);
 C   ALTER TABLE ONLY public.profile DROP CONSTRAINT profile_phone_key;
       public            scott    false    222                       2606    355861    profile profile_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.profile DROP CONSTRAINT profile_pkey;
       public            scott    false    222                        2606    355863    profile profile_username_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_username_key UNIQUE (username);
 F   ALTER TABLE ONLY public.profile DROP CONSTRAINT profile_username_key;
       public            scott    false    222            �   �   x��ϻmC1@�Z���.i$=	H�,a!<��b�?�[�`�{@�P���45F�A��B�P���HjYH��Wr�̒;���5g����k��q����$�U���0��lƚ2��r�	X[�Q�ԱWW�Ri�yي'�T��(@Z=��A�;��;���q�1^]�f     