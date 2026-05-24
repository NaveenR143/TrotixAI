-- ============================================================================
-- Jobs and Applications (Migration 004)
-- ============================================================================

-- Job Postings Table
CREATE TABLE public.job_postings (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    min_experience integer DEFAULT 0,
    embedding vector(768),  -- pgvector embedding
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.job_postings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.job_postings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

-- Job Skills Table
CREATE TABLE public.job_skills (
    id integer NOT NULL,
    job_id integer NOT NULL,
    skill_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.job_skills ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.job_skills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

-- Add embedding column to resumes table if it doesn't exist
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Add summary and experience_years columns to resumes for easier access
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS experience_years numeric(4,1) DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_embedding ON public.job_postings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_resumes_embedding ON public.resumes USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON public.job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill_name ON public.job_skills(skill_name);

-- Foreign Key Constraints
ALTER TABLE public.job_skills ADD CONSTRAINT fk_job_skills_job_id
    FOREIGN KEY (job_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;
