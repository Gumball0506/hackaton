// node supabase/seed_harold.js
// Sube datos completos de ORTIZ GALVEZ HAROLD ARTURO para MVP/IA

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://obtoeouejhukiywafdhy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idG9lb3Vlamh1a2l5d2FmZGh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE0MDc2NywiZXhwIjoyMDk3NzE2NzY3fQ.wgvajioAhW3UqscbhH6BYhEt3zNHUYYP5cGxt30EtZA',
  { auth:{ autoRefreshToken:false, persistSession:false } }
)

const EST_ID   = 'ba6d0867-4d65-4d05-a270-bdf1b2f59a08'
const MAT_ID   = '2ac6f8a9-fe96-45ae-9328-af7570ee1e1b'
const TUTOR_ID = '00000000-0000-0000-0000-000000000001'

// ─────────────────────────────────────────────────────────────
// 1. ENTREVISTAS (3 sesiones con JSON estructurado para la IA)
// ─────────────────────────────────────────────────────────────
const entrevistas = [
  {
    estudiante_id: EST_ID,
    tutor_id:      TUTOR_ID,
    nombre:        'Entrevista inicial de tutoría — Sesión 1',
    storage_path:  null,
    fecha:         '2026-04-08',
    json_data: {
      sesion: 1,
      tipo: 'entrevista_inicial',
      fecha: '2026-04-08',
      lugar: 'Oficina de Tutoría — Pabellón A, 2do piso',
      duracion_minutos: 40,
      tutor: 'Mg. Jorge Mendoza Quispe',
      estudiante: {
        nombre:  'Harold Arturo Ortiz Gálvez',
        codigo:  '202371426',
        seccion: 'B',
        grupo:   '5',
        ciclo:   'V',
        carrera: 'Ingeniería Informática'
      },
      motivo_convocatoria: 'Bajo rendimiento académico detectado en primeras semanas y ausencias reiteradas.',
      resumen_entrevista: 'El estudiante asistió a la entrevista inicial de tutoría. Se mostró colaborativo aunque visiblemente incómodo. Refirió tener dificultades para adaptarse al ritmo del ciclo V, en especial al curso de Base de Datos II. Mencionó que trabaja medio tiempo en una empresa de logística (turno tarde, 14:00–20:00), lo que le genera conflicto con horas de estudio. No cuenta con apoyo familiar cercano ya que vive solo en un cuarto alquilado en SJL.',
      situacion_academica: {
        cursos_en_riesgo: ['Base de Datos II', 'Algoritmos y Estructuras de Datos'],
        faltas_acumuladas: 6,
        notas_parciales:  { parcial: 7.5, practica: 8.0 },
        autopercepcion: 'El estudiante reconoce que está por debajo del nivel esperado. Atribuye el bajo rendimiento a la falta de tiempo y a que siente que el curso es difícil.'
      },
      factores_riesgo: [
        'Trabaja medio tiempo en horario tarde (conflicto con estudios nocturnos)',
        'Vive solo, sin red de apoyo familiar en Lima',
        'Dificultades económicas — menciona que a veces no almuerza por falta de tiempo/dinero',
        'Ausencias acumuladas por ingreso tardío al trabajo',
        'Bajo nivel de autoeficacia académica'
      ],
      fortalezas: [
        'Capacidad analítica evidenciada en ejercicios prácticos',
        'Disposición para mejorar si se le apoya',
        'Asistió voluntariamente a la entrevista sin necesidad de presión'
      ],
      compromisos_estudiante: [
        'Asistir al 100% de las sesiones restantes',
        'Presentar las prácticas pendientes',
        'Acudir a tutoría de pares (grupo 5)',
        'Notificar al tutor si hay nuevas ausencias por causa laboral'
      ],
      acciones_tutor: [
        'Derivar a servicio de psicología universitaria',
        'Coordinar justificación de faltas con docente del curso',
        'Solicitar apoyo del programa de bienestar estudiantil (becas comedor)',
        'Programar segunda entrevista en 3 semanas'
      ],
      nivel_riesgo: 'ALTO',
      requiere_derivacion_psicologa: true,
      observacion_general: 'Estudiante con alta vulnerabilidad socioeconómica. Requiere seguimiento activo y articulación con servicios de bienestar. Tiene potencial académico pero sus condiciones de vida afectan su desempeño.'
    }
  },
  {
    estudiante_id: EST_ID,
    tutor_id:      TUTOR_ID,
    nombre:        'Entrevista de seguimiento — Sesión 2',
    storage_path:  null,
    fecha:         '2026-05-06',
    json_data: {
      sesion: 2,
      tipo: 'seguimiento',
      fecha: '2026-05-06',
      lugar: 'Oficina de Tutoría — Pabellón A, 2do piso',
      duracion_minutos: 30,
      tutor: 'Mg. Jorge Mendoza Quispe',
      estudiante: {
        nombre:  'Harold Arturo Ortiz Gálvez',
        codigo:  '202371426',
        seccion: 'B',
        grupo:   '5'
      },
      motivo: 'Seguimiento de compromisos adquiridos en sesión 1 y evaluación post examen parcial.',
      resumen_entrevista: 'Harold llegó puntual. Refirió que logró reducir sus ausencias (solo 1 nueva falta desde la última entrevista por emergencia en el trabajo). Sin embargo, el examen parcial no tuvo el resultado esperado (nota: 7.5/20). Menciona que estudió la noche anterior al examen, sin descanso adecuado. Se nota mayor disposición emocional que en la primera sesión.',
      avance_compromisos: {
        asistencia:       { cumplido: 'parcial', detalle: 'Solo 1 nueva falta justificada' },
        practicas:        { cumplido: 'parcial', detalle: 'Entregó práctica 2, falta práctica 3' },
        tutoria_pares:    { cumplido: 'no',      detalle: 'Refiere que el horario del grupo no le cuadra' },
        comunicacion:     { cumplido: 'si',      detalle: 'Notificó anticipadamente la falta por trabajo' }
      },
      situacion_actual: {
        nota_parcial:     7.5,
        nota_practica2:   8.0,
        faltas_total:     6,
        estado_emocional: 'Ansioso pero motivado. Expresa que no quiere jalar el curso.',
        situacion_laboral:'Negociando con su empleador para cambiar turno a mañana desde julio.'
      },
      factores_nuevos: [
        'Insomnio por estrés laboral y académico',
        'Deuda con pensión del ciclo (2 meses)'
      ],
      plan_ajustado: [
        'Gestionar beca comedor (tutor inició trámite)',
        'Reunión con docente de Base de Datos II para plan de recuperación',
        'Coordinar cita con psicólogo universitario (pendiente desde sesión 1)',
        'Establecer horario fijo de estudio: lunes, miércoles y viernes 21:00–23:00',
        'Apoyo con material digital del curso (tutor enviará recursos)'
      ],
      nivel_riesgo: 'ALTO',
      requiere_derivacion_psicologa: true,
      observacion_general: 'Hay avances mínimos pero significativos en compromiso. El factor económico sigue siendo el principal obstáculo. Urgente concretar cita con psicología y beca comedor.'
    }
  },
  {
    estudiante_id: EST_ID,
    tutor_id:      TUTOR_ID,
    nombre:        'Entrevista de intervención crítica — Sesión 3',
    storage_path:  null,
    fecha:         '2026-06-10',
    json_data: {
      sesion: 3,
      tipo: 'intervencion_critica',
      fecha: '2026-06-10',
      lugar: 'Online — Google Meet',
      duracion_minutos: 45,
      tutor: 'Mg. Jorge Mendoza Quispe',
      estudiante: {
        nombre:  'Harold Arturo Ortiz Gálvez',
        codigo:  '202371426',
        seccion: 'B',
        grupo:   '5'
      },
      motivo: 'Riesgo de inhabilitación por faltas. Nota final en riesgo crítico. Intervención antes de examen final.',
      resumen_entrevista: 'Sesión online coordinada con urgencia. Harold había dejado de responder mensajes por una semana. Al contacto, refirió una situación crítica: su empleador lo despidió, dejándolo sin ingresos. Considera dejar la universidad temporalmente. El tutor realizó una intervención motivacional y articuló apoyo con la oficina de bienestar estudiantil de manera inmediata.',
      situacion_critica: {
        nota_parcial:   7.5,
        nota_practica:  8.0,
        faltas:         6,
        promedio_actual: 7.97,
        riesgo_inhabilitacion: true,
        considera_retiro: true,
        motivo_retiro_considerado: 'Pérdida de empleo, dificultades económicas severas'
      },
      intervencion_realizada: {
        tipo: 'motivacional_y_social',
        tecnicas_usadas: [
          'Escucha activa y validación emocional',
          'Reencuadre cognitivo: el retiro no soluciona el problema económico',
          'Identificación de recursos disponibles (beca, comedor, préstamo estudiantil)',
          'Establecimiento de meta mínima alcanzable: aprobar con 11'
        ],
        resultado_inmediato: 'Harold decidió continuar el ciclo. Firmó compromiso de permanencia y plan de recuperación.'
      },
      plan_recuperacion_final: {
        meta_nota_final_requerida: 'Necesita mínimo 14 en examen final para aprobar con promedio 11',
        sesiones_repaso: [
          { fecha:'2026-06-17', tema:'SQL Avanzado — Procedimientos almacenados', modalidad:'Online' },
          { fecha:'2026-06-20', tema:'Triggers y vistas', modalidad:'Presencial' }
        ],
        apoyo_economico_gestionado: [
          'Beca comedor aprobada (inicio: 16 junio)',
          'Solicitud de fraccionamiento de pensión presentada'
        ],
        cita_psicologa: { fecha:'2026-06-25', hora:'09:00', confirmada: true }
      },
      nivel_riesgo: 'CRITICO',
      requiere_derivacion_psicologa: true,
      requiere_seguimiento_semanal: true,
      observacion_general: 'Caso de alta complejidad socioeconómica y emocional. El estudiante tiene capacidad pero sus circunstancias vitales superan lo académico. Se logró retención. Seguimiento intensivo obligatorio hasta fin de ciclo.'
    }
  }
]

