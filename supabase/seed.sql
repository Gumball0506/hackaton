-- ============================================================
-- E-Tutor UNFV — Seed data
-- Curso: Base de Datos II | Escuela: Informática | Ciclo V | 2026-I
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

DO $$
DECLARE
  v_tutor_id  UUID := '00000000-0000-0000-0000-000000000001';
  v_curso_id  UUID := '00000000-0000-0000-0000-000000000002';
  r           RECORD;
BEGIN

  -- ── TUTOR ─────────────────────────────────────────────────
  INSERT INTO public.tutores (id, email, nombre_completo, codigo)
  VALUES (v_tutor_id, 'jorge.mendoza@unfv.edu.pe', 'Mg. Jorge Mendoza Quispe', 'DOC-2024-0847')
  ON CONFLICT (id) DO NOTHING;

  -- ── CURSO ─────────────────────────────────────────────────
  INSERT INTO public.cursos (id, nombre, facultad, escuela, ciclo, periodo, total_sesiones, tutor_id)
  VALUES (v_curso_id, 'Base de Datos II',
          'Ingeniería Electrónica e Informática', 'Informática', 5, '2026-I', 16, v_tutor_id)
  ON CONFLICT (id) DO NOTHING;

  -- ── ESTUDIANTES SECCIÓN A (31) ────────────────────────────
  INSERT INTO public.estudiantes (codigo, apellidos_y_nombres, seccion, grupo, ord) VALUES
    ('2021017455','ALFARO GARCIA HUGO ANDRE',                    'A', NULL, 1),
    ('2022015446','ANDIA DIAZ LUIS ANGEL',                       'A', NULL, 2),
    ('2022015295','ARELLANO CHAUCA ALEX DANIEL',                 'A', NULL, 3),
    ('2021017446','ASCORRA VILCAPOMA AUGUSTO JOS',               'A', NULL, 4),
    ('2021024059','BALLUMBROSIO ORMEÑO LUIS ANTHONY',            'A', NULL, 5),
    ('2020010981','BERROSPI MALLMA MARICRUZ PILAR',              'A', NULL, 6),
    ('2022015312','BUSTAMANTE PINTO SANDRA',                     'A', NULL, 7),
    ('2020100793','CHUQUINO FRANCO LUIS ANGEL',                  'A', NULL, 8),
    ('2021017357','CONISLLA PINTO JULIO BRANDO',                 'A', NULL, 9),
    ('2022015205','EUSTAQUIO TARAZONA HIDALGO HERMINIO',         'A', NULL, 10),
    ('2021017544','FLORES ESPADA CHRISTIAN ARNOLD',              'A', NULL, 11),
    ('2017011506','GALVAN CARHUACHIN JOAN MANUEL',               'A', NULL, 12),
    ('2020010883','GALVEZ EGAS JAIME ALEJANDRO',                 'A', NULL, 13),
    ('2022000135','GONZALEZ TOVAR WERNER EDUARDO',               'A', NULL, 14),
    ('2022015491','HUAMAN CUYUBAMBA FRANCK ANGEL',               'A', NULL, 15),
    ('2021017464','HUAMAN LLANTERHUAY JOSUE RICARDO',            'A', NULL, 16),
    ('2021017437','HUAMAN NAVALLES CLAUDIA PATRICIA NATHALI',    'A', NULL, 17),
    ('2022015348','HUERTAS ZAMUDIO SEBASTIAN ALEJANDRO',         'A', NULL, 18),
    ('2021017473','IPENZA ALBA ANTHONY JUNIOR',                  'A', NULL, 19),
    ('2018010076','JARA BECERRA JOSE MARIA',                     'A', NULL, 20),
    ('2022015419','LAZO SOLANO LUIS EDUARDO',                    'A', NULL, 21),
    ('2022015223','MAGUIÑA REYES GABRIEL OMAR',                  'A', NULL, 22),
    ('2022015232','ORBEGOZO RELUZ DIEGO RODRIGO',                'A', NULL, 23),
    ('2022015188','PASHANASTE FASABI DHANERY NATALIA',           'A', NULL, 24),
    ('2022015241','QUIJANO OCHOA EDGARD DABERT',                 'A', NULL, 25),
    ('2020011069','RUIZ SAAVEDRA DANIEL SEBASTIAN',              'A', NULL, 26),
    ('2018018533','SANCHEZ HERMITAÑO ELIAS SMIT',                'A', NULL, 27),
    ('2021017321','SANTAMARIA MACHACA VICTOR RICARDO',           'A', NULL, 28),
    ('2022015197','VENTURA LOPEZ LEONEL SANTIAGO',               'A', NULL, 29),
    ('2021017339','VILLEGAS DIAZ CHRISTIAN DARLING',             'A', NULL, 30),
    ('2018021862','YRAMATEGUI LOZANO GERSON RENATO',             'A', NULL, 31)
  ON CONFLICT (codigo) DO NOTHING;

  -- ── ESTUDIANTES SECCIÓN B (30) ────────────────────────────
  INSERT INTO public.estudiantes (codigo, apellidos_y_nombres, seccion, grupo, ord) VALUES
    ('2022015428','ALBARRACIN RIVERA JOSUE',                     'B', '2',  1),
    ('2021017375','ARI TIPULA IVAN CRISTIAN',                    'B', '2',  2),
    ('2019015483','AYASTA CHAVEZ EDUARDO MARCELO',               'B', NULL, 3),
    ('2022015161','AYLLON HUALPARUCA GIANCARLO',                 'B', '3',  4),
    ('202314592', 'BONILLA NIEVES LINCOLN ANTHONY',              'B', '2',  5),
    ('202197196', 'CASTRO JIMENEZ MIGUEL ANGEL',                 'B', '6',  6),
    ('202232098', 'CCANRE TAYA FABIOLA LISSETT',                 'B', '6',  7),
    ('202118289', 'CRUZADO PACHECO ANTONI POE',                  'B', '1',  8),
    ('202313434', 'GALLEGOS GOMEZ JEFERSON GERMAN',              'B', '4',  9),
    ('202397080', 'HUAMAN SINARAHUA JENNERY',                    'B', '6',  10),
    ('202311395', 'LAGUNA SIERRALTA ANGELLO LUCIANO',            'B', NULL, 11),
    ('202355302', 'LOYOLA VERA LUIS SEBASTIAN',                  'B', '3',  12),
    ('202103905', 'LOZA BENITES ABRA FERNANDO',                  'B', '3',  13),
    ('202128657', 'LUJAN BERNAOLA GERAL EMILIO',                 'B', NULL, 14),
    ('202166237', 'MITAC ESPINOZA FAVIO JUAN',                   'B', NULL, 15),
    ('202303478', 'MONTES TRIVEÑO OSCAR',                        'B', '4',  16),
    ('202326062', 'NIEVES CAMPOS ELIZABETH YOLANDA',             'B', '5',  17),
    ('202385181', 'OBREGON CASTILLEJO ALVARO AMIR',              'B', '5',  18),
    ('202371426', 'ORTIZ GALVEZ HAROLD ARTURO',                  'B', '5',  19),
    ('202228893', 'POTESTA TOLEDO ANGEL DIEGO',                  'B', '1',  20),
    ('202277236', 'QUISPE CHINGUEL HAYLEY DAVID',                'B', '4',  21),
    ('202200851', 'ROQUE AQUISE LILY',                           'B', '5',  22),
    ('202191506', 'SALINAS FERNANDEZ MATEO RAFAEL',              'B', '1',  23),
    ('202244597', 'TESILLO HUAMANGA JACKELINE',                  'B', '4',  24),
    ('202220379', 'VEGA GUTIERREZ WILLIAM FACUNDO CELSO',        'B', '3',  25),
    ('202144118', 'VIDAL PEREZ SERGIO ESTEBAN',                  'B', '5',  26),
    ('202112156', 'VILLA MALLMA JOSUE EMANUEL',                  'B', '1',  27),
    ('202212676', 'VILLAVERDE CONDORI ARMANDO',                  'B', '6',  28),
    ('202245082', 'VIVAS CHAPOÑAN JAIME RAMIRO',                 'B', '1',  29),
    ('202334671', 'YAPIAS CALZADA JAMES LISTER',                 'B', '4',  30)
  ON CONFLICT (codigo) DO NOTHING;

  -- ── MATRÍCULAS + NOTAS (null) + 16 SESIONES ASISTENCIA ───
  FOR r IN
    SELECT e.id AS est_id
    FROM public.estudiantes e
    WHERE NOT EXISTS (
      SELECT 1 FROM public.matriculas m
      WHERE m.estudiante_id = e.id AND m.curso_id = v_curso_id
    )
  LOOP
    -- matrícula
    INSERT INTO public.matriculas (estudiante_id, curso_id, periodo)
    VALUES (r.est_id, v_curso_id, '2026-I')
    ON CONFLICT DO NOTHING;

    -- notas vacías
    INSERT INTO public.notas (matricula_id)
    SELECT m.id FROM public.matriculas m
    WHERE m.estudiante_id = r.est_id AND m.curso_id = v_curso_id
    ON CONFLICT DO NOTHING;

    -- 16 sesiones de asistencia (presente = NULL = no registrada)
    INSERT INTO public.asistencias (matricula_id, sesion)
    SELECT m.id, s
    FROM public.matriculas m
    CROSS JOIN generate_series(1, 16) s
    WHERE m.estudiante_id = r.est_id AND m.curso_id = v_curso_id
    ON CONFLICT DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Seed completado: 61 estudiantes, matrícula, notas y asistencias en Base de Datos II 2026-I';
END $$;
