-- Name: trigger_set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: certifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certifications (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    issuer text,
    issue_date date,
    expiry_date date,
    credential_id text,
    credential_url text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: certifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.certifications ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.certifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name text NOT NULL,
    logo_url text,
    website text,
    industry text,
    size_range text,
    founded_year integer,
    description text,
    headquarters text,
    linkedin_url text,
    is_verified boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.companies ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: credit_packs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_packs (
    id integer NOT NULL,
    name text NOT NULL,
    credits integer NOT NULL,
    bonus_credits integer DEFAULT 0 NOT NULL,
    price numeric(10,2) NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    is_popular boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: credit_packs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.credit_packs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.credit_packs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: credit_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_transactions (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    wallet_id integer,
    type public.credit_tx_type NOT NULL,
    amount integer NOT NULL,
    balance_after integer NOT NULL,
    description text,
    ref_id uuid,
    ref_type text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: credit_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.credit_transactions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.credit_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: credit_wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_wallets (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    lifetime_earned integer DEFAULT 0 NOT NULL,
    lifetime_spent integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT credit_wallets_balance_check CHECK ((balance >= 0))
);


--
-- Name: credit_wallets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.credit_wallets ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.credit_wallets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: education; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.education (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    institution text NOT NULL,
    degree text,
    field_of_study text,
    grade text,
    start_year integer,
    end_year integer,
    is_current boolean DEFAULT false,
    description text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: education_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.education ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.education_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: jobseeker_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobseeker_profiles (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    headline text,
    summary text,
    gender public.gender_type,
    date_of_birth date,
    current_location text,
    preferred_locations text[],
    years_of_experience numeric(4,1),
    notice_period_days integer,
    current_salary numeric(12,2),
    expected_salary numeric(12,2),
    salary_currency public.salary_currency DEFAULT 'INR'::public.salary_currency,
    is_actively_looking boolean DEFAULT true,
    linkedin_url text,
    github_url text,
    portfolio_url text,
    profile_completion integer DEFAULT 0,
    profile_embedding public.vector(1536),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT jobseeker_profiles_profile_completion_check CHECK (((profile_completion >= 0) AND (profile_completion <= 100)))
);


--
-- Name: jobseeker_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.jobseeker_profiles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.jobseeker_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: jobseeker_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobseeker_skills (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    level public.skill_level DEFAULT 'intermediate'::public.skill_level,
    years numeric(4,1),
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    skill_id integer
);


--
-- Name: jobseeker_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.jobseeker_skills ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.jobseeker_skills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
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
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text,
    phone text CONSTRAINT users_mobile_not_null NOT NULL,
    role public.user_role DEFAULT 'jobseeker'::public.user_role NOT NULL,
    status public.user_status DEFAULT 'pending_verification'::public.user_status NOT NULL,
    full_name text,
    avatar_url text,
    is_email_verified boolean DEFAULT false,
    is_phone_verified boolean DEFAULT false,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    resume_status public.resume_status DEFAULT 'queued'::public.resume_status NOT NULL
);


--
-- Name: work_experiences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_experiences (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    location text,
    start_date date NOT NULL,
    end_date date,
    is_current boolean DEFAULT false,
    description text,
    skills_used text[],
    achievements text[],
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    company_id integer
);


--
-- Name: work_experiences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.work_experiences ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.work_experiences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: work_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_skills (
    created_at timestamp with time zone DEFAULT now(),
    work_id integer NOT NULL,
    skill_id integer NOT NULL
);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: credit_packs credit_packs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_packs
    ADD CONSTRAINT credit_packs_pkey PRIMARY KEY (id);


--
-- Name: credit_transactions credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_pkey PRIMARY KEY (id);


--
-- Name: credit_wallets credit_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_wallets
    ADD CONSTRAINT credit_wallets_pkey PRIMARY KEY (id);


--
-- Name: credit_wallets credit_wallets_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_wallets
    ADD CONSTRAINT credit_wallets_user_id_key UNIQUE (user_id);


--
-- Name: education education_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education
    ADD CONSTRAINT education_pkey PRIMARY KEY (id);


--
-- Name: jobseeker_profiles jobseeker_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobseeker_profiles
    ADD CONSTRAINT jobseeker_profiles_pkey PRIMARY KEY (id);


--
-- Name: jobseeker_profiles jobseeker_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobseeker_profiles
    ADD CONSTRAINT jobseeker_profiles_user_id_key UNIQUE (user_id);


--
-- Name: jobseeker_skills jobseeker_skill_id_user_id_ukey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobseeker_skills
    ADD CONSTRAINT jobseeker_skill_id_user_id_ukey UNIQUE (user_id, skill_id);


--
-- Name: jobseeker_skills jobseeker_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobseeker_skills
    ADD CONSTRAINT jobseeker_skills_pkey PRIMARY KEY (id);


--
-- Name: languages languages_language_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_language_key UNIQUE (language);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- Name: oauth_accounts oauth_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_pkey PRIMARY KEY (id);


--
-- Name: oauth_accounts oauth_accounts_provider_provider_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_provider_provider_uid_key UNIQUE (provider, provider_uid);


--
-- Name: project_skills project_skill_id_project_id_ukey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skill_id_project_id_ukey UNIQUE (project_id, skill_id);


--
-- Name: project_skills project_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skills_pkey PRIMARY KEY (project_id, skill_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: resumes resumes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_pkey PRIMARY KEY (id);


--
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: resumes user_file; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT user_file UNIQUE (user_id) INCLUDE (file_name, file_url);


--
-- Name: user_languages user_languages_user_id_language_id_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_languages
    ADD CONSTRAINT user_languages_user_id_language_id_pkey PRIMARY KEY (user_id, language_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: work_experiences work_experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_experiences
    ADD CONSTRAINT work_experiences_pkey PRIMARY KEY (id);


--
-- Name: work_skills work_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_skills
    ADD CONSTRAINT work_skills_pkey PRIMARY KEY (work_id, skill_id);


--
-- Name: idx_cert_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cert_user ON public.certifications USING btree (user_id) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_companies_fts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_fts ON public.companies USING gin (to_tsvector('english'::regconfig, ((COALESCE(name, ''::text) || ' '::text) || COALESCE(description, ''::text)))) WITH (fastupdate='true', gin_pending_list_limit='4194304');


--
-- Name: idx_companies_industry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_industry ON public.companies USING btree (industry) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_companies_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_verified ON public.companies USING btree (is_verified) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_ctx_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ctx_created ON public.credit_transactions USING btree (created_at DESC) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_ctx_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ctx_type ON public.credit_transactions USING btree (type) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_ctx_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ctx_user ON public.credit_transactions USING btree (user_id) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_edu_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_edu_user ON public.education USING btree (user_id) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_exp_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exp_user ON public.work_experiences USING btree (user_id) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_js_embedding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_js_embedding ON public.jobseeker_profiles USING hnsw (profile_embedding public.vector_cosine_ops);


--
-- Name: idx_js_experience; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_js_experience ON public.jobseeker_profiles USING btree (years_of_experience) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_js_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_js_location ON public.jobseeker_profiles USING btree (current_location) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_js_looking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_js_looking ON public.jobseeker_profiles USING btree (is_actively_looking) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_js_skills_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_js_skills_user ON public.jobseeker_skills USING btree (user_id) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_js_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_js_user ON public.jobseeker_profiles USING btree (user_id) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_languages_language; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_languages_language ON public.languages USING btree (language) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_oauth_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_oauth_user ON public.oauth_accounts USING btree (user_id);


--
-- Name: idx_projects_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_user ON public.projects USING btree (user_id) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_resumes_emb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resumes_emb ON public.resumes USING hnsw (resume_embedding public.vector_cosine_ops);


--
-- Name: idx_resumes_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resumes_user ON public.resumes USING btree (user_id) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_skills_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skills_category ON public.skills USING btree (category) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_skills_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skills_name ON public.skills USING btree (name) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_skills_trending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skills_trending ON public.skills USING btree (is_trending) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: idx_skills_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skills_trgm ON public.skills USING gin (name public.gin_trgm_ops) WITH (fastupdate='true', gin_pending_list_limit='4194304');


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: idx_wallet_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wallet_user ON public.credit_wallets USING btree (user_id) WITH (fillfactor='100', deduplicate_items='true');


--
-- Name: companies trg_companies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: credit_wallets trg_credit_wallets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_credit_wallets_updated_at BEFORE UPDATE ON public.credit_wallets FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: jobseeker_profiles trg_jobseeker_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_jobseeker_profiles_updated_at BEFORE UPDATE ON public.jobseeker_profiles FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: resumes trg_resumes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: users trg_user_signup_credits; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_user_signup_credits AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.grant_signup_credits();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: certifications certifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: companies companies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: credit_transactions credit_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: credit_transactions credit_transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.credit_wallets(id) NOT VALID;


--
-- Name: credit_wallets credit_wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_wallets
    ADD CONSTRAINT credit_wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: education education_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.education
    ADD CONSTRAINT education_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: jobseeker_profiles jobseeker_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobseeker_profiles
    ADD CONSTRAINT jobseeker_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: jobseeker_skills jobseeker_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobseeker_skills
    ADD CONSTRAINT jobseeker_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) NOT VALID;


--
-- Name: jobseeker_skills jobseeker_skills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobseeker_skills
    ADD CONSTRAINT jobseeker_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: oauth_accounts oauth_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_skills project_skills_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skills_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) NOT VALID;


--
-- Name: project_skills project_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) NOT VALID;


--
-- Name: projects projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_work_experience_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_work_experience_id_fkey FOREIGN KEY (work_experience_id) REFERENCES public.work_experiences(id) NOT VALID;


--
-- Name: resumes resumes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_languages user_languages_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_languages
    ADD CONSTRAINT user_languages_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id) NOT VALID;


--
-- Name: user_languages user_languages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_languages
    ADD CONSTRAINT user_languages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) NOT VALID;


--
-- Name: work_experiences work_experiences_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_experiences
    ADD CONSTRAINT work_experiences_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) NOT VALID;


--
-- Name: work_experiences work_experiences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_experiences
    ADD CONSTRAINT work_experiences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: work_skills work_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_skills
    ADD CONSTRAINT work_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) NOT VALID;


--
-- Name: work_skills work_skills_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_skills
    ADD CONSTRAINT work_skills_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.work_experiences(id) NOT VALID;


--
-- PostgreSQL database dump complete
--

\unrestrict gvpRmAlnjZ8ohQqpRcQWCtbQ4BkX7xXKNwWieWQsRpHMezauc6A4RdfNcXFFm7c