// ─────────────────────────────────────────────────────────────
// 2. OBSERVACIONES
// ─────────────────────────────────────────────────────────────
const observaciones = [
  {
    estudiante_id: EST_ID, tutor_id: TUTOR_ID,
    created_at: '2026-04-08T11:30:00Z',
    texto: 'Primera entrevista realizada. Estudiante con riesgo alto. Factores: empleo medio tiempo, vive solo en SJL sin apoyo familiar, dificultades económicas. Se iniciaron trámites de beca comedor. Derivado a psicología. Requiere seguimiento semanal.'
  },
  {
    estudiante_id: EST_ID, tutor_id: TUTOR_ID,
    created_at: '2026-04-22T09:00:00Z',
    texto: 'Harold no asistió a la sesión 8 sin previo aviso. Se le contactó por mensaje. Respondió que tuvo guardia de emergencia en trabajo. Se le recordó el compromiso de comunicar anticipadamente las ausencias.'
  },
  {
    estudiante_id: EST_ID, tutor_id: TUTOR_ID,
    created_at: '2026-05-06T10:00:00Z',
    texto: 'Segunda entrevista de seguimiento. Nota parcial: 7.5/20. Avance parcial en compromisos. Situación laboral sigue siendo el principal obstáculo. Se detectó posible insomnio por estrés. Se insistió en cita con psicología — el estudiante la ha postergado por trabajo.'
  },
  {
    estudiante_id: EST_ID, tutor_id: TUTOR_ID,
    created_at: '2026-05-20T08:30:00Z',
    texto: 'Revisión de práctica 3: entregó con 2 días de retraso. El docente la aceptó con descuento de punto. Nota práctica actualizada: 8.0. El tutor coordinó con docente para que Harold tenga un examen sustitutorio si llega al promedio mínimo.'
  },
  {
    estudiante_id: EST_ID, tutor_id: TUTOR_ID,
    created_at: '2026-06-03T07:00:00Z',
    texto: 'ALERTA: Harold dejó de responder mensajes hace 5 días. Ausentismo en sesiones 13, 14 y 15. Se intentó contacto por WhatsApp y correo institucional sin respuesta. Se programó llamada de emergencia.'
  },
  {
    estudiante_id: EST_ID, tutor_id: TUTOR_ID,
    created_at: '2026-06-10T14:00:00Z',
    texto: 'Entrevista de intervención crítica (online). Harold fue despedido de su trabajo. Consideraba dejar la universidad. Se realizó intervención motivacional exitosa — decidió continuar. Se gestionó beca comedor de urgencia (aprobada). Cita con psicología confirmada para 25/06. Plan de recuperación firmado.'
  },
  {
    estudiante_id: EST_ID, tutor_id: TUTOR_ID,
    created_at: '2026-06-17T10:00:00Z',
    texto: 'Sesión de repaso SQL organizada con Harold y 3 compañeros del grupo 5. Participó activamente. Se notó mayor concentración que en semanas anteriores. Manifiesta que la beca comedor le ha aliviado la presión económica. Ánimo mejorado.'
  }
]

