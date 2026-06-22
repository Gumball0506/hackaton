import { supabase } from './supabase'

const CURSO_ID = '00000000-0000-0000-0000-000000000002'
const TUTOR_ID = '00000000-0000-0000-0000-000000000001'

// ── helpers ─────────────────────────────────────────────────────────────────
function iniciales(nombre) {
  const partes = nombre.trim().split(/\s+/)
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
  return nombre.slice(0, 2).toUpperCase()
}

function calcRiesgo(notas, asistencias) {
  if (!notas || (notas.parcial === null && notas.final === null && notas.practica === null)) {
    const faltas = asistencias?.filter(a => a.presente === false).length ?? 0
    if (faltas >= 5) return 'ROJO_FALTAS'
    return 'PENDIENTE'
  }
  const promedio = notas.promedio
  if (promedio === null) return 'PENDIENTE'
  const faltas = asistencias?.filter(a => a.presente === false).length ?? 0
  if (promedio < 11 || faltas >= 5) return 'ROJO'
  if (promedio < 13) return 'AMBAR'
  return 'VERDE'
}

// ── ESTUDIANTES ──────────────────────────────────────────────────────────────
export async function getEstudiantes() {
  const { data, error } = await supabase
    .from('matriculas')
    .select(`
      id,
      periodo,
      estudiantes (id, codigo, apellidos_y_nombres, seccion, grupo, ord),
      notas_con_promedio (parcial, final, practica, promedio),
      asistencias (sesion, presente)
    `)
    .eq('curso_id', CURSO_ID)
    .order('ord', { foreignTable: 'estudiantes', ascending: true })

  if (error) throw error

  return data.map(m => {
    const e     = m.estudiantes
    const notas = m.notas_con_promedio
    const asist = m.asistencias ?? []
    const riesgo = calcRiesgo(notas, asist)
    const faltas  = asist.filter(a => a.presente === false).length
    const presentes = asist.filter(a => a.presente === true).length

    return {
      id:                  e.id,
      matricula_id:        m.id,
      codigo:              e.codigo,
      nombre:              e.apellidos_y_nombres,
      iniciales:           iniciales(e.apellidos_y_nombres),
      seccion:             e.seccion,
      grupo:               e.grupo,
      ord:                 e.ord,
      ciclo:               'V',
      parcial:             notas?.parcial   ?? null,
      final:               notas?.final     ?? null,
      practica:            notas?.practica  ?? null,
      promedio:            notas?.promedio  ?? null,
      faltas,
      presentes,
      pct_asistencia:      presentes > 0 ? Math.round((presentes / 16) * 100) : null,
      riesgo,
      asistencias:         asist,
    }
  })
}

export async function getEstudianteDetalle(estudianteId) {
  const { data: est, error: e1 } = await supabase
    .from('estudiantes').select('*').eq('id', estudianteId).single()
  if (e1) throw e1

  const { data: mat, error: e2 } = await supabase
    .from('matriculas').select('id').eq('estudiante_id', estudianteId).eq('curso_id', CURSO_ID).single()
  if (e2) throw e2

  const [
    { data: notas },
    { data: asist },
    { data: obs },
    { data: entrevistas },
    { data: citas },
    { data: mensajes },
  ] = await Promise.all([
    supabase.from('notas_con_promedio').select('*').eq('matricula_id', mat.id).single(),
    supabase.from('asistencias').select('*').eq('matricula_id', mat.id).order('sesion'),
    supabase.from('observaciones').select('*').eq('estudiante_id', estudianteId).order('created_at', { ascending: false }),
    supabase.from('entrevistas').select('*').eq('estudiante_id', estudianteId).order('created_at', { ascending: false }),
    supabase.from('citas_psicologo').select('*').eq('estudiante_id', estudianteId).order('created_at', { ascending: false }),
    supabase.from('mensajes').select('*').eq('estudiante_id', estudianteId).order('created_at', { ascending: false }),
  ])

  const faltas   = asist?.filter(a => a.presente === false).length ?? 0
  const presentes = asist?.filter(a => a.presente === true).length ?? 0

  return {
    estudiante:   est,
    matricula_id: mat.id,
    notas:        notas ?? {},
    asistencias:  asist ?? [],
    observaciones: obs ?? [],
    entrevistas:  entrevistas ?? [],
    citas:        citas ?? [],
    mensajes:     mensajes ?? [],
    faltas,
    presentes,
    pct_asistencia: presentes > 0 ? Math.round((presentes / 16) * 100) : 0,
    riesgo: calcRiesgo(notas, asist),
  }
}

