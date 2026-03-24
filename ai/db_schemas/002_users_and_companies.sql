-- ============================================================
-- migrations/002_users_and_companies.sql
-- ============================================================

-- ── Users (shared table for jobseekers + recruiters) ─────────────────────────
CREATE TABLE users (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email               TEXT        NOT NULL UNIQUE,
    phone               TEXT        UNIQUE,
    password_hash       TEXT        NOT NULL,
    role                user_role   NOT NULL DEFAULT 'jobseeker',
    status              user_status NOT NULL DEFAULT 'pending_verification',
    full_name           TEXT        NOT NULL,
    avatar_url          TEXT,
    is_email_verified   BOOLEAN     DEFAULT FALSE,
    is_phone_verified   BOOLEAN     DEFAULT FALSE,
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email  ON users (email);
CREATE INDEX idx_users_role   ON users (role);
CREATE INDEX idx_users_status ON users (status);


-- ── Auth tokens (email verify, password reset, refresh tokens) ────────────────
CREATE TABLE auth_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    type        TEXT        NOT NULL CHECK (type IN ('email_verify', 'password_reset', 'refresh')),
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_tokens_user   ON auth_tokens (user_id);
CREATE INDEX idx_auth_tokens_hash   ON auth_tokens (token_hash);
CREATE INDEX idx_auth_tokens_expiry ON auth_tokens (expires_at);


-- ── OAuth providers (Google, LinkedIn, GitHub) ────────────────────────────────
CREATE TABLE oauth_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        TEXT NOT NULL CHECK (provider IN ('google', 'linkedin', 'github')),
    provider_uid    TEXT NOT NULL,
    access_token    TEXT,
    refresh_token   TEXT,
    token_expires   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (provider, provider_uid)
);

CREATE INDEX idx_oauth_user ON oauth_accounts (user_id);


-- ── Companies (owned by recruiters) ───────────────────────────────────────────
CREATE TABLE companies (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    slug            TEXT        NOT NULL UNIQUE,           -- url-safe company identifier
    logo_url        TEXT,
    website         TEXT,
    industry        TEXT,
    size_range      TEXT,                                  -- e.g. "50–200"
    founded_year    INTEGER,
    description     TEXT,
    headquarters    TEXT,
    linkedin_url    TEXT,
    is_verified     BOOLEAN     DEFAULT FALSE,
    created_by      UUID        REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_slug     ON companies (slug);
CREATE INDEX idx_companies_industry ON companies (industry);
CREATE INDEX idx_companies_verified ON companies (is_verified);

-- Full-text search on company name + description
CREATE INDEX idx_companies_fts ON companies
    USING GIN (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'')));


-- ── Recruiter profiles ────────────────────────────────────────────────────────
CREATE TABLE recruiter_profiles (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_id      UUID    REFERENCES companies(id) ON DELETE SET NULL,
    designation     TEXT,                                  -- e.g. "Senior HR Manager"
    department      TEXT,
    linkedin_url    TEXT,
    bio             TEXT,
    is_verified     BOOLEAN DEFAULT FALSE,                 -- admin-verified recruiter
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recruiter_user    ON recruiter_profiles (user_id);
CREATE INDEX idx_recruiter_company ON recruiter_profiles (company_id);