// ─────────────────────────────────────────────────────────────
// 3. CITAS PSICÓLOGO
// ─────────────────────────────────────────────────────────────
const citas = [
  {
    estudiante_id: EST_ID, tutor_id: TUTOR_ID,
    fecha:  '2026-05-15T10:00:00Z',
    lugar:  'Consultorio Psicología — Pabellón B, 1er piso',
    motivo: 'Estrés académico y laboral. Posible insomnio por sobrecarga. Dificultades para concentrarse.',
    estado: 'cancelada',
    notas_adicionales: 'Harold no asistió — no pudo salir del trabajo a tiempo. Reprogramada.'
  },
  {
    estudiante_id: EST_ID, tutor_id: TUTOR_ID,
    fecha:  '2026-06-03T11:00:00Z',
    lugar:  'Consultorio Psicología — Pabellón B, 1er piso',
    motivo: 'Seguimiento: estrés crónico, posible cuadro de ansiedad académica, pensamiento de abandono universitario.',
    estado: 'cancelada',
    notas_adicionales: 'Cancelada por ausencia general del estudiante (período de desconexión). No fue localizable.'
  },
  {
    estudiante_id: EST_ID, tutor_id: TUTOR_ID,
    fecha:  '2026-06-25T09:00:00Z',
    lugar:  'Consultorio Psicología — Pabellón B, 1er piso',
    motivo: 'Intervención psicológica: manejo de ansiedad ante exámenes, estrategias de afrontamiento ante crisis económica, plan de metas a corto plazo.',
    estado: 'confirmada',
    notas_adicionales: 'Coordinada por tutor tras intervención del 10/06. Harold confirmó asistencia. Prioritaria.'
  }
]

