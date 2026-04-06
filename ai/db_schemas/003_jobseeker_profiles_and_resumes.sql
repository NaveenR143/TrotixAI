-- ============================================================
-- migrations/003_jobseeker_profiles_and_resumes.sql
-- ============================================================

-- ── Jobseeker profiles ────────────────────────────────────────────────────────
CREATE TABLE jobseeker_profiles (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline            TEXT,                              -- "Full-Stack Engineer at Acme"
    summary             TEXT,
    gender              gender_type,
    date_of_birth       DATE,
    current_location    TEXT,
    preferred_locations TEXT[],                            -- willing to relocate to
    years_of_experience NUMERIC(4,1),
    notice_period_days  INTEGER,
    current_salary      NUMERIC(12,2),
    expected_salary     NUMERIC(12,2),
    salary_currency     salary_currency DEFAULT 'INR',
    is_actively_looking BOOLEAN     DEFAULT TRUE,
    linkedin_url        TEXT,
    github_url          TEXT,
    portfolio_url       TEXT,
    profile_completion  INTEGER     DEFAULT 0 CHECK (profile_completion BETWEEN 0 AND 100),

    -- AI-generated embedding of the full profile (pgvector)
    -- Used for semantic similarity matching with jobs
    profile_embedding   vector(1536),

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_js_user       ON jobseeker_profiles (user_id);
CREATE INDEX idx_js_location   ON jobseeker_profiles (current_location);
CREATE INDEX idx_js_looking    ON jobseeker_profiles (is_actively_looking);
CREATE INDEX idx_js_experience ON jobseeker_profiles (years_of_experience);

-- pgvector HNSW index for fast approximate nearest-neighbour search
CREATE INDEX idx_js_embedding  ON jobseeker_profiles
    USING hnsw (profile_embedding vector_cosine_ops);


-- ── Skills master list ────────────────────────────────────────────────────────
CREATE TABLE skills (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT    NOT NULL UNIQUE,                   -- normalised lowercase
    category    TEXT,                                      -- "frontend", "backend", "cloud", etc.
    aliases     TEXT[],                                    -- ["js", "es6"] for "javascript"
    is_trending BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skills_name     ON skills (name);
CREATE INDEX idx_skills_category ON skills (category);
CREATE INDEX idx_skills_trending ON skills (is_trending);
CREATE INDEX idx_skills_trgm     ON skills USING GIN (name gin_trgm_ops);  -- fuzzy match


-- ── Jobseeker skills ─────────────────────────────────────────────────────────
CREATE TABLE jobseeker_skills (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id    UUID        NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    level       skill_level DEFAULT 'intermediate',
    years       NUMERIC(4,1),
    is_primary  BOOLEAN     DEFAULT FALSE,                 -- highlighted skills
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, skill_id)
);

CREATE INDEX idx_js_skills_user  ON jobseeker_skills (user_id);
CREATE INDEX idx_js_skills_skill ON jobseeker_skills (skill_id);


-- ── Work experience ───────────────────────────────────────────────────────────
CREATE TABLE work_experiences (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name    TEXT    NOT NULL,
    title           TEXT    NOT NULL,
    location        TEXT,
    start_date      DATE    NOT NULL,
    end_date        DATE,                                  -- NULL = current
    is_current      BOOLEAN DEFAULT FALSE,
    description     TEXT,
    skills_used     TEXT[],
    achievements    TEXT[],
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exp_user ON work_experiences (user_id);


-- ── Education ─────────────────────────────────────────────────────────────────
CREATE TABLE education (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution     TEXT    NOT NULL,
    degree          TEXT,
    field_of_study  TEXT,
    grade           TEXT,
    start_year      INTEGER,
    end_year        INTEGER,
    is_current      BOOLEAN DEFAULT FALSE,
    description     TEXT,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_edu_user ON education (user_id);


-- ── Certifications ────────────────────────────────────────────────────────────
CREATE TABLE certifications (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT    NOT NULL,
    issuer          TEXT,
    issue_date      DATE,
    expiry_date     DATE,
    credential_id   TEXT,
    credential_url  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cert_user ON certifications (user_id);


-- ── Projects ──────────────────────────────────────────────────────────────────
CREATE TABLE projects (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    work_experience_id  UUID    REFERENCES work_experiences(id) ON DELETE CASCADE,
    title               TEXT    NOT NULL,
    description         TEXT,
    url                 TEXT,
    repo_url            TEXT,
    skills_used         TEXT[],
    start_date          DATE,
    end_date            DATE,
    sort_order          INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects (user_id);
CREATE INDEX idx_projects_exp  ON projects (work_experience_id);


-- ── Resumes (uploaded files + AI-parsed content) ──────────────────────────────
CREATE TABLE resumes (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name           TEXT    NOT NULL,
    file_url            TEXT    NOT NULL,                  -- S3 / cloud storage URL
    file_size_bytes     INTEGER,
    mime_type           TEXT,
    is_primary          BOOLEAN DEFAULT FALSE,             -- active resume for applications

    -- AI-extracted data (populated after parse)
    parsed_at           TIMESTAMPTZ,
    raw_text            TEXT,                              -- full extracted text
    parsed_skills       TEXT[],
    parsed_experience_years NUMERIC(4,1),
    parsed_job_titles   TEXT[],
    parsed_education    JSONB,
    parsed_summary      TEXT,
    parse_credits_used  INTEGER DEFAULT 0,

    -- AI embedding for semantic job matching
    resume_embedding    vector(1536),

    -- AI improvement suggestions
    improvement_score   INTEGER CHECK (improvement_score BETWEEN 0 AND 100),
    improvement_notes   JSONB,                            -- [{section, issue, suggestion}]
    improvement_credits_used INTEGER DEFAULT 0,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resumes_user    ON resumes (user_id);
CREATE INDEX idx_resumes_primary ON resumes (user_id, is_primary);
CREATE INDEX idx_resumes_emb     ON resumes
    USING hnsw (resume_embedding vector_cosine_ops);


-- ── AI-built resume sections (resume builder) ─────────────────────────────────
CREATE TABLE resume_builder_docs (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT            NOT NULL DEFAULT 'My Resume',
    template        TEXT            DEFAULT 'modern',
    is_active       BOOLEAN         DEFAULT TRUE,
    credits_used    INTEGER         DEFAULT 0,
    created_at      TIMESTAMPTZ     DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE TABLE resume_builder_sections (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id          UUID            NOT NULL REFERENCES resume_builder_docs(id) ON DELETE CASCADE,
    section_type    resume_section  NOT NULL,
    title           TEXT,                                  -- custom section title override
    content         JSONB           NOT NULL DEFAULT '{}', -- structured section content
    ai_generated    BOOLEAN         DEFAULT FALSE,
    sort_order      INTEGER         DEFAULT 0,
    created_at      TIMESTAMPTZ     DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX idx_rb_docs_user     ON resume_builder_docs (user_id);
CREATE INDEX idx_rb_sections_doc  ON resume_builder_sections (doc_id);
