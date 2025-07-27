-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.badges (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    name character varying NOT NULL,
    description text,
    icon_url character varying,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        updated_at timestamp
    with
        time zone,
        CONSTRAINT badges_pkey PRIMARY KEY (id)
);

CREATE TABLE public.cities (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    name character varying NOT NULL UNIQUE,
    province character varying NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT cities_pkey PRIMARY KEY (id)
);

CREATE TABLE public.events (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        name character varying NOT NULL,
        location_id uuid DEFAULT gen_random_uuid (),
        description text,
        start_date timestamp
    with
        time zone,
        end_date timestamp
    with
        time zone,
        is_kid_friendly boolean,
        views bigint,
        image_url character varying,
        city_id uuid,
        province_id uuid,
        user_id uuid,
        CONSTRAINT events_pkey PRIMARY KEY (id),
        CONSTRAINT events_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities (id),
        CONSTRAINT events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
        CONSTRAINT events_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations (id),
        CONSTRAINT events_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces (id)
);

CREATE TABLE public.locations (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    name character varying NOT NULL,
    city_id uuid,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT locations_pkey PRIMARY KEY (id),
        CONSTRAINT locations_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities (id)
);

CREATE TABLE public.messages (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    thread_id uuid DEFAULT gen_random_uuid (),
    content text,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT messages_pkey PRIMARY KEY (id),
        CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads (id)
);

CREATE TABLE public.provinces (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    name character varying NOT NULL,
    description text,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT provinces_pkey PRIMARY KEY (id)
);

CREATE TABLE public.threads (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        title character varying NOT NULL,
        event_id uuid DEFAULT gen_random_uuid (),
        status character varying,
        CONSTRAINT threads_pkey PRIMARY KEY (id)
);

CREATE TABLE public.users_badge (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid DEFAULT gen_random_uuid (),
    badge_id uuid DEFAULT gen_random_uuid (),
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT users_badge_pkey PRIMARY KEY (id),
        CONSTRAINT users_badge_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
        CONSTRAINT users_badge_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges (id)
);

CREATE TABLE public.users_profile (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid DEFAULT gen_random_uuid (),
    fullname character varying,
    bio text,
    avatar_url character varying,
    identity_image_url character varying,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT users_profile_pkey PRIMARY KEY (id),
        CONSTRAINT users_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);