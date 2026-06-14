CREATE POLICY "Recruiters can view ai_logs"
ON ai_logs FOR SELECT
USING (auth.role() = 'authenticated');
