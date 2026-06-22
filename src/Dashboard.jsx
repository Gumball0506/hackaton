import { useEffect, useState, useRef } from 'react'
import { calcKPIs } from './lib/queries'
import { callAIRecommend } from './lib/ai'

const PER_PAGE = 10

function RingChart({ pct, color }) {
  const r = 26, circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)
  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (pct / 100) * circ), 100)
    return () => clearTimeout(t)
  }, [pct, circ])
  return (
    <div style={{ position:'relative', width:'64px', height:'64px', flexShrink:0 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="#F1F1F4" strokeWidth="6"/>
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition:'stroke-dashoffset 1s ease' }}/>
      </svg>
      <div style={{
        position:'absolute', inset:0, display:'flex', alignItems:'center',
        justifyContent:'center', fontSize:'12px', fontWeight:600, color
      }}>{pct}%</div>
    </div>
  )
}

function riesgoStyle(r) {
  if (r === 'ROJO' || r === 'ROJO_FALTAS') return { bg:'#FEF2F2', pill:'#FEF2F2', pillTxt:'#991B1B', border:'#FECACA', dot:'#DC2626', txt: r==='ROJO_FALTAS'?'Faltas excesivas':'Riesgo alto' }
  if (r === 'AMBAR') return { bg:'#FFFDF5', pill:'#FFFBEB', pillTxt:'#B45309', border:'#FDE68A', dot:'#D97706', txt:'Riesgo mod.' }
  if (r === 'VERDE') return { bg:'#ffffff', pill:'#F0FDF4', pillTxt:'#15803D', border:'#BBF7D0', dot:'#16A34A', txt:'Sin riesgo' }
  return { bg:'#f9fafb', pill:'#F4F6F9', pillTxt:'#6B7280', border:'#E5E7EB', dot:'#9CA3AF', txt:'Pendiente' }
}

function notaColor(n) {
  if (n === null) return '#9CA3AF'
  if (n >= 14) return '#16A34A'
  if (n >= 11) return '#D97706'
  return '#DC2626'
}

