-- ============================================================
-- migrations/004_jobs_and_applications.sql
-- ============================================================

-- ── Job categories / tags ─────────────────────────────────────────────────────
CREATE TABLE job_categories (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT    NOT NULL UNIQUE,
    slug        TEXT    NOT NULL UNIQUE,
    parent_id   UUID    REFERENCES job_categories(id),    -- hierarchical categories
    icon        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ── Jobs ──────────────────────────────────────────────────────────────────────
CREATE TABLE jobs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id          UUID        REFERENCES companies(id) ON DELETE SET NULL,
    category_id         UUID        REFERENCES job_categories(id) ON DELETE SET NULL,

    -- Core details
    title               TEXT        NOT NULL,
    slug                TEXT        UNIQUE,
    description         TEXT,
    responsibilities    TEXT[],
    requirements        TEXT[],
    benefits            TEXT[],
    about_company       TEXT,

    -- Classification
    status              job_status  NOT NULL DEFAULT 'draft',
    job_type            job_type    NOT NULL DEFAULT 'full_time',
    work_mode           work_mode   NOT NULL DEFAULT 'onsite',
    experience_level    exp_level,
    experience_min_yrs  NUMERIC(4,1),
    experience_max_yrs  NUMERIC(4,1),

    -- Location
    location            TEXT,
    city                TEXT,
    state               TEXT,
    country             TEXT        DEFAULT 'IN',

    -- Compensation
    salary_min          NUMERIC(12,2),
    salary_max          NUMERIC(12,2),
    salary_currency     salary_currency DEFAULT 'INR',
    salary_display      TEXT,                              -- e.g. "₹20–30 LPA" (shown on card)
    salary_is_hidden    BOOLEAN     DEFAULT FALSE,

    -- Skills
    skills_required     TEXT[]      NOT NULL DEFAULT '{}',
    skills_preferred    TEXT[]      DEFAULT '{}',

    -- Metadata
    openings            INTEGER     DEFAULT 1,
    department          TEXT,
    apply_url           TEXT,                              -- external apply link if any
    website             TEXT,

    -- Lifecycle
    posted_at           TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,

    -- AI
    -- Embedding of title+description+skills for semantic candidate matching
    job_embedding       vector(1536),
    ai_summary          TEXT,                              -- AI-generated short summary
    ai_tags             TEXT[],                            -- AI-suggested tags

    -- Stats (denormalised for performance)
    view_count          INTEGER     DEFAULT 0,
    apply_count         INTEGER     DEFAULT 0,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_recruiter   ON jobs (recruiter_id);
CREATE INDEX idx_jobs_company     ON jobs (company_id);
CREATE INDEX idx_jobs_status      ON jobs (status);
CREATE INDEX idx_jobs_type        ON jobs (job_type);
CREATE INDEX idx_jobs_mode        ON jobs (work_mode);
CREATE INDEX idx_jobs_city        ON jobs (city);
CREATE INDEX idx_jobs_country     ON jobs (country);
CREATE INDEX idx_jobs_posted      ON jobs (posted_at DESC);
CREATE INDEX idx_jobs_expires     ON jobs (expires_at);

-- GIN index for fast array overlap (skill matching)
CREATE INDEX idx_jobs_skills_req  ON jobs USING GIN (skills_required);
CREATE INDEX idx_jobs_skills_pref ON jobs USING GIN (skills_preferred);

-- Full-text search
CREATE INDEX idx_jobs_fts ON jobs
    USING GIN (to_tsvector('english',
        coalesce(title,'') || ' ' ||
        coalesce(description,'') || ' ' ||
        coalesce(location,'')
    ));

-- pgvector HNSW for semantic candidate matching
CREATE INDEX idx_jobs_embedding ON jobs
    USING hnsw (job_embedding vector_cosine_ops);


-- ── Job questions (screening questions set by recruiter) ──────────────────────
CREATE TABLE job_questions (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id      UUID    NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    question    TEXT    NOT NULL,
    type        TEXT    NOT NULL CHECK (type IN ('text', 'yes_no', 'multiple_choice', 'numeric')),
    options     TEXT[],                                    -- for multiple_choice
    is_required BOOLEAN DEFAULT TRUE,
    sort_order  INTEGER DEFAULT 0
);

CREATE INDEX idx_jq_job ON job_questions (job_id);


-- ── Applications ──────────────────────────────────────────────────────────────
CREATE TABLE applications (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id           UUID        REFERENCES resumes(id) ON DELETE SET NULL,

    status              apply_status NOT NULL DEFAULT 'applied',
    cover_letter        TEXT,
    answers             JSONB,                             -- [{question_id, answer}]

    -- AI match score computed at apply time (0–100)
    ai_match_score      NUMERIC(5,2),
    ai_match_breakdown  JSONB,                             -- {skills:80, exp:70, ...}

    -- Recruiter actions
    recruiter_notes     TEXT,
    starred             BOOLEAN     DEFAULT FALSE,
    viewed_at           TIMESTAMPTZ,

    -- Interview scheduling
    interview_scheduled_at  TIMESTAMPTZ,
    interview_type          TEXT,                          -- "video", "onsite", "phone"
    interview_link          TEXT,

    applied_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (job_id, applicant_id)                         -- one application per job
);

CREATE INDEX idx_app_job       ON applications (job_id);
CREATE INDEX idx_app_applicant ON applications (applicant_id);
CREATE INDEX idx_app_status    ON applications (status);
CREATE INDEX idx_app_score     ON applications (ai_match_score DESC);
CREATE INDEX idx_app_starred   ON applications (job_id, starred);


-- ── Saved / bookmarked jobs ───────────────────────────────────────────────────
CREATE TABLE saved_jobs (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id      UUID    NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, job_id)
);

CREATE INDEX idx_saved_user ON saved_jobs (user_id);
CREATE INDEX idx_saved_job  ON saved_jobs (job_id);


-- ── Recruiter saved candidates ────────────────────────────────────────────────
CREATE TABLE saved_candidates (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id          UUID    REFERENCES jobs(id) ON DELETE SET NULL,  -- context job
    notes           TEXT,
    saved_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (recruiter_id, candidate_id, job_id)
);

CREATE INDEX idx_sc_recruiter  ON saved_candidates (recruiter_id);
CREATE INDEX idx_sc_candidate  ON saved_candidates (candidate_id);


-- ── Job views (analytics) ─────────────────────────────────────────────────────
CREATE TABLE job_views (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id      UUID    NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id     UUID    REFERENCES users(id) ON DELETE SET NULL,    -- NULL = anonymous
    ip_hash     TEXT,                                               -- hashed for privacy
    viewed_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jv_job      ON job_views (job_id);
CREATE INDEX idx_jv_viewed   ON job_views (viewed_at DESC);
