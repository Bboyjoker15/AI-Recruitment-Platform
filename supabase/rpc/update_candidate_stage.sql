-- ============================================
-- update_candidate_stage
-- Cambia la etapa de un candidato y notifica a n8n
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Reemplazar TU_TUNNEL_URL con la URL actual de Cloudflare Tunnel
-- Ej: https://penalties-swim-transparent-breath.trycloudflare.com

CREATE OR REPLACE FUNCTION update_candidate_stage(
  p_candidate_id UUID,
  p_new_status TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_webhook_url TEXT := 'https://penalties-swim-transparent-breath.trycloudflare.com/webhook/1b481a4b-e45f-4e19-a1f0-d8548663c3e4
';
  v_candidate_name TEXT;
  v_job_title TEXT;
BEGIN
  -- Validar status permitido
  IF p_new_status NOT IN ('new', 'screening', 'interview', 'technical_test', 'offer', 'hired', 'rejected') THEN
    RAISE EXCEPTION 'Estado inválido: %', p_new_status;
  END IF;

  -- Obtener datos del candidato antes de actualizar
  SELECT c.name, j.title
  INTO v_candidate_name, v_job_title
  FROM public.candidates c
  JOIN public.jobs j ON j.id = c.job_id
  WHERE c.id = p_candidate_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Candidato no encontrado: %', p_candidate_id;
  END IF;

  -- Actualizar etapa
  UPDATE public.candidates
  SET status = p_new_status
  WHERE id = p_candidate_id;

  -- Notificar a n8n
  PERFORM net.http_post(
    url := v_webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'candidate_id', p_candidate_id,
      'candidate_name', v_candidate_name,
      'job_title', v_job_title,
      'new_status', p_new_status,
      'event', 'stage_changed',
      'timestamp', now()
    )
  );
END;
$$;
