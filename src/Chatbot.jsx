/**
 * Chatbot.jsx — Asistente IA del tutor
 *
 * PARA CONECTAR LA IA:
 *   1. Crea src/lib/ai.js y exporta `callAI(messages, context) → Promise<string>`
 *   2. Reemplaza el import stub de abajo por el real
 *   3. El `context` ya incluye todo el perfil del estudiante desde Supabase (notas,
 *      asistencias, entrevistas, observaciones, citas, mensajes)
 *
 * Ejemplo OpenAI (src/lib/ai.js):
 *   export async function callAI(messages, context) {
 *     const res = await fetch('https://api.openai.com/v1/chat/completions', {
 *       method: 'POST',
 *       headers: { 'Content-Type':'application/json', Authorization:`Bearer ${import.meta.env.VITE_OPENAI_KEY}` },
 *       body: JSON.stringify({
 *         model: 'gpt-4o',
 *         messages: [
 *           { role:'system', content: `Eres un asistente de tutoría universitaria. Contexto del estudiante: ${JSON.stringify(context)}` },
 *           ...messages
 *         ]
 *       })
 *     })
 *     const json = await res.json()
 *     return json.choices[0].message.content
 *   }
 */

import { useState, useRef, useEffect } from 'react'
import { getPerfilJSON } from './lib/queries'

// ── STUB — reemplazar con src/lib/ai.js real ─────────────────────────────────
async function callAI(_messages, _context) {
  // TODO: conectar API de IA aquí
  throw new Error('IA_NOT_CONNECTED')
}
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  brand:'#E85D04', dark:'#1A1A2E', border:'#E5E7EB',
  muted:'#9CA3AF', secondary:'#6B7280', bg:'#F4F6F9',
}

const PREGUNTAS_RAPIDAS = [
  '¿Cuál es el estado académico actual de este estudiante?',
  '¿Qué puntos clave debo tratar en la próxima entrevista?',
  '¿Hay factores de riesgo adicionales que deba considerar?',
  '¿Qué estrategias de acompañamiento me recomiendas?',
  '¿Cómo ha evolucionado el estudiante desde la primera entrevista?',
  '¿Cuál sería un plan de acción para mejorar su rendimiento?',
]

function MsgBurbuja({ msg }) {
  const esTutor = msg.role === 'user'
  return (
    <div style={{
      display:'flex', flexDirection: esTutor ? 'row-reverse' : 'row',
      gap:10, marginBottom:14, alignItems:'flex-end'
    }}>
      {!esTutor && (
        <div style={{
          width:32, height:32, borderRadius:'50%', background:C.dark, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:14
        }}>🤖</div>
      )}
      <div style={{
        maxWidth:'72%', padding:'10px 14px', borderRadius: esTutor ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: esTutor ? C.brand : '#fff',
        color: esTutor ? '#fff' : '#111827',
        border: esTutor ? 'none' : `1px solid ${C.border}`,
        fontSize:13.5, lineHeight:1.6,
        boxShadow:'0 1px 3px rgba(0,0,0,.06)'
      }}>
        {msg.role === 'loading' ? (
          <div style={{ display:'flex', gap:5, alignItems:'center', color:C.muted }}>
            <span style={{ animation:'dot 1.2s infinite .0s', display:'inline-block' }}>●</span>
            <span style={{ animation:'dot 1.2s infinite .2s', display:'inline-block' }}>●</span>
            <span style={{ animation:'dot 1.2s infinite .4s', display:'inline-block' }}>●</span>
          </div>
        ) : (
          <span style={{ whiteSpace:'pre-wrap' }}>{msg.content}</span>
        )}
      </div>
      {esTutor && (
        <div style={{
          width:32, height:32, borderRadius:'50%', background:C.brand, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontWeight:700, fontSize:12
        }}>JM</div>
      )}
    </div>
  )
}