// ── NOTAS ────────────────────────────────────────────────────────────────────
export async function updateNota(matriculaId, campo, valor) {
  const { error } = await supabase
    .from('notas')
    .update({ [campo]: valor, updated_at: new Date().toISOString() })
    .eq('matricula_id', matriculaId)
  if (error) throw error
}

// ── ASISTENCIAS ──────────────────────────────────────────────────────────────
export async function updateAsistencia(matriculaId, sesion, presente) {
  const { error } = await supabase
    .from('asistencias')
    .update({ presente })
    .eq('matricula_id', matriculaId)
    .eq('sesion', sesion)
  if (error) throw error
}

// ── OBSERVACIONES ────────────────────────────────────────────────────────────
export async function addObservacion(estudianteId, texto) {
  const { data, error } = await supabase
    .from('observaciones')
    .insert({ estudiante_id: estudianteId, tutor_id: TUTOR_ID, texto })
    .select().single()
  if (error) throw error
  return data
}

// ── MENSAJES ─────────────────────────────────────────────────────────────────
export async function sendMensaje(estudianteId, contenido, remitente = 'tutor') {
  const { data, error } = await supabase
    .from('mensajes')
    .insert({ estudiante_id: estudianteId, tutor_id: TUTOR_ID, remitente, contenido })
    .select().single()
  if (error) throw error
  return data
}

export function subscribeMensajes(estudianteId, callback) {
  return supabase
    .channel(`mensajes-${estudianteId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'mensajes',
      filter: `estudiante_id=eq.${estudianteId}`
    }, payload => callback(payload.new))
    .subscribe()
}

// ── ENTREVISTAS ───────────────────────────────────────────────────────────────
export async function uploadEntrevista(estudianteId, nombre, jsonData, file) {
  let storagePath = null

  if (file) {
    const ext  = file.name.split('.').pop()
    const path = `${estudianteId}/${Date.now()}.${ext}`
    const { error: storErr } = await supabase.storage
      .from('entrevistas').upload(path, file)
    if (!storErr) storagePath = path
  }

  const { data, error } = await supabase
    .from('entrevistas')
    .insert({
      estudiante_id: estudianteId,
      tutor_id: TUTOR_ID,
      nombre,
      storage_path: storagePath,
      json_data: jsonData ?? {},
      fecha: new Date().toISOString().slice(0, 10)
    })
    .select().single()
  if (error) throw error
  return data
}

// ── CITAS PSICÓLOGO ───────────────────────────────────────────────────────────
export async function agendarCita(estudianteId, { fecha, lugar, motivo }) {
  const { data, error } = await supabase
    .from('citas_psicologo')
    .insert({ estudiante_id: estudianteId, tutor_id: TUTOR_ID, fecha, lugar, motivo, estado: 'pendiente' })
    .select().single()
  if (error) throw error
  return data
}

export async function updateCita(citaId, estado) {
  const { error } = await supabase
    .from('citas_psicologo').update({ estado }).eq('id', citaId)
  if (error) throw error
}

// ── PERFIL JSON para chatbot móvil ────────────────────────────────────────────
export async function getPerfilJSON(codigo) {
  const { data, error } = await supabase.rpc('get_perfil_estudiante', { p_codigo: codigo })
  if (error) throw error
  return data
}

// ── KPIs agregados ────────────────────────────────────────────────────────────
export function calcKPIs(estudiantes) {
  const total    = estudiantes.length
  const conNota  = estudiantes.filter(e => e.promedio !== null)
  const promedios = conNota.map(e => e.promedio)
  const avg      = promedios.length ? (promedios.reduce((a,b)=>a+b,0)/promedios.length).toFixed(1) : null
  const rojos    = estudiantes.filter(e => e.riesgo === 'ROJO' || e.riesgo === 'ROJO_FALTAS').length
  const ambar    = estudiantes.filter(e => e.riesgo === 'AMBAR').length
  const verdes   = estudiantes.filter(e => e.riesgo === 'VERDE').length

  const sorted = [...conNota].sort((a,b) => (b.promedio??0) - (a.promedio??0))
  const decimo = Math.floor(total * 0.0667)
  const tercio = Math.floor(total * 0.333)

  return { total, avg, rojos, ambar, verdes, conNota: conNota.length, decimo, tercio, sorted }
}