// ─────────────────────────────────────────────────────────────
// 4. MENSAJES (hilo tutor ↔ estudiante)
// ─────────────────────────────────────────────────────────────
const mensajes = [
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'tutor',      created_at:'2026-04-08T12:00:00Z', contenido:'Harold, fue un placer conocerte hoy. Recuerda los compromisos que conversamos. Cualquier duda o imprevisto, escríbeme sin problema. ¡Ánimo!' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'estudiante', created_at:'2026-04-08T18:30:00Z', contenido:'Gracias profesor. Voy a tratar de cumplir lo que dijimos. El trabajo a veces complica pero voy a avisar si pasa algo.' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'tutor',      created_at:'2026-04-21T08:00:00Z', contenido:'Harold, mañana es la sesión 8. ¿Confirmas asistencia?' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'estudiante', created_at:'2026-04-21T20:00:00Z', contenido:'Profe me salió guardia de emergencia en el trabajo mañana. No voy a poder ir. Disculpe.' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'tutor',      created_at:'2026-04-21T20:30:00Z', contenido:'Ok Harold, gracias por avisar. Trata de justificarlo con el docente. Ya hablamos la próxima semana en la segunda entrevista.' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'tutor',      created_at:'2026-05-12T09:00:00Z', contenido:'Harold, te envío material de estudio para el examen final de BD2. Son los scripts de procedimientos almacenados y vistas. Revísalos.' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'estudiante', created_at:'2026-05-12T21:00:00Z', contenido:'Gracias profe. Los voy a revisar esta semana. El trabajo me tiene cansado pero voy a sacar tiempo.' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'tutor',      created_at:'2026-05-30T08:00:00Z', contenido:'Harold, ¿cómo vas con el estudio? No te he visto en las últimas 2 sesiones. ¿Todo bien?' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'tutor',      created_at:'2026-06-02T08:00:00Z', contenido:'Harold, intento contactarte nuevamente. Preocupa tu ausencia. Por favor responde este mensaje cuando puedas.' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'tutor',      created_at:'2026-06-05T09:00:00Z', contenido:'Harold, es urgente que conversemos. He coordinado una sesión online para el 10 de junio a las 2pm. Confirma por favor.' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'estudiante', created_at:'2026-06-09T23:00:00Z', contenido:'Profe disculpe el tiempo. Pasé por una situación muy difícil. Me quedé sin trabajo. Confirmo para mañana las 2pm.' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'tutor',      created_at:'2026-06-10T15:30:00Z', contenido:'Harold, me alegra que hayas decidido seguir adelante. Recuerda: la beca comedor empieza el lunes 16. El plan de recuperación está armado. Tú puedes con esto. Nos vemos el jueves para el repaso.' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'estudiante', created_at:'2026-06-10T16:00:00Z', contenido:'Gracias profe. La verdad pensé en rendirme pero la charla de hoy me ayudó bastante. Voy a dar todo en el final.' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'tutor',      created_at:'2026-06-17T11:00:00Z', contenido:'Buen trabajo en el repaso de hoy Harold. Se nota que entiendes los procedimientos almacenados. Sigue así para el examen del viernes. ¡Ánimo!' },
  { estudiante_id:EST_ID, tutor_id:TUTOR_ID, remitente:'estudiante', created_at:'2026-06-17T18:00:00Z', contenido:'Gracias profe. Con la beca del comedor ya puedo almorzar bien. Me siento más despejado para estudiar. Voy a ir a la sesión del jueves también.' },
]

