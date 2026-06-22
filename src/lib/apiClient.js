/**
 * apiClient.js — Helper centralizado para llamadas al API de IA
 *
 * Estrategia de autenticación (en orden de prioridad):
 *   1. Bearer token de Supabase (si hay sesión activa)
 *   2. X-API-Key (fallback con VITE_API_KEY)
 */

import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'https://llm.mystic-byte.com/api/v1'
const API_KEY  = import.meta.env.VITE_API_KEY  || 'etutor-dev-key-2026'

/**
 * Construye los headers de autenticación.
 * Intenta obtener el JWT de Supabase; si no hay sesión, usa X-API-Key.
 */
async function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
      return headers
    }
  } catch {
    // Sin sesión Supabase — usar API key
  }

  headers['X-API-Key'] = API_KEY
  return headers
}

/**
 * Realiza una petición POST al API de IA.
 * @param {string} path   - Ruta relativa, p. ej. '/chat/sessions'
 * @param {object} body   - Cuerpo JSON
 * @param {AbortSignal} [signal] - Señal opcional para cancelar la petición
 * @returns {Promise<any>} - JSON de respuesta
 */
export async function apiPost(path, body, signal) {
  const headers = await buildHeaders()
  const url     = `${API_URL}${path}`

  let res
  try {
    res = await fetch(url, {
      method:  'POST',
      headers,
      body:    JSON.stringify(body),
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error(`Error de conexión con el servidor de IA (${url}): ${err.message}`)
  }

  if (!res.ok) {
    let detalle = ''
    try {
      const errJson = await res.json()
      detalle = errJson.detail || errJson.message || JSON.stringify(errJson)
    } catch {
      detalle = await res.text().catch(() => '')
    }
    throw new Error(`Error del servidor IA [${res.status}]: ${detalle || res.statusText}`)
  }

  return res.json()
}

/**
 * Realiza una petición GET al API de IA.
 * @param {string} path   - Ruta relativa
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export async function apiGet(path, signal) {
  const headers = await buildHeaders()
  // GET no lleva Content-Type
  delete headers['Content-Type']
  const url = `${API_URL}${path}`

  let res
  try {
    res = await fetch(url, { method: 'GET', headers, signal })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error(`Error de conexión con el servidor de IA: ${err.message}`)
  }

  if (!res.ok) {
    throw new Error(`Error del servidor IA [${res.status}]: ${res.statusText}`)
  }

  return res.json()
}