export default function Chatbot({ estudiantes = [] }) {
  const [estudianteId, setEstudianteId]   = useState('')
  const [busqueda,     setBusqueda]       = useState('')
  const [perfilCtx,    setPerfilCtx]      = useState(null)
  const [loadingPerfil,setLoadingPerfil]  = useState(false)
  const [messages,     setMessages]       = useState([])
  const [input,        setInput]          = useState('')
  const [sending,      setSending]        = useState(false)
  const [error,        setError]          = useState('')
  const [showList,     setShowList]       = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const estudiantesFiltrados = busqueda
    ? estudiantes.filter(e => e.nombre.toLowerCase().includes(busqueda.toLowerCase()) || e.codigo?.includes(busqueda))
    : estudiantes.slice(0, 8)

  const estSeleccionado = estudiantes.find(e => e.id === estudianteId)

  async function seleccionarEstudiante(e) {
    setEstudianteId(e.id)
    setBusqueda(e.nombre)
    setShowList(false)
    setMessages([])
    setError('')
    setLoadingPerfil(true)
    try {
      const perfil = await getPerfilJSON(e.codigo)
      setPerfilCtx(perfil)
      setMessages([{
        role:'assistant',
        content:`Hola, Mg. Mendoza. Tengo cargado el perfil completo de **${e.nombre}** (${e.codigo}, Sección ${e.seccion}).\n\nEstado actual: promedio ${e.promedio ?? 'sin nota'}/20 · ${e.faltas} faltas · Riesgo: ${e.riesgo}.\n\n¿Qué desea saber para preparar la próxima entrevista?`
      }])
    } catch {
      setPerfilCtx({ estudiante: e })
      setMessages([{
        role:'assistant',
        content:`Perfil de **${e.nombre}** cargado con datos básicos.\n\nPromedio: ${e.promedio ?? '—'}/20 · Faltas: ${e.faltas}/16 · Riesgo: ${e.riesgo}.\n\n¿En qué puedo ayudarle?`
      }])
    } finally {
      setLoadingPerfil(false)
    }
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  async function enviar(texto) {
    const pregunta = (texto || input).trim()
    if (!pregunta || !estudianteId || sending) return
    setInput('')
    setError('')

    const newMsg = { role:'user', content:pregunta }
    setMessages(prev => [...prev, newMsg, { role:'loading', content:'' }])
    setSending(true)

    try {
      const historial = [...messages, newMsg].map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
      const respuesta = await callAI(historial, perfilCtx)
      setMessages(prev => [...prev.slice(0, -1), { role:'assistant', content:respuesta }])
    } catch (err) {
      setMessages(prev => prev.slice(0, -1))
      if (err.message === 'IA_NOT_CONNECTED') {
        setError('IA no conectada. Implementar callAI() en src/lib/ai.js para activar respuestas.')
      } else {
        setError('Error al contactar la IA: ' + err.message)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ height:'calc(100vh - 56px)', display:'flex', fontFamily:'Inter,sans-serif', overflow:'hidden' }}>

      {/* ── PANEL IZQUIERDO: selector + contexto ── */}
      <div style={{ width:280, flexShrink:0, background:'#fff', borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'16px', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:3, display:'flex', alignItems:'center', gap:7 }}>
            <i className="ti ti-robot" style={{ color:C.brand }}/> Asistente IA
          </div>
          <div style={{ fontSize:11, color:C.muted }}>Consulta sobre cualquier estudiante</div>
        </div>

        {/* Buscador de estudiante */}
        <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, position:'relative' }}>
          <div style={{ fontSize:11, color:C.secondary, fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'.4px' }}>Seleccionar estudiante</div>
          <div style={{ display:'flex', alignItems:'center', gap:7, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'0 10px', height:34 }}>
            <i className="ti ti-search" style={{ color:C.muted, fontSize:12 }}/>
            <input
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setShowList(true) }}
              onFocus={() => setShowList(true)}
              placeholder="Nombre o código..."
              style={{ border:'none', background:'transparent', outline:'none', fontSize:12.5, width:'100%' }}
            />
            {busqueda && (
              <button onClick={() => { setBusqueda(''); setEstudianteId(''); setShowList(false); setMessages([]); setPerfilCtx(null) }}
                style={{ border:'none', background:'none', cursor:'pointer', color:C.muted, fontSize:12, padding:0 }}>✕</button>
            )}
          </div>

          {/* Dropdown */}
          {showList && estudiantesFiltrados.length > 0 && (
            <div style={{
              position:'absolute', left:14, right:14, top:72, zIndex:50,
              background:'#fff', border:`1px solid ${C.border}`, borderRadius:8,
              boxShadow:'0 4px 16px rgba(0,0,0,.1)', maxHeight:240, overflowY:'auto'
            }}>
              {estudiantesFiltrados.map(e => (
                <button key={e.id} onClick={() => seleccionarEstudiante(e)}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap:9, padding:'9px 12px',
                    border:'none', background:'transparent', cursor:'pointer', textAlign:'left',
                    borderBottom:`1px solid ${C.border}`,
                    transition:'background .1s'
                  }}
                  onMouseEnter={ev => ev.currentTarget.style.background=C.bg}
                  onMouseLeave={ev => ev.currentTarget.style.background='transparent'}
                >
                  <div style={{
                    width:28, height:28, borderRadius:'50%', flexShrink:0,
                    background: e.riesgo==='ROJO'||e.riesgo==='ROJO_FALTAS' ? '#DC2626' : e.riesgo==='AMBAR' ? '#D97706' : C.brand,
                    color:'#fff', fontSize:10, fontWeight:700,
                    display:'flex', alignItems:'center', justifyContent:'center'
                  }}>{e.iniciales}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, lineHeight:1.2 }}>{e.nombre}</div>
                    <div style={{ fontSize:10.5, color:C.muted }}>{e.codigo} · Sec. {e.seccion}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ficha del estudiante seleccionado */}
        {loadingPerfil && (
          <div style={{ padding:20, textAlign:'center', color:C.muted, fontSize:12 }}>
            <i className="ti ti-loader" style={{ display:'block', fontSize:24, marginBottom:6, animation:'spin .8s linear infinite' }}/>
            Cargando perfil...
          </div>
        )}

        {estSeleccionado && !loadingPerfil && (
          <div style={{ flex:1, overflowY:'auto', padding:'14px' }}>
            {/* Tarjeta resumen */}
            <div style={{ background:C.bg, borderRadius:10, padding:'12px', marginBottom:12 }}>
              <div style={{ display:'flex', gap:9, alignItems:'center', marginBottom:10 }}>
                <div style={{
                  width:38, height:38, borderRadius:'50%', flexShrink:0,
                  background: estSeleccionado.riesgo==='ROJO'||estSeleccionado.riesgo==='ROJO_FALTAS'?'#DC2626':estSeleccionado.riesgo==='AMBAR'?'#D97706':C.brand,
                  color:'#fff', fontSize:13, fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>{estSeleccionado.iniciales}</div>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:700, lineHeight:1.2 }}>{estSeleccionado.nombre}</div>
                  <div style={{ fontSize:10.5, color:C.muted }}>{estSeleccionado.codigo} · Sec. {estSeleccionado.seccion}</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {[
                  ['Promedio', estSeleccionado.promedio !== null ? `${estSeleccionado.promedio}/20` : '—',
                    estSeleccionado.promedio === null ? C.muted : estSeleccionado.promedio >= 11 ? '#16A34A' : '#DC2626'],
                  ['Faltas',   `${estSeleccionado.faltas}/16`,
                    estSeleccionado.faltas >= 5 ? '#DC2626' : estSeleccionado.faltas >= 3 ? '#D97706' : '#16A34A'],
                  ['Parcial',  estSeleccionado.parcial !== null ? `${estSeleccionado.parcial}/20` : '—', C.secondary],
                  ['Riesgo',   estSeleccionado.riesgo,
                    estSeleccionado.riesgo==='VERDE'?'#16A34A':estSeleccionado.riesgo==='AMBAR'?'#D97706':'#DC2626'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ background:'#fff', borderRadius:7, padding:'7px 9px', border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:9.5, color:C.muted, marginBottom:2 }}>{label}</div>
                    <div style={{ fontSize:13, fontWeight:700, color }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contexto enviado a la IA */}
            <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:8, padding:'9px 11px', marginBottom:10 }}>
              <div style={{ fontSize:10.5, fontWeight:600, color:'#2563EB', marginBottom:3 }}>
                <i className="ti ti-database"/> Contexto IA cargado
              </div>
              <div style={{ fontSize:10.5, color:'#3B82F6', lineHeight:1.5 }}>
                {perfilCtx
                  ? 'Perfil completo: notas, asistencias, entrevistas, observaciones, citas.'
                  : 'Solo datos básicos disponibles.'}
              </div>
            </div>

            {/* Estado IA */}
            <div style={{ background:'#FFF8F0', border:'1px solid #FED7AA', borderRadius:8, padding:'9px 11px' }}>
              <div style={{ fontSize:10.5, fontWeight:600, color:C.brand, marginBottom:2 }}>
                <i className="ti ti-plug-x"/> IA pendiente de conexión
              </div>
              <div style={{ fontSize:10, color:'#9A3412', lineHeight:1.5 }}>
                Implementar <code style={{ background:'#FEE2D5', padding:'1px 4px', borderRadius:3 }}>callAI()</code> en <code style={{ background:'#FEE2D5', padding:'1px 4px', borderRadius:3 }}>src/lib/ai.js</code>
              </div>
            </div>
          </div>
        )}

        {!estSeleccionado && !loadingPerfil && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20, color:C.muted, textAlign:'center' }}>
            <i className="ti ti-user-search" style={{ fontSize:36, display:'block', marginBottom:10 }}/>
            <div style={{ fontSize:13, fontWeight:500 }}>Selecciona un estudiante</div>
            <div style={{ fontSize:11.5, marginTop:4 }}>Busca por nombre o código para cargar su perfil</div>
          </div>
        )}
      </div>

      {/* ── PANEL DERECHO: chat ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:C.bg }}>

        {/* Chat header */}
        <div style={{
          background:'#fff', borderBottom:`1px solid ${C.border}`, padding:'12px 20px',
          display:'flex', alignItems:'center', gap:12
        }}>
          {estSeleccionado ? (
            <>
              <div style={{
                width:36, height:36, borderRadius:'50%', flexShrink:0,
                background: estSeleccionado.riesgo==='ROJO'||estSeleccionado.riesgo==='ROJO_FALTAS'?'#DC2626':estSeleccionado.riesgo==='AMBAR'?'#D97706':C.brand,
                color:'#fff', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center'
              }}>{estSeleccionado.iniciales}</div>
              <div>
                <div style={{ fontSize:13.5, fontWeight:700 }}>{estSeleccionado.nombre}</div>
                <div style={{ fontSize:11, color:C.muted }}>Consultando perfil del estudiante</div>
              </div>
              <button onClick={() => { setMessages([]); if (estSeleccionado) seleccionarEstudiante(estSeleccionado) }}
                style={{ marginLeft:'auto', border:`1px solid ${C.border}`, background:'#fff', borderRadius:8, padding:'6px 12px', fontSize:12, color:C.secondary, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                <i className="ti ti-refresh"/>Nueva consulta
              </button>
            </>
          ) : (
            <div style={{ color:C.muted, fontSize:13 }}>
              <i className="ti ti-robot" style={{ marginRight:6, color:C.brand }}/>
              Selecciona un estudiante para iniciar la consulta
            </div>
          )}
        </div>

        {/* Área de mensajes */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px' }}>
          {messages.length === 0 && !estSeleccionado && (
            <div style={{ textAlign:'center', paddingTop:60 }}>
              <div style={{ fontSize:52, marginBottom:12 }}>🤖</div>
              <div style={{ fontSize:18, fontWeight:700, color:C.dark, marginBottom:8 }}>Asistente de Tutoría IA</div>
              <div style={{ fontSize:13.5, color:C.secondary, maxWidth:420, margin:'0 auto', lineHeight:1.7 }}>
                Selecciona un estudiante del panel izquierdo para cargar su perfil completo y comenzar a hacer preguntas.
              </div>
              <div style={{ marginTop:24, display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', maxWidth:480, margin:'24px auto 0' }}>
                {PREGUNTAS_RAPIDAS.slice(0, 3).map((p, i) => (
                  <div key={i} style={{
                    background:'#fff', border:`1px solid ${C.border}`, borderRadius:20,
                    padding:'6px 14px', fontSize:12, color:C.secondary
                  }}>{p}</div>
                ))}
              </div>
            </div>
          )}

          {messages.length === 0 && estSeleccionado && (
            <div style={{ textAlign:'center', paddingTop:30 }}>
              <div style={{ fontSize:13, color:C.secondary, marginBottom:16 }}>Preguntas sugeridas para la próxima entrevista:</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', maxWidth:580, margin:'0 auto' }}>
                {PREGUNTAS_RAPIDAS.map((p, i) => (
                  <button key={i} onClick={() => enviar(p)}
                    style={{
                      background:'#fff', border:`1px solid ${C.border}`, borderRadius:20,
                      padding:'7px 15px', fontSize:12.5, color:'#374151', cursor:'pointer',
                      transition:'all .15s', textAlign:'left'
                    }}
                    onMouseEnter={ev => { ev.currentTarget.style.borderColor = C.brand; ev.currentTarget.style.color = C.brand }}
                    onMouseLeave={ev => { ev.currentTarget.style.borderColor = C.border; ev.currentTarget.style.color = '#374151' }}
                  >{p}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => <MsgBurbuja key={i} msg={msg}/>)}
          <div ref={bottomRef}/>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            margin:'0 20px 12px', padding:'10px 14px', background:'#FFF8F0',
            border:`1px solid #FED7AA`, borderRadius:8, fontSize:12, color:'#9A3412',
            display:'flex', gap:8, alignItems:'flex-start'
          }}>
            <i className="ti ti-plug-x" style={{ flexShrink:0, marginTop:1 }}/>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ marginLeft:'auto', border:'none', background:'none', cursor:'pointer', color:C.muted, fontSize:12 }}>✕</button>
          </div>
        )}

        {/* Input */}
        <div style={{
          background:'#fff', borderTop:`1px solid ${C.border}`, padding:'14px 20px',
          display:'flex', gap:10, alignItems:'flex-end'
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
            placeholder={estSeleccionado ? 'Escribe tu pregunta sobre el estudiante... (Enter para enviar)' : 'Selecciona un estudiante primero'}
            disabled={!estSeleccionado || sending}
            rows={2}
            style={{
              flex:1, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 13px',
              fontSize:13.5, resize:'none', outline:'none', fontFamily:'Inter,sans-serif',
              background: !estSeleccionado ? C.bg : '#fff',
              color: !estSeleccionado ? C.muted : '#111827',
              lineHeight:1.5,
              transition:'border-color .15s'
            }}
            onFocus={e => { if (estSeleccionado) e.target.style.borderColor = C.brand }}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <button
            onClick={() => enviar()}
            disabled={!estSeleccionado || !input.trim() || sending}
            style={{
              width:42, height:42, borderRadius:10, border:'none', flexShrink:0,
              background: estSeleccionado && input.trim() ? C.brand : '#E5E7EB',
              color: estSeleccionado && input.trim() ? '#fff' : C.muted,
              cursor: estSeleccionado && input.trim() ? 'pointer' : 'not-allowed',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, transition:'background .15s'
            }}
          >
            {sending ? '⏳' : '➤'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dot { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
