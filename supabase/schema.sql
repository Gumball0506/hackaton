-- ============================================================
-- E-Tutor UNFV — Schema completo
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ── TUTORES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tutores (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT UNIQUE NOT NULL,
  nombre_completo  TEXT NOT NULL,
  codigo           TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── CURSOS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cursos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          TEXT NOT NULL,
  facultad        TEXT NOT NULL,
  escuela         TEXT NOT NULL,
  ciclo           INTEGER NOT NULL,
  periodo         TEXT NOT NULL DEFAULT '2026-I',
  total_sesiones  INTEGER NOT NULL DEFAULT 16,
  tutor_id        UUID REFERENCES public.tutores(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── ESTUDIANTES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.estudiantes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo               TEXT UNIQUE NOT NULL,
  apellidos_y_nombres  TEXT NOT NULL,
  seccion              TEXT NOT NULL CHECK (seccion IN ('A','B')),
  grupo                TEXT,
  ord                  INTEGER NOT NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── MATRICULAS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matriculas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id  UUID NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  curso_id       UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  periodo        TEXT NOT NULL DEFAULT '2026-I',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(estudiante_id, curso_id, periodo)
);

-- ── NOTAS ────────────────────────────────────────────────────
-- parcial 30% | final 30% | practica 40%
CREATE TABLE IF NOT EXISTS public.notas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id  UUID NOT NULL UNIQUE REFERENCES public.matriculas(id) ON DELETE CASCADE,
  parcial       NUMERIC(4,2) CHECK (parcial BETWEEN 0 AND 20),
  final         NUMERIC(4,2) CHECK (final   BETWEEN 0 AND 20),
  practica      NUMERIC(4,2) CHECK (practica BETWEEN 0 AND 20),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Vista con promedio calculado
CREATE OR REPLACE VIEW public.notas_con_promedio AS
SELECT
  n.*,
  CASE
    WHEN n.parcial IS NOT NULL AND n.final IS NOT NULL AND n.practica IS NOT NULL
    THEN ROUND((n.parcial * 0.30 + n.final * 0.30 + n.practica * 0.40)::NUMERIC, 2)
    ELSE NULL
  END AS promedio
FROM public.notas n;

-- ── ASISTENCIAS ──────────────────────────────────────────────
-- 16 sesiones por estudiante; presente=NULL → no registrada aún
-- Riesgo si faltas >= 5 (>30% de 16 sesiones)
CREATE TABLE IF NOT EXISTS public.asistencias (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id  UUID NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
  sesion        INTEGER NOT NULL CHECK (sesion BETWEEN 1 AND 16),
  fecha         DATE,
  presente      BOOLEAN DEFAULT NULL,
  UNIQUE(matricula_id, sesion)
);

-- ── MENSAJES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mensajes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id  UUID NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  tutor_id       UUID NOT NULL REFERENCES public.tutores(id),
  remitente      TEXT NOT NULL CHECK (remitente IN ('tutor','estudiante')),
  contenido      TEXT NOT NULL,
  leido          BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── OBSERVACIONES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.observaciones (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id  UUID NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  tutor_id       UUID NOT NULL REFERENCES public.tutores(id),
  texto          TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── ENTREVISTAS ──────────────────────────────────────────────
-- Archivos subidos se guardan en Supabase Storage (bucket 'entrevistas')
-- json_data contiene la transcripción/datos estructurados por estudiante
CREATE TABLE IF NOT EXISTS public.entrevistas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id  UUID NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  tutor_id       UUID NOT NULL REFERENCES public.tutores(id),
  nombre         TEXT NOT NULL,
  storage_path   TEXT,
  json_data      JSONB DEFAULT '{}',
  fecha          DATE DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── CITAS PSICÓLOGO ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.citas_psicologo (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id     UUID NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  tutor_id          UUID NOT NULL REFERENCES public.tutores(id),
  fecha             TIMESTAMPTZ,
  lugar             TEXT,
  motivo            TEXT,
  estado            TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmada','realizada','cancelada')),
  notas_adicionales TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── ÍNDICES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_matriculas_estudiante ON public.matriculas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_curso      ON public.matriculas(curso_id);
CREATE INDEX IF NOT EXISTS idx_notas_matricula       ON public.notas(matricula_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_matricula ON public.asistencias(matricula_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_estudiante   ON public.mensajes(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_observaciones_est     ON public.observaciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_entrevistas_est       ON public.entrevistas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_citas_est             ON public.citas_psicologo(estudiante_id);

-- ── RLS — permisivo para hackathon ───────────────────────────
ALTER TABLE public.tutores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudiantes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observaciones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrevistas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas_psicologo  ENABLE ROW LEVEL SECURITY;

-- Política permisiva (anon key puede leer/escribir todo — hackathon)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tutores','cursos','estudiantes','matriculas','notas',
    'asistencias','mensajes','observaciones','entrevistas','citas_psicologo'
  ] LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "allow_all_%s" ON public.%I;
      CREATE POLICY "allow_all_%s" ON public.%I
      FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    ', t, t, t, t);
  END LOOP;
END $$;

-- ── STORAGE BUCKET ───────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('entrevistas', 'entrevistas', false, 52428800,
        ARRAY['application/pdf','application/json','audio/mpeg','audio/wav','video/mp4'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "allow_all_entrevistas_storage" ON storage.objects;
CREATE POLICY "allow_all_entrevistas_storage" ON storage.objects
FOR ALL TO anon, authenticated USING (bucket_id = 'entrevistas') WITH CHECK (bucket_id = 'entrevistas');

-- ── RPC: Perfil completo por código (para chatbot móvil) ──────
CREATE OR REPLACE FUNCTION public.get_perfil_estudiante(p_codigo TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'estudiante',   to_jsonb(e),
    'curso',        to_jsonb(c),
    'notas',        to_jsonb(n),
    'asistencia',   jsonb_build_object(
      'total_sesiones', 16,
      'presentes',  (SELECT COUNT(*) FROM public.asistencias a WHERE a.matricula_id = m.id AND a.presente = TRUE),
      'faltas',     (SELECT COUNT(*) FROM public.asistencias a WHERE a.matricula_id = m.id AND a.presente = FALSE),
      'detalle',    (SELECT jsonb_agg(to_jsonb(a) ORDER BY a.sesion) FROM public.asistencias a WHERE a.matricula_id = m.id)
    ),
    'observaciones',(SELECT jsonb_agg(to_jsonb(o) ORDER BY o.created_at DESC) FROM public.observaciones o WHERE o.estudiante_id = e.id),
    'entrevistas',  (SELECT jsonb_agg(to_jsonb(en) ORDER BY en.created_at DESC) FROM public.entrevistas en WHERE en.estudiante_id = e.id),
    'citas',        (SELECT jsonb_agg(to_jsonb(cp) ORDER BY cp.created_at DESC) FROM public.citas_psicologo cp WHERE cp.estudiante_id = e.id),
    'mensajes',     (SELECT jsonb_agg(to_jsonb(msg) ORDER BY msg.created_at DESC) FROM public.mensajes msg WHERE msg.estudiante_id = e.id)
  ) INTO result
  FROM public.estudiantes e
  JOIN  public.matriculas m ON m.estudiante_id = e.id
  JOIN  public.cursos c     ON c.id = m.curso_id
  LEFT  JOIN public.notas_con_promedio n ON n.matricula_id = m.id
  WHERE e.codigo = p_codigo
  LIMIT 1;
  RETURN result;
END;
$$;
