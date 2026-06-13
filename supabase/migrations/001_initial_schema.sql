-- ============================================
-- AI Recruitment Platform - Initial Schema
-- Compatible with Supabase SQL Editor
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. RECRUITERS
-- ============================================
CREATE TABLE IF NOT EXISTS recruiters (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. JOBS
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    description  TEXT,
    status       TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'closed')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);

-- ============================================
-- 3. CANDIDATES
-- ============================================
CREATE TABLE IF NOT EXISTS candidates (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    email        TEXT NOT NULL,
    cv_url       TEXT,
    raw_cv_data  JSONB,
    status       TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'reviewing', 'interviewed', 'accepted', 'rejected')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(email, job_id)
);

CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);

-- ============================================
-- 4. INTERVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS interviews (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status       TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    feedback     TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);

-- ============================================
-- 5. SCORES (AI output)
-- ============================================
CREATE TABLE IF NOT EXISTS scores (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id   UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    summary        TEXT NOT NULL,
    classification TEXT NOT NULL,
    suggestions    JSONB NOT NULL DEFAULT '[]',
    risk_level     TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    score          NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scores_candidate_id ON scores(candidate_id);

-- ============================================
-- 6. AUTO-CREATE RECRUITER ON SIGN UP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_recruiter()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.recruiters (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'name', '')
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_recruiter();

-- ============================================
-- 7. ROW LEVEL SECURITY
-- ============================================

-- Helper: every policy checks recruiter_id via auth.uid()
-- Assumption: recruiters.id == auth.users.id

-- 7.1 Recruiters
ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recruiters can view own profile" ON recruiters;
DROP POLICY IF EXISTS "Recruiters can update own profile" ON recruiters;

CREATE POLICY "Recruiters can view own profile"
    ON recruiters FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Recruiters can update own profile"
    ON recruiters FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 7.2 Jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recruiters can create jobs" ON jobs;
DROP POLICY IF EXISTS "Recruiters can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Recruiters can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Recruiters can delete own jobs" ON jobs;

CREATE POLICY "Recruiters can create jobs"
    ON jobs FOR INSERT
    WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can view own jobs"
    ON jobs FOR SELECT
    USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can update own jobs"
    ON jobs FOR UPDATE
    USING (recruiter_id = auth.uid())
    WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can delete own jobs"
    ON jobs FOR DELETE
    USING (recruiter_id = auth.uid());

-- 7.3 Candidates
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recruiters can manage candidates for own jobs" ON candidates;
DROP POLICY IF EXISTS "Recruiters can view candidates for own jobs" ON candidates;
DROP POLICY IF EXISTS "Recruiters can update candidates for own jobs" ON candidates;
DROP POLICY IF EXISTS "Recruiters can delete candidates for own jobs" ON candidates;

CREATE POLICY "Recruiters can manage candidates for own jobs"
    ON candidates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = job_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can view candidates for own jobs"
    ON candidates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = job_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can update candidates for own jobs"
    ON candidates FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = job_id
            AND jobs.recruiter_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = job_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can delete candidates for own jobs"
    ON candidates FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = job_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

-- 7.4 Interviews
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recruiters can manage interviews for own candidates" ON interviews;
DROP POLICY IF EXISTS "Recruiters can view interviews for own candidates" ON interviews;
DROP POLICY IF EXISTS "Recruiters can update interviews for own candidates" ON interviews;
DROP POLICY IF EXISTS "Recruiters can delete interviews for own candidates" ON interviews;

CREATE POLICY "Recruiters can manage interviews for own candidates"
    ON interviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM candidates
            JOIN jobs ON jobs.id = candidates.job_id
            WHERE candidates.id = candidate_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can view interviews for own candidates"
    ON interviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM candidates
            JOIN jobs ON jobs.id = candidates.job_id
            WHERE candidates.id = candidate_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can update interviews for own candidates"
    ON interviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM candidates
            JOIN jobs ON jobs.id = candidates.job_id
            WHERE candidates.id = candidate_id
            AND jobs.recruiter_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM candidates
            JOIN jobs ON jobs.id = candidates.job_id
            WHERE candidates.id = candidate_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can delete interviews for own candidates"
    ON interviews FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM candidates
            JOIN jobs ON jobs.id = candidates.job_id
            WHERE candidates.id = candidate_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

-- 7.5 Scores
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recruiters can manage scores for own candidates" ON scores;
DROP POLICY IF EXISTS "Recruiters can view scores for own candidates" ON scores;
DROP POLICY IF EXISTS "Recruiters can update scores for own candidates" ON scores;
DROP POLICY IF EXISTS "Recruiters can delete scores for own candidates" ON scores;

CREATE POLICY "Recruiters can manage scores for own candidates"
    ON scores FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM candidates
            JOIN jobs ON jobs.id = candidates.job_id
            WHERE candidates.id = candidate_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can view scores for own candidates"
    ON scores FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM candidates
            JOIN jobs ON jobs.id = candidates.job_id
            WHERE candidates.id = candidate_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can update scores for own candidates"
    ON scores FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM candidates
            JOIN jobs ON jobs.id = candidates.job_id
            WHERE candidates.id = candidate_id
            AND jobs.recruiter_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM candidates
            JOIN jobs ON jobs.id = candidates.job_id
            WHERE candidates.id = candidate_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can delete scores for own candidates"
    ON scores FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM candidates
            JOIN jobs ON jobs.id = candidates.job_id
            WHERE candidates.id = candidate_id
            AND jobs.recruiter_id = auth.uid()
        )
    );