// ─────────────────────────────────────────────────────────────
// INSERT
// ─────────────────────────────────────────────────────────────
async function run() {
  console.log('Insertando datos de ORTIZ GALVEZ HAROLD ARTURO...\n')

  // Limpiar datos previos
  await sb.from('entrevistas').delete().eq('estudiante_id', EST_ID)
  await sb.from('observaciones').delete().eq('estudiante_id', EST_ID)
  await sb.from('citas_psicologo').delete().eq('estudiante_id', EST_ID)
  await sb.from('mensajes').delete().eq('estudiante_id', EST_ID)
  console.log('  Datos previos eliminados')

  // Entrevistas
  const { error: e1 } = await sb.from('entrevistas').insert(entrevistas)
  if (e1) { console.error('ERROR entrevistas:', e1.message) } else console.log(`  ✓ ${entrevistas.length} entrevistas insertadas`)

  // Observaciones
  const { error: e2 } = await sb.from('observaciones').insert(observaciones)
  if (e2) { console.error('ERROR observaciones:', e2.message) } else console.log(`  ✓ ${observaciones.length} observaciones insertadas`)

  // Citas
  const { error: e3 } = await sb.from('citas_psicologo').insert(citas)
  if (e3) { console.error('ERROR citas:', e3.message) } else console.log(`  ✓ ${citas.length} citas insertadas`)

  // Mensajes
  const { error: e4 } = await sb.from('mensajes').insert(mensajes)
  if (e4) { console.error('ERROR mensajes:', e4.message) } else console.log(`  ✓ ${mensajes.length} mensajes insertados`)

  // Verificar RPC de IA
  console.log('\nVerificando RPC get_perfil_estudiante...')
  const { data, error: e5 } = await sb.rpc('get_perfil_estudiante', { p_codigo: '202371426' })
  if (e5) { console.error('ERROR RPC:', e5.message) }
  else {
    console.log('  ✓ RPC OK — campos retornados:')
    Object.keys(data).forEach(k => {
      const v = data[k]
      const len = Array.isArray(v) ? `(${v.length} items)` : typeof v === 'object' && v ? '(object)' : JSON.stringify(v)?.slice(0,60)
      console.log(`    ${k.padEnd(16)}: ${len}`)
    })
  }

  console.log('\nDone. Perfil completo de Harold disponible para la IA.')
}

run().catch(console.error)
