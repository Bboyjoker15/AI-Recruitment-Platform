-- ============================================
-- schedule_interview (simplificada)
-- Crea una entrevista manejando el trigger bug
-- El webhook a n8n se envía desde el Server Action
-- ============================================
-- Ejecutar en Supabase SQL Editor
-- Reemplaza la version anterior que incluía net.http_post

CREATE OR REPLACE FUNCTION schedule_interview(
  p_candidate_id UUID,
  p_interview_date TIMESTAMPTZ,
  p_status TEXT DEFAULT 'scheduled',
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_interview_id UUID;
BEGIN
  -- Deshabilitar trigger bug de PostgREST
  ALTER TABLE public.interviews DISABLE TRIGGER enviar_entrevista_n8n;

  -- Insertar entrevista
  INSERT INTO public.interviews (candidate_id, interview_date, status, notes)
  VALUES (p_candidate_id, p_interview_date, p_status, p_notes)
  RETURNING id INTO v_interview_id;

  -- Rehabilitar trigger
  ALTER TABLE public.interviews ENABLE TRIGGER enviar_entrevista_n8n;

  RETURN v_interview_id;
END;
$$;
