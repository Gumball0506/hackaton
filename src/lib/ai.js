/**
 * ai.js — Integración con el backend E-Tutor (llm.ts → Ollama via CF Tunnel)
 *
 * El backend corre en VITE_BACKEND_URL (default: http://localhost:3001) y
 * proxea todas las llamadas a llm.mystic-byte.com con los CF-Access headers.
 * Las credenciales CF-Access NUNCA llegan al navegador.
 *
 * Endpoints usados:
 *   POST /api/llm/chat       — Chat principal (modo tutor)
 *   POST /api/llm/recommend  — Recomendaciones pedagógicas
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

// ── Helpers ───────────────────────────────────────────────────────────────────

function contextToString(context) {
  if (!context) return ''
  if (typeof context === 'string') return context

  const e   = context.estudiante ?? context
  const n   = context.notas       ?? {}
  const obs = context.observaciones ?? []
  const entrev = context.entrevistas ?? []

  const lines = [
    `Nombre: ${e.apellidos_y_nombres ?? e.nombre ?? 'N/A'}`,
    `Código: ${e.codigo ?? 'N/A'} | Sección: ${e.seccion ?? '?'}`,
    `Promedio: ${n.promedio ?? context.promedio ?? '—'}/20`,
    `Parcial: ${n.parcial ?? context.parcial ?? '—'} | Final: ${n.final ?? context.final ?? '—'} | Práctica: ${n.practica ?? context.practica ?? '—'}`,
    `Faltas: ${context.faltas ?? 0}/16 | Riesgo: ${context.riesgo ?? 'PENDIENTE'}`,
  ]

  if (entrev.length > 0) {
    const ultima = entrev[0]
    const jd = typeof ultima.json_data === 'string' ? (() => { try { return JSON.parse(ultima.json_data) } catch { return {} } })() : (ultima.json_data ?? {})
    lines.push(`\nÚLTIMA ENTREVISTA (${ultima.fecha?.slice(0,10) ?? ''}): ${jd.resumen_entrevista?.slice(0, 300) ?? ultima.nombre ?? ''}`)
    if (jd.nivel_riesgo) lines.push(`Nivel riesgo: ${jd.nivel_riesgo}`)
    if (jd.factores_riesgo?.length) lines.push(`Factores: ${jd.factores_riesgo.slice(0,3).join('; ')}`)
    if (jd.plan_recuperacion_final || jd.acciones_tutor) {
      const plan = jd.plan_recuperacion_final ?? jd.acciones_tutor
      lines.push(`Plan: ${Array.isArray(plan) ? plan.slice(0,3).join('; ') : JSON.stringify(plan).slice(0,200)}`)
    }
  }

  if (obs.length > 0) {
    lines.push(`\nOBSERVACIONES RECIENTES:`)
    obs.slice(0, 3).forEach(o => lines.push(`  [${o.created_at?.slice(0,10) ?? ''}] ${o.texto?.slice(0,200) ?? ''}`))
  }

  return lines.join('\n')
}

// ── callAI — usado por Chatbot.jsx ───────────────────────────────────────────
/**
 * Envía un mensaje al asistente IA (modo tutor) y retorna la respuesta.
 *
 * @param {Array<{role:'user'|'assistant', content:string}>} messages
 * @param {object|null} context  Perfil completo del estudiante (getPerfilJSON)
 * @returns {Promise<string>}
 */
export async function callAI(messages, context) {
  if (!messages || messages.length === 0) throw new Error('No hay mensajes que enviar.')

  const lastMessage = messages[messages.length - 1]
  const userText    = lastMessage?.content?.trim() ?? ''
  if (!userText) throw new Error('El mensaje del usuario está vacío.')

  const history = messages
    .slice(0, -1)
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: m.content }))

  const res = await fetch(`${BACKEND_URL}/api/llm/chat`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      message: userText,
      history,
      mode:    'tutor',
      context: contextToString(context),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Error del servidor IA [${res.status}]: ${err.error ?? res.statusText}`)
  }

  const data = await res.json()
  const reply = data.reply ?? data.content ?? data.response ?? data.message
  if (!reply) throw new Error('La IA respondió con formato inesperado. Intenta de nuevo.')
  return reply
}

// ── clearSession — stub de compatibilidad ─────────────────────────────────────
// El nuevo backend es stateless (sin sesiones), pero Chatbot.jsx llama esto.
export function clearSession(_studentId) { /* no-op */ }

// ── callAIRisk — análisis de riesgo ──────────────────────────────────────────
export async function callAIRisk(studentData) {
  if (!studentData) throw new Error('Se requieren datos del estudiante.')

  const context = contextToString({ ...studentData, faltas: studentData.faltas ?? 0, riesgo: studentData.riesgo ?? 'PENDIENTE' })
  const weakAreas = []
  if ((studentData.promedio ?? studentData.notas?.promedio ?? 20) < 13) weakAreas.push('promedio bajo')
  if ((studentData.faltas ?? 0) >= 3) weakAreas.push('asistencia')
  if ((studentData.parcial ?? studentData.notas?.parcial ?? 20) < 11) weakAreas.push('examen parcial')

  const res = await fetch(`${BACKEND_URL}/api/llm/recommend`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ studentContext: context, weakAreas }),
  })

  if (!res.ok) throw new Error(`Error IA [${res.status}]`)
  const data  = await res.json()
  const payload = data.data ?? data

  return {
    nivel:           studentData.riesgo   ?? 'PENDIENTE',
    factores:        payload.recomendaciones ?? [],
    recomendaciones: payload.estrategias     ?? [],
    resumen:         payload.resumen         ?? '',
    raw:             payload,
  }
}

// ── callAIRecommend — recomendaciones pedagógicas ────────────────────────────
export async function callAIRecommend(profile, weakAreas = [], signal) {
  const res = await fetch(`${BACKEND_URL}/api/llm/recommend`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ studentContext: profile ?? {}, weakAreas }),
    signal,
  })

  if (!res.ok) throw new Error(`Error IA [${res.status}]`)
  const data    = await res.json()
  const payload = data.data ?? data

  return {
    recomendaciones: payload.recomendaciones ?? [],
    estrategias:     payload.estrategias     ?? [],
    prioridad:       payload.prioridad        ?? 'MEDIA',
    resumen:         payload.resumen          ?? '',
    raw:             payload,
  }
}
