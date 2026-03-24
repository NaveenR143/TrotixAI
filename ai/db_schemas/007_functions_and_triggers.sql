-- ============================================================
-- migrations/007_functions_and_triggers.sql
-- ============================================================

-- ── Auto-update updated_at on any table ──────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$ DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'companies', 'recruiter_profiles', 'jobseeker_profiles',
        'resumes', 'resume_builder_docs', 'resume_builder_sections',
        'jobs', 'applications', 'credit_wallets', 'payment_orders',
        'ai_feature_pricing'
    ]
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %s
             FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
            t, t
        );
    END LOOP;
END $$;


-- ── Grant 100 free credits on new user signup ─────────────────────────────────
CREATE OR REPLACE FUNCTION grant_signup_credits()
RETURNS TRIGGER AS $$
DECLARE
    wallet_id UUID;
BEGIN
    -- Create wallet
    INSERT INTO credit_wallets (user_id, balance, lifetime_earned)
    VALUES (NEW.id, 100, 100)
    RETURNING id INTO wallet_id;

    -- Record the transaction
    INSERT INTO credit_transactions (wallet_id, user_id, type, amount, balance_after, description)
    VALUES (wallet_id, NEW.id, 'signup_bonus', 100, 100, 'Welcome! 100 free credits on signup.');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_signup_credits
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION grant_signup_credits();


-- ── Deduct credits safely (returns FALSE if insufficient balance) ─────────────
CREATE OR REPLACE FUNCTION deduct_credits(
    p_user_id       UUID,
    p_amount        INTEGER,
    p_type          credit_tx_type,
    p_description   TEXT,
    p_ref_id        UUID    DEFAULT NULL,
    p_ref_type      TEXT    DEFAULT NULL
)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;


-- ── Add credits (after payment or admin grant) ────────────────────────────────
CREATE OR REPLACE FUNCTION add_credits(
    p_user_id       UUID,
    p_amount        INTEGER,
    p_type          credit_tx_type,
    p_description   TEXT,
    p_ref_id        UUID    DEFAULT NULL,
    p_ref_type      TEXT    DEFAULT NULL
)
RETURNS INTEGER AS $$    -- returns new balance
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
$$ LANGUAGE plpgsql;


-- ── Increment job view count ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_job_views(p_job_id UUID, p_user_id UUID, p_ip_hash TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO job_views (job_id, user_id, ip_hash) VALUES (p_job_id, p_user_id, p_ip_hash);
    UPDATE jobs SET view_count = view_count + 1 WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;


-- ── Expire stale jobs daily (call via pg_cron or app scheduler) ───────────────
CREATE OR REPLACE FUNCTION expire_old_jobs()
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;


-- ── Expire stale AI match caches ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION purge_expired_matches()
RETURNS VOID AS $$
BEGIN
    DELETE FROM ai_job_matches       WHERE expires_at < NOW();
    DELETE FROM ai_candidate_matches WHERE expires_at < NOW();
    DELETE FROM skill_suggestions    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;


-- ── Useful views ──────────────────────────────────────────────────────────────

-- Active jobs with company info
CREATE OR REPLACE VIEW v_active_jobs AS
SELECT
    j.*,
    c.name          AS company_name,
    c.logo_url      AS company_logo,
    c.is_verified   AS company_verified,
    u.full_name     AS recruiter_name
FROM jobs j
LEFT JOIN companies c ON j.company_id = c.id
LEFT JOIN users     u ON j.recruiter_id = u.id
WHERE j.status = 'active';


-- Jobseeker full profile
CREATE OR REPLACE VIEW v_jobseeker_profiles AS
SELECT
    u.id,
    u.full_name,
    u.email,
    u.avatar_url,
    jp.*,
    ARRAY(
        SELECT s.name FROM jobseeker_skills js
        JOIN   skills s ON js.skill_id = s.id
        WHERE  js.user_id = u.id AND js.is_primary = TRUE
    ) AS primary_skills,
    (SELECT id FROM resumes WHERE user_id = u.id AND is_primary = TRUE LIMIT 1) AS primary_resume_id
FROM users u
JOIN jobseeker_profiles jp ON jp.user_id = u.id
WHERE u.role = 'jobseeker' AND u.status = 'active';


-- Application pipeline for recruiter dashboard
CREATE OR REPLACE VIEW v_application_pipeline AS
SELECT
    a.*,
    u.full_name     AS applicant_name,
    u.avatar_url    AS applicant_avatar,
    j.title         AS job_title,
    c.name          AS company_name,
    r.file_url      AS resume_url,
    r.parsed_skills AS resume_skills
FROM applications a
JOIN users  u ON a.applicant_id = u.id
JOIN jobs   j ON a.job_id = j.id
LEFT JOIN companies c ON j.company_id = c.id
LEFT JOIN resumes   r ON a.resume_id = r.id;


-- Credit wallet summary
CREATE OR REPLACE VIEW v_wallet_summary AS
SELECT
    w.user_id,
    u.full_name,
    u.email,
    w.balance,
    w.lifetime_earned,
    w.lifetime_spent,
    (SELECT COUNT(*) FROM credit_transactions ct WHERE ct.wallet_id = w.id) AS transaction_count
FROM credit_wallets w
JOIN users u ON w.user_id = u.id;
