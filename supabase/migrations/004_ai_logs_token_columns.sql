ALTER TABLE ai_logs
ADD COLUMN IF NOT EXISTS prompt_tokens integer,
ADD COLUMN IF NOT EXISTS completion_tokens integer;