-- ============================================================
-- TrotixAI — Complete PostgreSQL Schema
-- migrations/001_extensions_and_enums.sql
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- trigram similarity search
CREATE EXTENSION IF NOT EXISTS "vector";          -- pgvector for AI embeddings (install pgvector first)
CREATE EXTENSION IF NOT EXISTS "unaccent";        -- accent-insensitive search

-- ── Enums ─────────────────────────────────────────────────────────────────────

CREATE TYPE user_role        AS ENUM ('jobseeker', 'recruiter', 'admin');
CREATE TYPE user_status      AS ENUM ('active', 'suspended', 'deleted', 'pending_verification');
CREATE TYPE gender_type      AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');

CREATE TYPE job_status       AS ENUM ('draft', 'active', 'paused', 'closed', 'expired');
CREATE TYPE job_type         AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'internship');
CREATE TYPE work_mode        AS ENUM ('onsite', 'remote', 'hybrid');
CREATE TYPE exp_level        AS ENUM ('entry', 'junior', 'mid', 'senior', 'lead', 'executive');
CREATE TYPE salary_currency  AS ENUM ('INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD');

CREATE TYPE apply_status     AS ENUM (
    'applied', 'shortlisted', 'interview_scheduled',
    'interview_completed', 'offer_made', 'hired', 'rejected', 'withdrawn'
);

CREATE TYPE credit_tx_type   AS ENUM (
    'signup_bonus', 'purchase', 'refund',
    'ai_resume_parse', 'ai_job_match', 'ai_candidate_match',
    'ai_skill_suggest', 'ai_resume_builder', 'ai_content_write',
    'ai_resume_improve', 'admin_grant', 'admin_deduct', 'expiry'
);

CREATE TYPE payment_status   AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_gateway  AS ENUM ('razorpay', 'stripe', 'paypal');

CREATE TYPE resume_section   AS ENUM (
    'summary', 'experience', 'education', 'skills',
    'projects', 'certifications', 'awards', 'languages', 'custom'
);

CREATE TYPE notif_type       AS ENUM (
    'application_update', 'job_match', 'candidate_match',
    'credit_low', 'credit_purchase', 'message', 'system'
);

CREATE TYPE skill_level      AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
