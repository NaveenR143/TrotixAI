-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--

-- Name: apply_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.apply_status AS ENUM (
    'applied',
    'shortlisted',
    'interview_scheduled',
    'interview_completed',
    'offer_made',
    'hired',
    'rejected',
    'withdrawn'
);


--
-- Name: credit_tx_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.credit_tx_type AS ENUM (
    'signup_bonus',
    'purchase',
    'refund',
    'ai_resume_parse',
    'ai_job_match',
    'ai_candidate_match',
    'ai_skill_suggest',
    'ai_resume_builder',
    'ai_content_write',
    'ai_resume_improve',
    'admin_grant',
    'admin_deduct',
    'expiry'
);


--
-- Name: exp_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.exp_level AS ENUM (
    'entry',
    'junior',
    'mid',
    'senior',
    'lead',
    'executive'
);


--
-- Name: gender_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gender_type AS ENUM (
    'male',
    'female',
    'non_binary',
    'prefer_not_to_say'
);


--
-- Name: job_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_status AS ENUM (
    'draft',
    'active',
    'paused',
    'closed',
    'expired'
);


--
-- Name: job_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_type AS ENUM (
    'full_time',
    'part_time',
    'contract',
    'freelance',
    'internship'
);


--
-- Name: notif_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notif_type AS ENUM (
    'application_update',
    'job_match',
    'candidate_match',
    'credit_low',
    'credit_purchase',
    'message',
    'system'
);


--
-- Name: payment_gateway; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_gateway AS ENUM (
    'razorpay',
    'stripe',
    'paypal'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);


--
-- Name: project_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_type AS ENUM (
    'academic',
    'company',
    'personal'
);


--
-- Name: resume_section; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.resume_section AS ENUM (
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'awards',
    'languages',
    'custom'
);


--
-- Name: resume_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.resume_status AS ENUM (
    'queued',
    'processing',
    'completed',
    'failed'
);


--
-- Name: salary_currency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.salary_currency AS ENUM (
    'INR',
    'USD',
    'EUR',
    'GBP',
    'AED',
    'SGD'
);


--
-- Name: skill_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.skill_level AS ENUM (
    'beginner',
    'intermediate',
    'advanced',
    'expert'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'jobseeker',
    'recruiter',
    'admin',
    'consultant'
);


--
-- Name: user_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'suspended',
    'deleted',
    'pending_verification'
);


--
-- Name: work_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.work_mode AS ENUM (
    'onsite',
    'remote',
    'hybrid'
);


--
-- Name: add_credits(uuid, integer, public.credit_tx_type, text, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_credits(p_user_id uuid, p_amount integer, p_type public.credit_tx_type, p_description text, p_ref_id uuid DEFAULT NULL::uuid, p_ref_type text DEFAULT NULL::text) RETURNS integer
    LANGUAGE plpgsql
    AS $$    -- returns new balance
DECLARE
    v_wallet_id   UUID;
    v_new_balance INTEGER;
BEGIN
    SELECT id INTO v_wallet_id
    FROM credit_wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
    END IF;

    UPDATE credit_wallets
    SET balance        = balance + p_amount,
        lifetime_earned = lifetime_earned + p_amount,
        updated_at     = NOW()
    WHERE id = v_wallet_id
    RETURNING balance INTO v_new_balance;

    INSERT INTO credit_transactions
        (wallet_id, user_id, type, amount, balance_after, description, ref_id, ref_type)
    VALUES
        (v_wallet_id, p_user_id, p_type, p_amount, v_new_balance, p_description, p_ref_id, p_ref_type);

    RETURN v_new_balance;
END;
$$;


--
-- Name: deduct_credits(uuid, integer, public.credit_tx_type, text, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer, p_type public.credit_tx_type, p_description text, p_ref_id uuid DEFAULT NULL::uuid, p_ref_type text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_wallet_id     UUID;
    v_balance       INTEGER;
    v_new_balance   INTEGER;
BEGIN
    -- Lock the wallet row for this transaction
    SELECT id, balance INTO v_wallet_id, v_balance
    FROM credit_wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
    END IF;

    IF v_balance < p_amount THEN
        RETURN FALSE;  -- insufficient credits
    END IF;

    v_new_balance := v_balance - p_amount;

    UPDATE credit_wallets
    SET balance        = v_new_balance,
        lifetime_spent = lifetime_spent + p_amount,
        updated_at     = NOW()
    WHERE id = v_wallet_id;

    INSERT INTO credit_transactions
        (wallet_id, user_id, type, amount, balance_after, description, ref_id, ref_type)
    VALUES
        (v_wallet_id, p_user_id, p_type, -p_amount, v_new_balance, p_description, p_ref_id, p_ref_type);

    RETURN TRUE;
END;
$$;


--
-- Name: expire_old_jobs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.expire_old_jobs() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE rows_updated INTEGER;
BEGIN
    UPDATE jobs
    SET status = 'expired', closed_at = NOW()
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RETURN rows_updated;
END;
$$;


--
-- Name: grant_signup_credits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.grant_signup_credits() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    wallet_id INTEGER;  -- Γ£à changed from UUID ΓåÆ INTEGER
BEGIN
    INSERT INTO credit_wallets (user_id, balance, lifetime_earned)
    VALUES (NEW.id, 100, 100)
    RETURNING id INTO wallet_id;

    INSERT INTO credit_transactions (
        wallet_id,
        user_id,
        type,
        amount,
        balance_after,
        description
    )
    VALUES (
        wallet_id,
        NEW.id,
        'signup_bonus',
        100,
        100,
        'Welcome! 100 free credits on signup.'
    );

    RETURN NEW;
END;
$$;


--
-- Name: increment_job_views(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_job_views(p_job_id uuid, p_user_id uuid, p_ip_hash text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO job_views (job_id, user_id, ip_hash) VALUES (p_job_id, p_user_id, p_ip_hash);
    UPDATE jobs SET view_count = view_count + 1 WHERE id = p_job_id;
END;
$$;


--
-- Name: purge_expired_matches(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.purge_expired_matches() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM ai_job_matches       WHERE expires_at < NOW();
    DELETE FROM ai_candidate_matches WHERE expires_at < NOW();
    DELETE FROM skill_suggestions    WHERE expires_at < NOW();
END;
$$;


--
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
