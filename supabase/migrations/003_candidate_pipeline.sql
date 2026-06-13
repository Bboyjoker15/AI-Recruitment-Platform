-- ============================================
-- 003 - Candidate Pipeline & Stages
-- ============================================

-- 1. Expand candidates.status CHECK con más etapas del pipeline
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_status_check;
ALTER TABLE candidates ADD CONSTRAINT candidates_status_check
  CHECK (status IN ('new', 'screening', 'interview', 'technical_test', 'offer', 'hired', 'rejected'));

-- 2. Agregar suggested_next_step al análisis de IA
ALTER TABLE scores ADD COLUMN IF NOT EXISTS suggested_next_step TEXT;