export default function Dashboard({ estudiantes, onVerEstudiante, onRefresh }) {
  const [page, setPage] = useState(1)
  const kpis = calcKPIs(estudiantes)

  // ── Estado IA ──────────────────────────────────────────────────────────────
  const [iaStatus,   setIaStatus]   = useState('idle')   // 'idle'|'loading'|'ok'|'error'
  const [iaResult,   setIaResult]   = useState(null)
  const [iaError,    setIaError]    = useState('')
  const [iaConected, setIaConected] = useState(null)     // null=sin comprobar, true, false
  const abortRef = useRef(null)

  // Comprueba si el API responde al montar (sólo una vez por sesión)
  useEffect(() => {
    let cancelled = false
    async function checkConexion() {
      try {
        const { apiPost } = await import('./lib/apiClient')
        await apiPost('/health', {})
        if (!cancelled) setIaConected(true)
      } catch {
        if (!cancelled) setIaConected(false)
      }
    }
    // Usamos sessionStorage para no re-chequear en cada navegación
    const cached = sessionStorage.getItem('ia_conexion')
    if (cached !== null) {
      setIaConected(cached === 'true')
    } else {
      checkConexion().then(() => {
        sessionStorage.setItem('ia_conexion', String(!cancelled ? iaConected : false))
      })
    }
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function solicitarRecomendaciones() {
    if (iaStatus === 'loading') return
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setIaStatus('loading')
    setIaError('')
    setIaResult(null)

    const rojos  = estudiantes.filter(e => e.riesgo === 'ROJO' || e.riesgo === 'ROJO_FALTAS')
    const ambar  = estudiantes.filter(e => e.riesgo === 'AMBAR')
    const sinNota = estudiantes.filter(e => e.promedio === null)
    const weakAreas = []
    if (rojos.length > 0) weakAreas.push(`${rojos.length} estudiantes con riesgo alto`)
    if (ambar.length > 0) weakAreas.push(`${ambar.length} estudiantes con riesgo moderado`)
    if (sinNota.length > 0) weakAreas.push(`${sinNota.length} estudiantes sin nota registrada`)
    if (kpis.avg && parseFloat(kpis.avg) < 13) weakAreas.push(`Promedio general bajo: ${kpis.avg}/20`)

    const profile = {
      total:       kpis.total,
      promedio:    kpis.avg,
      rojos:       kpis.rojos,
      ambar:       kpis.ambar,
      verdes:      kpis.verdes,
      sinNota:     sinNota.length,
      conFaltas5:  estudiantes.filter(e => e.faltas >= 5).length,
      curso:       'Base de Datos II',
      periodo:     '2026-I',
    }

    try {
      const result = await callAIRecommend(profile, weakAreas, abortRef.current.signal)
      setIaResult(result)
      setIaStatus('ok')
      setIaConected(true)
      sessionStorage.setItem('ia_conexion', 'true')
    } catch (err) {
      if (err.name === 'AbortError') { setIaStatus('idle'); return }
      setIaError(err.message)
      setIaStatus('error')
      setIaConected(false)
      sessionStorage.setItem('ia_conexion', 'false')
    }
  }

  const ordenados = [...estudiantes].sort((a, b) => {
    const order = { ROJO:0, ROJO_FALTAS:1, AMBAR:2, VERDE:3, PENDIENTE:4 }
    return (order[a.riesgo] ?? 4) - (order[b.riesgo] ?? 4)
  })

  const totalPages = Math.max(1, Math.ceil(ordenados.length / PER_PAGE))
  const paged      = ordenados.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const semaforoData = [
    { estado:'VERDE', label:'Sin riesgo',      count: kpis.verdes, color:'#16A34A', pillBg:'#F0FDF4', pillColor:'#15803D', tag:null,       tagBg:'',       tagColor:'', desc:'Rendimiento estable.' },
    { estado:'AMBAR', label:'Riesgo moderado', count: kpis.ambar,  color:'#D97706', pillBg:'#FFFBEB', pillColor:'#B45309', tag:'PRIORIDAD', tagBg:'#FDE68A',tagColor:'#92400E', desc:'Caída en tendencia.' },
    { estado:'ROJO',  label:'Riesgo alto',     count: kpis.rojos,  color:'#DC2626', pillBg:'#FEF2F2', pillColor:'#991B1B', tag:'URGENTE',   tagBg:'#FECACA',tagColor:'#991B1B', desc:'Nota baja o faltas excesivas.' },
  ]

  const kpisCards = [
    { label:'Estudiantes asignados', icon:'ti-users',        iconColor:'#6B7280', value: kpis.total,          delta:'Sección A + B',           deltaColor:'#6B7280', valColor:'#111827' },
    { label:'Promedio general',      icon:'ti-chart-line',   iconColor:'#6B7280', value: kpis.avg ?? '—',     delta: kpis.conNota + ' con notas', deltaColor:'#9CA3AF', valColor:'#111827' },
    { label:'Tercio superior',       icon:'ti-trophy',       iconColor:'#16A34A', value: kpis.tercio,         delta:'top 33.3%',                deltaColor:'#16A34A', valColor:'#111827' },
    { label:'Décimo quinto',         icon:'ti-star',         iconColor:'#D97706', value: kpis.decimo,         delta:'top 6.7%',                 deltaColor:'#D97706', valColor:'#111827' },
    { label:'Riesgo alto',           icon:'ti-alert-circle', iconColor:'#DC2626', value: kpis.rojos,          delta: kpis.total > 0 ? Math.round(kpis.rojos/kpis.total*100)+'%' : '—', deltaColor:'#DC2626', valColor:'#DC2626' },
    { label:'Riesgo moderado',       icon:'ti-alert-triangle',iconColor:'#D97706', value: kpis.ambar,         delta: kpis.total > 0 ? Math.round(kpis.ambar/kpis.total*100)+'%' : '—', deltaColor:'#D97706', valColor:'#D97706' },
  ]

  return (
    <div style={{ padding:'24px', animation:'fadeUp .35s ease both' }}>
      {/* Filtros */}
      <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:'10px', marginBottom:'20px' }}>
        <span style={{ fontSize:'13px', color:'#6B7280', fontWeight:500 }}>Filtrar por:</span>
        {['Sección A','Sección B','Todos los grupos','2026-I'].map((opt, i) => (
          <select key={i} style={{
            border:'1px solid #E5E7EB', borderRadius:'8px', height:'36px',
            fontSize:'13px', padding:'0 10px', background:'#fff', cursor:'pointer'
          }}><option>{opt}</option></select>
        ))}
        <button onClick={onRefresh} style={{
          display:'inline-flex', alignItems:'center', gap:'6px',
          background:'#E85D04', color:'#fff', border:'none',
          borderRadius:'8px', height:'36px', padding:'0 15px',
          fontSize:'13px', fontWeight:600, cursor:'pointer'
        }}>
          <i className="ti ti-refresh"/>Actualizar
        </button>

        {/* Badge de estado de conexión con el API de IA */}
        <div style={{
          marginLeft:'auto', display:'flex', alignItems:'center', gap:6,
          background: iaConected === true ? '#F0FDF4' : iaConected === false ? '#FEF2F2' : '#F4F6F9',
          border: `1px solid ${iaConected === true ? '#BBF7D0' : iaConected === false ? '#FECACA' : '#E5E7EB'}`,
          borderRadius:20, padding:'4px 12px', fontSize:11.5, fontWeight:600,
          color: iaConected === true ? '#15803D' : iaConected === false ? '#991B1B' : '#6B7280',
        }}>
          <span style={{
            width:7, height:7, borderRadius:'50%', display:'inline-block', flexShrink:0,
            background: iaConected === true ? '#16A34A' : iaConected === false ? '#DC2626' : '#9CA3AF',
            boxShadow: iaConected === true ? '0 0 0 2px #BBF7D0' : 'none',
          }}/>
          {iaConected === true ? 'IA conectada' : iaConected === false ? 'IA sin conexión' : 'Verificando IA...'}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'12px', marginBottom:'20px' }}>
        {kpisCards.map(k => (
          <div key={k.label} style={{
            background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
            padding:'14px 16px', boxShadow:'0 1px 3px rgba(0,0,0,.08)', animation:'fadeUp .4s ease both'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <span style={{ fontSize:'11px', color:'#6B7280' }}>{k.label}</span>
              <i className={`ti ${k.icon}`} style={{ fontSize:'19px', color:k.iconColor }}/>
            </div>
            <div style={{ fontSize:'24px', fontWeight:600, marginTop:'8px', color:k.valColor }}>{k.value}</div>
            <div style={{ fontSize:'11px', marginTop:'3px', color:k.deltaColor }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Semáforo */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'20px' }}>
        {semaforoData.map(s => {
          const pct = kpis.total > 0 ? Math.round((s.count / kpis.total) * 100) : 0
          return (
            <div key={s.estado} style={{
              background:'#fff', border:'1px solid #E5E7EB',
              borderLeft:`4px solid ${s.color}`, borderRadius:'10px',
              padding:'16px 20px', display:'flex', alignItems:'center',
              justifyContent:'space-between', boxShadow:'0 1px 3px rgba(0,0,0,.08)'
            }}>
              <div style={{ minWidth:0 }}>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
                  <span style={{ fontSize:'11px', fontWeight:500, background:s.pillBg, color:s.pillColor, borderRadius:'20px', padding:'3px 10px' }}>{s.label}</span>
                  {s.tag && <span style={{ fontSize:'10px', fontWeight:600, background:s.tagBg, color:s.tagColor, borderRadius:'20px', padding:'3px 8px' }}>{s.tag}</span>}
                </div>
                <div style={{ fontSize:'32px', fontWeight:600, color:s.color, lineHeight:1 }}>{s.count}</div>
                <div style={{ fontSize:'13px', color:'#6B7280' }}>estudiantes</div>
                <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'5px' }}>{s.desc}</div>
              </div>
              <RingChart pct={pct} color={s.color}/>
            </div>
          )
        })}
      </div>

      {/* ── RECOMENDACIONES IA ─────────────────────────────────────────────── */}
      <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'18px 20px', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom: iaResult || iaError ? 14 : 0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:20 }}>🤖</span>
            <div>
              <div style={{ fontSize:'14px', fontWeight:600 }}>Recomendaciones IA para el grupo</div>
              <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:1 }}>
                Análisis del grupo completo — Llama 3 · llm.mystic-byte.com
              </div>
            </div>
          </div>
          <button
            onClick={solicitarRecomendaciones}
            disabled={iaStatus === 'loading' || estudiantes.length === 0}
            style={{
              display:'inline-flex', alignItems:'center', gap:7,
              background: iaStatus === 'loading' ? '#F3F4F6' : '#1A1A2E',
              color: iaStatus === 'loading' ? '#9CA3AF' : '#fff',
              border:'none', borderRadius:8, padding:'9px 16px',
              fontSize:'13px', fontWeight:600,
              cursor: iaStatus === 'loading' || estudiantes.length === 0 ? 'not-allowed' : 'pointer',
              transition:'background .15s',
            }}
          >
            {iaStatus === 'loading' ? (
              <>
                <span style={{ width:13, height:13, border:'2px solid #D1D5DB', borderTopColor:'#6B7280', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' }}/>
                Analizando...
              </>
            ) : (
              <><i className="ti ti-sparkles"/>Analizar con IA</>
            )}
          </button>
        </div>

        {/* Resultado de recomendaciones */}
        {iaStatus === 'ok' && iaResult && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {iaResult.resumen && (
              <div style={{ background:'#F0F4F8', borderRadius:8, padding:'11px 14px', fontSize:13, color:'#1A1A2E', lineHeight:1.65, borderLeft:'3px solid #1A1A2E' }}>
                {iaResult.resumen}
              </div>
            )}
            {iaResult.recomendaciones?.length > 0 && (
              <div>
                <div style={{ fontSize:11.5, fontWeight:600, color:'#6B7280', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:7 }}>Recomendaciones</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {iaResult.recomendaciones.map((r, i) => (
                    <div key={i} style={{ display:'flex', gap:8, background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:7, padding:'8px 12px', fontSize:12.5, color:'#1E40AF', lineHeight:1.5 }}>
                      <span style={{ fontWeight:700, flexShrink:0, color:'#2563EB' }}>{i + 1}.</span>
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {iaResult.estrategias?.length > 0 && (
              <div>
                <div style={{ fontSize:11.5, fontWeight:600, color:'#6B7280', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:7 }}>Estrategias sugeridas</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                  {iaResult.estrategias.map((s, i) => (
                    <span key={i} style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#15803D', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:500 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {iaStatus === 'error' && (
          <div style={{ display:'flex', gap:8, alignItems:'flex-start', background:'#FFF8F0', border:'1px solid #FED7AA', borderRadius:8, padding:'10px 13px', fontSize:12.5, color:'#9A3412' }}>
            <i className="ti ti-plug-x" style={{ flexShrink:0, marginTop:1 }}/>
            <span>{iaError || 'No se pudo contactar la IA. Verifica la conexión con llm.mystic-byte.com.'}</span>
          </div>
        )}

        {iaStatus === 'idle' && estudiantes.length > 0 && (
          <div style={{ fontSize:12.5, color:'#9CA3AF', textAlign:'center', padding:'8px 0' }}>
            Pulsa "Analizar con IA" para obtener recomendaciones personalizadas basadas en los datos del grupo.
          </div>
        )}

        {estudiantes.length === 0 && (
          <div style={{ fontSize:12.5, color:'#9CA3AF', textAlign:'center', padding:'8px 0' }}>
            Carga los estudiantes primero para habilitar el análisis IA.
          </div>
        )}
      </div>

      {/* Tabla */}
      <div style={{
        background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
        boxShadow:'0 1px 3px rgba(0,0,0,.08)', marginBottom:'20px', overflow:'hidden'
      }}>
        <div style={{
          padding:'16px 20px', borderBottom:'1px solid #E5E7EB',
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px'
        }}>
          <div>
            <div style={{ fontSize:'15px', fontWeight:600 }}>Estudiantes — alertas prioritarias</div>
            <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>
              Ordenados: Rojo → Ámbar → Verde · Curso: Base de Datos II · {kpis.total} estudiantes
            </div>
          </div>
        </div>
        {estudiantes.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#9CA3AF', fontSize:'13px' }}>
            <i className="ti ti-database-off" style={{ fontSize:'32px', display:'block', marginBottom:'8px' }}/>
            Sin datos — ejecuta el setup de Supabase primero
          </div>
        ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
            <colgroup>
              <col style={{ width:'40px' }}/>
              <col style={{ width:'200px' }}/>
              <col style={{ width:'60px' }}/>
              <col style={{ width:'110px' }}/>
              <col style={{ width:'70px' }}/>
              <col style={{ width:'70px' }}/>
              <col style={{ width:'70px' }}/>
              <col style={{ width:'80px' }}/>
              <col style={{ width:'60px' }}/>
              <col style={{ width:'120px' }}/>
              <col style={{ width:'80px' }}/>
            </colgroup>
            <thead>
              <tr style={{ background:'#F9FAFB', fontSize:'11px', color:'#6B7280', textTransform:'uppercase', letterSpacing:'.3px' }}>
                {['#','Estudiante','Sec.','Código','Parcial','Final','Práctica','Promedio','Faltas','Estado','Acción'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:500, borderBottom:'1px solid #E5E7EB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((e, i) => {
                const rs = riesgoStyle(e.riesgo)
                return (
                  <tr key={e.id} onClick={() => onVerEstudiante(e)}
                    style={{ background:rs.bg, cursor:'pointer', transition:'background .15s', fontSize:'13px' }}
                    onMouseEnter={ev => ev.currentTarget.style.background='#F0F4F8'}
                    onMouseLeave={ev => ev.currentTarget.style.background=rs.bg}
                  >
                    <td style={{ padding:'10px 12px', color:'#9CA3AF', borderBottom:'1px solid #F3F4F6' }}>
                      {(page-1)*PER_PAGE+i+1}
                    </td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <div style={{
                          width:'28px', height:'28px', borderRadius:'50%', background:'#E85D04',
                          color:'#fff', fontSize:'10px', fontWeight:600,
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                        }}>{e.iniciales}</div>
                        <span style={{ fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontSize:'12.5px' }}>
                          {e.nombre}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:500 }}>{e.seccion}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', color:'#6B7280', fontSize:'11.5px' }}>{e.codigo}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:600, color:notaColor(e.parcial) }}>{e.parcial ?? '—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:600, color:notaColor(e.final) }}>{e.final ?? '—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:600, color:notaColor(e.practica) }}>{e.practica ?? '—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:700, color:notaColor(e.promedio) }}>{e.promedio ?? '—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', color: e.faltas >= 5 ? '#DC2626' : e.faltas >= 3 ? '#D97706' : '#111827', fontWeight: e.faltas >= 5 ? 700 : 400 }}>
                      {e.faltas}/16
                    </td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6' }}>
                      <span style={{
                        fontSize:'10.5px', fontWeight:600, background:rs.pill, color:rs.pillTxt,
                        border:`1px solid ${rs.border}`, borderRadius:'20px', padding:'3px 9px', whiteSpace:'nowrap'
                      }}>
                        <span style={{ display:'inline-block', width:'6px', height:'6px', borderRadius:'50%', background:rs.dot, marginRight:'5px' }}/>
                        {rs.txt}
                      </span>
                    </td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6' }}>
                      <button onClick={ev => { ev.stopPropagation(); onVerEstudiante(e) }}
                        style={{
                          border:'1px solid #E85D04', color:'#E85D04', background:'#fff',
                          borderRadius:'6px', padding:'5px 11px', fontSize:'12px', fontWeight:600,
                          cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'4px'
                        }}
                        onMouseEnter={ev => ev.currentTarget.style.background='#FFF0E8'}
                        onMouseLeave={ev => ev.currentTarget.style.background='#fff'}
                      ><i className="ti ti-eye"/>Ver</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}
        {/* Paginación */}
        <div style={{
          padding:'12px 20px', display:'flex', alignItems:'center',
          justifyContent:'space-between', borderTop:'1px solid #E5E7EB', fontSize:'12.5px', color:'#6B7280'
        }}>
          <span>Mostrando {ordenados.length > 0 ? (page-1)*PER_PAGE+1 : 0}–{Math.min(page*PER_PAGE, ordenados.length)} de {ordenados.length}</span>
          <div style={{ display:'flex', gap:'4px' }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              style={{ border:'1px solid #E5E7EB', background:'#fff', borderRadius:'6px', padding:'5px 10px', cursor:page===1?'default':'pointer', color:page===1?'#D1D5DB':'#374151', fontSize:'12px' }}>
              <i className="ti ti-chevron-left"/>
            </button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                border:'1px solid #E5E7EB', background:page===p?'#E85D04':'#fff',
                color:page===p?'#fff':'#374151', borderRadius:'6px', padding:'5px 10px',
                cursor:'pointer', fontSize:'12px', fontWeight:page===p?600:400
              }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ border:'1px solid #E5E7EB', background:'#fff', borderRadius:'6px', padding:'5px 10px', cursor:page===totalPages?'default':'pointer', color:page===totalPages?'#D1D5DB':'#374151', fontSize:'12px' }}>
              <i className="ti ti-chevron-right"/>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
