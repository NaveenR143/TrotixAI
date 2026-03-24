-- ============================================================
-- migrations/005_ai_features_and_credits.sql
-- ============================================================

-- ── Credit wallet (one per user) ─────────────────────────────────────────────
CREATE TABLE credit_wallets (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance         INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    lifetime_earned INTEGER NOT NULL DEFAULT 0,
    lifetime_spent  INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_user ON credit_wallets (user_id);


-- ── Credit transactions (immutable ledger) ────────────────────────────────────
CREATE TABLE credit_transactions (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id       UUID            NOT NULL REFERENCES credit_wallets(id) ON DELETE CASCADE,
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            credit_tx_type  NOT NULL,
    amount          INTEGER         NOT NULL,              -- positive = credit, negative = debit
    balance_after   INTEGER         NOT NULL,              -- snapshot for audit
    description     TEXT,
    ref_id          UUID,                                  -- links to payment_orders, ai_logs, etc.
    ref_type        TEXT,                                  -- 'payment', 'ai_job_match', etc.
    created_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX idx_ctx_wallet  ON credit_transactions (wallet_id);
CREATE INDEX idx_ctx_user    ON credit_transactions (user_id);
CREATE INDEX idx_ctx_type    ON credit_transactions (type);
CREATE INDEX idx_ctx_created ON credit_transactions (created_at DESC);


-- ── AI credit pricing table ───────────────────────────────────────────────────
-- Admin-configurable cost per AI feature (in credits)
CREATE TABLE ai_feature_pricing (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key     TEXT    NOT NULL UNIQUE,   -- matches credit_tx_type values
    display_name    TEXT    NOT NULL,
    credits_cost    INTEGER NOT NULL,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default pricing
INSERT INTO ai_feature_pricing (feature_key, display_name, credits_cost, description) VALUES
('ai_resume_parse',      'Resume Parse & Extract',      5,   'Extract skills, experience, and profile data from your resume PDF'),
('ai_job_match',         'AI Job Matching',             3,   'Match your resume against all active jobs and get ranked results'),
('ai_candidate_match',   'AI Candidate Search',         10,  'Recruiters: find best-fit candidates for a job opening'),
('ai_skill_suggest',     'Skill Gap Analysis',          8,   'Get market-driven skill suggestions to improve your profile'),
('ai_resume_builder',    'AI Resume Section Builder',   10,  'Generate a professional resume section with AI'),
('ai_content_write',     'AI Content Writing',          5,   'Generate cover letters, emails, and professional bios'),
('ai_resume_improve',    'Resume Score & Improvement',  7,   'Score your resume and get actionable improvement tips');


-- ── AI usage log (audit trail for every AI call) ──────────────────────────────
CREATE TABLE ai_usage_logs (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_key     TEXT    NOT NULL,
    credits_used    INTEGER NOT NULL DEFAULT 0,
    model_used      TEXT,                                  -- e.g. "gpt-4o", "text-embedding-3-small"
    tokens_in       INTEGER,
    tokens_out      INTEGER,
    latency_ms      INTEGER,
    input_ref       UUID,                                  -- e.g. resume_id, job_id
    input_type      TEXT,
    output_summary  TEXT,                                  -- short description of result
    error           TEXT,                                  -- null = success
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_log_user    ON ai_usage_logs (user_id);
CREATE INDEX idx_ai_log_feature ON ai_usage_logs (feature_key);
CREATE INDEX idx_ai_log_created ON ai_usage_logs (created_at DESC);


-- ── AI job match results (cached) ────────────────────────────────────────────
CREATE TABLE ai_job_matches (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id       UUID    REFERENCES resumes(id) ON DELETE SET NULL,
    job_id          UUID    NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    match_score     NUMERIC(5,2) NOT NULL,                -- 0–100
    skill_score     NUMERIC(5,2),
    experience_score NUMERIC(5,2),
    semantic_score  NUMERIC(5,2),                         -- vector similarity
    matched_skills  TEXT[],
    missing_skills  TEXT[],
    match_summary   TEXT,                                  -- AI-written explanation
    credits_used    INTEGER DEFAULT 0,
    matched_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    UNIQUE (user_id, resume_id, job_id)
);

CREATE INDEX idx_ajm_user    ON ai_job_matches (user_id);
CREATE INDEX idx_ajm_job     ON ai_job_matches (job_id);
CREATE INDEX idx_ajm_score   ON ai_job_matches (match_score DESC);
CREATE INDEX idx_ajm_expires ON ai_job_matches (expires_at);


-- ── AI candidate match results (for recruiters) ───────────────────────────────
CREATE TABLE ai_candidate_matches (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id          UUID    NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id       UUID    REFERENCES resumes(id) ON DELETE SET NULL,
    match_score     NUMERIC(5,2) NOT NULL,
    skill_score     NUMERIC(5,2),
    experience_score NUMERIC(5,2),
    semantic_score  NUMERIC(5,2),
    matched_skills  TEXT[],
    missing_skills  TEXT[],
    match_summary   TEXT,
    credits_used    INTEGER DEFAULT 0,
    matched_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    UNIQUE (recruiter_id, job_id, candidate_id)
);

CREATE INDEX idx_acm_recruiter  ON ai_candidate_matches (recruiter_id);
CREATE INDEX idx_acm_job        ON ai_candidate_matches (job_id);
CREATE INDEX idx_acm_candidate  ON ai_candidate_matches (candidate_id);
CREATE INDEX idx_acm_score      ON ai_candidate_matches (match_score DESC);


-- ── Skill gap & market suggestions ───────────────────────────────────────────
CREATE TABLE skill_suggestions (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id           UUID    REFERENCES resumes(id) ON DELETE SET NULL,

    -- Market context
    target_role         TEXT,                              -- role user wants
    market_demand_data  JSONB,                             -- scraped/analysed job market data

    -- Suggestions
    skills_to_add       JSONB,                             -- [{skill, reason, urgency, market_count}]
    skills_to_improve   JSONB,                             -- [{skill, current_level, target_level}]
    learning_resources  JSONB,                             -- [{skill, resource_name, url, type}]
    summary             TEXT,                              -- AI-written career advice

    credits_used        INTEGER DEFAULT 0,
    generated_at        TIMESTAMPTZ DEFAULT NOW(),
    expires_at          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX idx_ss_user    ON skill_suggestions (user_id);
CREATE INDEX idx_ss_expires ON skill_suggestions (expires_at);


-- ── AI content writing sessions ───────────────────────────────────────────────
CREATE TABLE ai_content_sessions (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            TEXT    NOT NULL CHECK (type IN (
                        'cover_letter', 'bio', 'summary',
                        'linkedin_headline', 'email', 'custom'
                    )),
    context         JSONB,                                 -- input: {job_title, company, skills...}
    prompt_used     TEXT,
    output          TEXT,                                  -- generated content
    user_rating     INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    credits_used    INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_acs_user ON ai_content_sessions (user_id);
CREATE INDEX idx_acs_type ON ai_content_sessions (type);


-- ── Market skill trends (populated by background job) ─────────────────────────
CREATE TABLE market_skill_trends (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id        UUID    NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    snapshot_date   DATE    NOT NULL DEFAULT CURRENT_DATE,
    job_count       INTEGER DEFAULT 0,                     -- jobs requiring this skill today
    growth_pct      NUMERIC(6,2),                         -- WoW/MoM growth
    avg_salary      NUMERIC(12,2),
    top_roles       TEXT[],
    top_companies   TEXT[],
    UNIQUE (skill_id, snapshot_date)
);

CREATE INDEX idx_mst_skill ON market_skill_trends (skill_id);
CREATE INDEX idx_mst_date  ON market_skill_trends (snapshot_date DESC);
CREATE INDEX idx_mst_count ON market_skill_trends (job_count DESC);
