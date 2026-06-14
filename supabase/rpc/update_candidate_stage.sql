-- ============================================
-- update_candidate_stage
-- Cambia la etapa de un candidato (solo DB)
-- El webhook a n8n se envía desde el Server Action
-- ============================================
-- Ya no es necesario ejecutar esta función,
-- la actualización se hace directo desde la Server Action.
-- Se mantiene solo como referencia.

CREATE OR REPLACE FUNCTION update_candidate_stage(
  p_candidate_id UUID,
  p_new_status TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF p_new_status NOT IN ('new', 'screening', 'interview', 'technical_test', 'offer', 'hired', 'rejected') THEN
    RAISE EXCEPTION 'Estado inválido: %', p_new_status;
  END IF;

  UPDATE public.candidates
  SET status = p_new_status
  WHERE id = p_candidate_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Candidato no encontrado: %', p_candidate_id;
  END IF;
END;
$$;
