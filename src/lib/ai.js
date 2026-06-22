/**
 * ai.js — Integración con el API de IA de E-Tutor
 *
 * Endpoints utilizados:
 *   POST /chat/sessions                      → crea sesión de chat
 *   POST /chat/sessions/:id/message          → envía mensaje (respuesta JSON, no SSE)
 *   POST /ai/risk/analyze                    → análisis de riesgo por estudiante
 *   POST /ai/recommend                       → recomendaciones para grupo/área débil
 *
 * El sessionId se guarda en sessionStorage con clave `ai_session_<studentId>` para
 * mantener continuidad de conversación mientras dure la pestaña del navegador.
 */

import { apiPost } from './apiClient'

// ── Gestión de sesiones de chat ──────────────────────────────────────────────

/**
 * Recupera el sessionId almacenado para un estudiante, o crea uno nuevo.
 * @param {string} studentId
 * @returns {Promise<string>} sessionId
 */
async function getOrCreateSession(studentId) {
  const cacheKey = `ai_session_${studentId}`
  const cached   = sessionStorage.getItem(cacheKey)
  if (cached) return cached

  // Crear nueva sesión en el API
  const data = await apiPost('/chat/sessions', {
    studentId,
    context: 'tutor_web',
  })

  // NestJS envuelve en { success, data: { id } }
  const payload   = data?.data ?? data
  const sessionId = payload?.id || payload?.session_id || payload?.sessionId
  if (!sessionId) {
    throw new Error('El servidor no devolvió un ID de sesión de chat válido.')
  }

  sessionStorage.setItem(cacheKey, sessionId)
  return sessionId
}

/**
 * Descarta el sessionId guardado (útil al cambiar de estudiante).
 * @param {string} studentId
 */
export function clearSession(studentId) {
  if (studentId) {
    sessionStorage.removeItem(`ai_session_${studentId}`)
  }
}

// ── Chat principal ────────────────────────────────────────────────────────────

/**
 * Envía un mensaje al asistente IA y retorna la respuesta como string.
 *
 * @param {Array<{role:'user'|'assistant', content:string}>} messages
 *   Historial completo de la conversación (el último es el mensaje del usuario).
 * @param {object|null} context
 *   Perfil completo del estudiante desde Supabase (resultado de getPerfilJSON).
 * @returns {Promise<string>} Respuesta del modelo
 */
export async function callAI(messages, context) {
  if (!messages || messages.length === 0) {
    throw new Error('No hay mensajes que enviar.')
  }

  const studentId  = context?.estudiante?.id || context?.id || 'unknown'
  const lastMessage = messages[messages.length - 1]

  // El mensaje que enviamos al API debe ser el último del usuario
  const userText = lastMessage?.content || ''
  if (!userText.trim()) {
    throw new Error('El mensaje del usuario está vacío.')
  }

  let sessionId
  try {
    sessionId = await getOrCreateSession(studentId)
  } catch (err) {
    throw new Error(`No se pudo iniciar sesión de chat con la IA: ${err.message}`)
  }

  const body = {
    message:   userText,
    studentId,
    // Enviamos el contexto del estudiante y el historial para que el backend
    // pueda construir el prompt completo si lo necesita
    context:   context ?? null,
    history:   messages.slice(0, -1), // historial sin el último mensaje (ya va en "message")
  }

  let data
  try {
    data = await apiPost(`/chat/sessions/${sessionId}/message`, body)
  } catch (err) {
    // Si la sesión expiró en el servidor (404/401), limpiarla y reintentar una vez
    if (err.message.includes('[404]') || err.message.includes('[401]')) {
      clearSession(studentId)
      try {
        sessionId = await getOrCreateSession(studentId)
        data = await apiPost(`/chat/sessions/${sessionId}/message`, body)
      } catch (retryErr) {
        throw new Error(`Error al contactar la IA (reintento fallido): ${retryErr.message}`)
      }
    } else {
      throw err
    }
  }

  // NestJS TransformInterceptor envuelve: { success: true, data: {...}, timestamp }
  const payload = data?.data ?? data
  const respuesta =
    payload?.content    ||
    payload?.response   ||
    payload?.message    ||
    payload?.reply      ||
    payload?.text       ||
    (typeof payload === 'string' ? payload : null)

  if (!respuesta) {
    throw new Error('La IA respondió con un formato inesperado. Intenta nuevamente.')
  }

  return respuesta
}

// ── Análisis de riesgo ────────────────────────────────────────────────────────

/**
 * Analiza el riesgo académico de un estudiante usando el endpoint especializado.
 *
 * @param {object} studentData  Objeto estudiante desde getEstudiantes() o getEstudianteDetalle()
 * @returns {Promise<{
 *   nivel: string,
 *   factores: string[],
 *   recomendaciones: string[],
 *   resumen: string
 * }>}
 */
export async function callAIRisk(studentData) {
  if (!studentData) {
    throw new Error('Se requieren datos del estudiante para el análisis de riesgo.')
  }

  const body = {
    studentId: studentData.id || studentData.estudiante?.id || 'unknown',
    factors: {
      promedio:    studentData.promedio   ?? studentData.notas?.promedio   ?? null,
      parcial:     studentData.parcial    ?? studentData.notas?.parcial    ?? null,
      final:       studentData.final      ?? studentData.notas?.final      ?? null,
      practica:    studentData.practica   ?? studentData.notas?.practica   ?? null,
      faltas:      studentData.faltas     ?? 0,
      riesgo:      studentData.riesgo     ?? 'PENDIENTE',
      seccion:     studentData.seccion    ?? null,
      asistencias: studentData.asistencias ?? [],
    },
    // Datos de contexto extra si están disponibles (perfil completo)
    context: studentData,
  }

  const data = await apiPost('/ai/risk/analyze', body)

  const payload = data?.data ?? data
  return {
    nivel:           payload?.nivel          || payload?.risk_level   || payload?.level || 'DESCONOCIDO',
    factores:        payload?.factores       || payload?.factors      || [],
    recomendaciones: payload?.recomendaciones|| payload?.recommendations || [],
    resumen:         payload?.resumen        || payload?.summary      || payload?.analysis || '',
    raw:             payload,
  }
}

// ── Recomendaciones ───────────────────────────────────────────────────────────

/**
 * Genera recomendaciones pedagógicas para un perfil o grupo dado.
 *
 * @param {object} profile     Resumen del grupo (KPIs, distribución, etc.)
 * @param {string[]} weakAreas Áreas débiles detectadas (p. ej. ['promedio bajo', 'faltas'])
 * @param {AbortSignal} [signal] Señal para cancelar la petición
 * @returns {Promise<{
 *   recomendaciones: string[],
 *   estrategias: string[],
 *   prioridad: string,
 *   resumen: string
 * }>}
 */
export async function callAIRecommend(profile, weakAreas = [], signal) {
  const body = {
    profile:   profile   ?? {},
    weakAreas: weakAreas ?? [],
    context:   'tutor_dashboard',
  }

  const data = await apiPost('/ai/recommend', body, signal)

  const payload = data?.data ?? data
  return {
    recomendaciones: payload?.recomendaciones   || payload?.recommendations || [],
    estrategias:     payload?.estrategias       || payload?.strategies      || [],
    prioridad:       payload?.prioridad         || payload?.priority        || 'MEDIA',
    resumen:         payload?.resumen           || payload?.summary         || '',
    raw:             payload,
  }
}
