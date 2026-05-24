-- Name: languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.languages (
    id integer NOT NULL,
    language text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: languages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.languages ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.languages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: oauth_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    provider text NOT NULL,
    provider_uid text NOT NULL,
    access_token text,
    refresh_token text,
    token_expires timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT oauth_accounts_provider_check CHECK ((provider = ANY (ARRAY['google'::text, 'linkedin'::text, 'github'::text])))
);


--
-- Name: project_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_skills (
    project_id integer NOT NULL,
    skill_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    url text,
    repo_url text,
    start_date date,
    end_date date,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    project_type public.project_type,
    skills_used text[],
    work_experience_id integer
);


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.projects ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: resumes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resumes (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    parsed_at timestamp with time zone,
    parsed_summary text,
    resume_embedding public.vector(384),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    mime_type text
);


--
-- Name: resumes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.resumes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.resumes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    name text NOT NULL,
    category text,
    aliases text[],
    is_trending boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.skills ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.skills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_languages (
    user_id uuid NOT NULL,
    language_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
