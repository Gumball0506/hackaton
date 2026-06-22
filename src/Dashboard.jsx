import { useEffect, useRef, useState } from 'react'
import { kpis, semaforo, estudiantes, ranking, facultades } from './data'

const MEDALS = ['🥇','🥈','🥉']
const PER_PAGE = 7

function RingChart({ pct, color }) {
  const r = 26
  const circ = 2 * Math.PI * r
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
          style={{ transition:'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position:'absolute', inset:0, display:'flex', alignItems:'center',
        justifyContent:'center', fontSize:'12px', fontWeight:600, color
      }}>{pct}%</div>
    </div>
  )
}

function riesgoStyle(r) {
  if (r === 'ROJO')  return { bg:'#FEF2F2', pill:'#FEF2F2', pillTxt:'#991B1B', border:'#FECACA', dot:'#DC2626', txt:'Riesgo alto' }
  if (r === 'AMBAR') return { bg:'#FFFDF5', pill:'#FFFBEB', pillTxt:'#B45309', border:'#FDE68A', dot:'#D97706', txt:'Riesgo mod.' }
  return                  { bg:'#ffffff', pill:'#F0FDF4', pillTxt:'#15803D', border:'#BBF7D0', dot:'#16A34A', txt:'Sin riesgo' }
}

function notaColor(n) {
  if (n >= 14) return '#16A34A'
  if (n >= 11) return '#D97706'
  return '#DC2626'
}

export default function Dashboard({ onVerEstudiante }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(estudiantes.length / PER_PAGE)
  const paged = estudiantes.slice((page-1)*PER_PAGE, page*PER_PAGE)

  return (
    <div style={{ padding:'24px', animation:'fadeUp .35s ease both' }}>
      {/* Filtros */}
      <div style={{
        display:'flex', alignItems:'center', flexWrap:'wrap',
        gap:'10px', marginBottom:'20px'
      }}>
        <span style={{ fontSize:'13px', color:'#6B7280', fontWeight:500 }}>Filtrar por:</span>
        {['Ing. de Sistemas','Ingeniería de Sistemas','V Ciclo','2026-I'].map((opt, i) => (
          <select key={i} style={{
            border:'1px solid #E5E7EB', borderRadius:'8px', height:'36px',
            fontSize:'13px', padding:'0 10px', background:'#fff', cursor:'pointer'
          }}>
            <option>{opt}</option>
          </select>
        ))}
        <button style={{
          display:'inline-flex', alignItems:'center', gap:'6px',
          background:'#E85D04', color:'#fff', border:'none',
          borderRadius:'8px', height:'36px', padding:'0 15px',
          fontSize:'13px', fontWeight:600, cursor:'pointer'
        }}>
          <i className="ti ti-filter"/>Aplicar
        </button>
      </div>

      {/* KPI row */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(6,1fr)',
        gap:'12px', marginBottom:'20px'
      }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
            padding:'14px 16px',
            boxShadow:'0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04)',
            animation:'fadeUp .4s ease both'
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
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(3,1fr)',
        gap:'12px', marginBottom:'20px'
      }}>
        {semaforo.map(s => (
          <div key={s.estado} style={{
            background:'#fff', border:'1px solid #E5E7EB',
            borderLeft:`4px solid ${s.color}`, borderRadius:'10px',
            padding:'16px 20px', display:'flex', alignItems:'center',
            justifyContent:'space-between',
            boxShadow:'0 1px 3px rgba(0,0,0,.08)',
            animation:'fadeUp .45s ease both'
          }}>
            <div style={{ minWidth:0 }}>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
                <span style={{
                  fontSize:'11px', fontWeight:500, background:s.pillBg,
                  color:s.pillColor, borderRadius:'20px', padding:'3px 10px'
                }}>{s.label}</span>
                {s.tag && (
                  <span style={{
                    fontSize:'10px', fontWeight:600, background:s.tagBg,
                    color:s.tagColor, borderRadius:'20px', padding:'3px 8px'
                  }}>{s.tag}</span>
                )}
              </div>
              <div style={{ fontSize:'32px', fontWeight:600, color:s.color, lineHeight:1 }}>{s.count}</div>
              <div style={{ fontSize:'13px', color:'#6B7280' }}>estudiantes</div>
              <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'5px', maxWidth:'200px' }}>{s.desc}</div>
            </div>
            <RingChart pct={s.pct} color={s.color}/>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div style={{
        background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
        boxShadow:'0 1px 3px rgba(0,0,0,.08)', marginBottom:'20px',
        overflow:'hidden', animation:'fadeUp .5s ease both'
      }}>
        <div style={{
          padding:'16px 20px', borderBottom:'1px solid #E5E7EB',
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px'
        }}>
          <div>
            <div style={{ fontSize:'15px', fontWeight:600 }}>Estudiantes — alertas prioritarias</div>
            <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>
              Ordenados: Rojo → Ámbar → Verde
            </div>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
            <colgroup>
              <col style={{ width:'40px' }}/>
              <col style={{ width:'210px' }}/>
              <col style={{ width:'115px' }}/>
              <col style={{ width:'56px' }}/>
              <col style={{ width:'80px' }}/>
              <col style={{ width:'64px' }}/>
              <col style={{ width:'70px' }}/>
              <col style={{ width:'56px' }}/>
              <col style={{ width:'110px' }}/>
              <col style={{ width:'80px' }}/>
            </colgroup>
            <thead>
              <tr style={{ background:'#F9FAFB', fontSize:'11px', color:'#6B7280', textTransform:'uppercase', letterSpacing:'.3px' }}>
                {['#','Estudiante','Código','Ciclo','Últ. Nota','Base','Desv.','Susti','Estado','Acción'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:500, borderBottom:'1px solid #E5E7EB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((e, i) => {
                const rs = riesgoStyle(e.riesgo)
                return (
                  <tr
                    key={e.id}
                    onClick={() => onVerEstudiante(e)}
                    style={{
                      background: rs.bg, cursor:'pointer',
                      transition:'background .15s', fontSize:'13px'
                    }}
                    onMouseEnter={ev => ev.currentTarget.style.background = '#F0F4F8'}
                    onMouseLeave={ev => ev.currentTarget.style.background = rs.bg}
                  >
                    <td style={{ padding:'11px 12px', color:'#9CA3AF', borderBottom:'1px solid #F3F4F6' }}>
                      {(page-1)*PER_PAGE + i + 1}
                    </td>
                    <td style={{ padding:'11px 12px', borderBottom:'1px solid #F3F4F6' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                        <div style={{
                          width:'28px', height:'28px', borderRadius:'50%',
                          background:'#E85D04', color:'#fff', fontSize:'10px',
                          fontWeight:600, display:'flex', alignItems:'center',
                          justifyContent:'center', flexShrink:0
                        }}>{e.iniciales}</div>
                        <span style={{ fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {e.nombre}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding:'11px 12px', borderBottom:'1px solid #F3F4F6', color:'#6B7280', fontSize:'12px' }}>{e.codigo}</td>
                    <td style={{ padding:'11px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center' }}>{e.ciclo}</td>
                    <td style={{ padding:'11px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:600, color:notaColor(e.ultima_nota) }}>{e.ultima_nota}</td>
                    <td style={{ padding:'11px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', color:'#6B7280' }}>{e.base}</td>
                    <td style={{ padding:'11px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:500, color: e.desv < 0 ? '#DC2626' : '#16A34A' }}>
                      {e.desv > 0 ? '+' : ''}{e.desv}
                    </td>
                    <td style={{ padding:'11px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center' }}>
                      {e.susti
                        ? <i className="ti ti-check" style={{ color:'#16A34A', fontWeight:700 }}/>
                        : <i className="ti ti-x"     style={{ color:'#9CA3AF' }}/>
                      }
                    </td>
                    <td style={{ padding:'11px 12px', borderBottom:'1px solid #F3F4F6' }}>
                      <span style={{
                        fontSize:'11px', fontWeight:600,
                        background: rs.pill, color: rs.pillTxt,
                        border:`1px solid ${rs.border}`,
                        borderRadius:'20px', padding:'3px 10px', whiteSpace:'nowrap'
                      }}>
                        <span style={{
                          display:'inline-block', width:'6px', height:'6px',
                          borderRadius:'50%', background:rs.dot, marginRight:'5px'
                        }}/>
                        {rs.txt}
                      </span>
                    </td>
                    <td style={{ padding:'11px 12px', borderBottom:'1px solid #F3F4F6' }}>
                      <button
                        onClick={ev => { ev.stopPropagation(); onVerEstudiante(e) }}
                        style={{
                          border:'1px solid #E85D04', color:'#E85D04',
                          background:'#fff', borderRadius:'6px',
                          padding:'5px 12px', fontSize:'12px', fontWeight:600,
                          cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'4px',
                          transition:'background .15s'
                        }}
                        onMouseEnter={ev => { ev.currentTarget.style.background='#FFF0E8' }}
                        onMouseLeave={ev => { ev.currentTarget.style.background='#fff' }}
                      >
                        <i className="ti ti-eye"/>Ver
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        <div style={{
          padding:'12px 20px', display:'flex', alignItems:'center',
          justifyContent:'space-between', borderTop:'1px solid #E5E7EB',
          fontSize:'12.5px', color:'#6B7280'
        }}>
          <span>Mostrando {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, estudiantes.length)} de {estudiantes.length} estudiantes</span>
          <div style={{ display:'flex', gap:'4px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p-1))}
              disabled={page===1}
              style={{
                border:'1px solid #E5E7EB', background:'#fff', borderRadius:'6px',
                padding:'5px 10px', cursor:page===1?'default':'pointer',
                color:page===1?'#D1D5DB':'#374151', fontSize:'12px'
              }}
            ><i className="ti ti-chevron-left"/></button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                border:'1px solid #E5E7EB',
                background: page===p ? '#E85D04' : '#fff',
                color: page===p ? '#fff' : '#374151',
                borderRadius:'6px', padding:'5px 10px', cursor:'pointer', fontSize:'12px',
                fontWeight: page===p ? 600 : 400
              }}>{p}</button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p+1))}
              disabled={page===totalPages}
              style={{
                border:'1px solid #E5E7EB', background:'#fff', borderRadius:'6px',
                padding:'5px 10px', cursor:page===totalPages?'default':'pointer',
                color:page===totalPages?'#D1D5DB':'#374151', fontSize:'12px'
              }}
            ><i className="ti ti-chevron-right"/></button>
          </div>
        </div>
      </div>

      {/* Widgets inferiores */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {/* Ranking */}
        <div style={{
          background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
          boxShadow:'0 1px 3px rgba(0,0,0,.08)', overflow:'hidden',
          animation:'fadeUp .55s ease both'
        }}>
          <div style={{
            padding:'14px 18px', borderBottom:'1px solid #E5E7EB',
            display:'flex', alignItems:'center', gap:'8px'
          }}>
            <i className="ti ti-trophy" style={{ color:'#D97706', fontSize:'18px' }}/>
            <span style={{ fontSize:'14px', fontWeight:600 }}>Ranking de mérito</span>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ fontSize:'11px', color:'#6B7280', background:'#F9FAFB' }}>
                {['Pos.','Nombre','Promedio','Distinción'].map(h => (
                  <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontWeight:500, borderBottom:'1px solid #E5E7EB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.pos} style={{ fontSize:'13px', borderBottom:'1px solid #F3F4F6' }}>
                  <td style={{ padding:'10px 14px' }}>{MEDALS[i] || r.pos}</td>
                  <td style={{ padding:'10px 14px', fontWeight:500 }}>{r.nombre}</td>
                  <td style={{ padding:'10px 14px', fontWeight:600, color:'#16A34A' }}>{r.promedio}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <span style={{
                      fontSize:'10px', fontWeight:600, borderRadius:'20px', padding:'3px 8px',
                      background: r.distincion === 'Décimo XV' ? '#FEF3C7' : '#F0FDF4',
                      color:       r.distincion === 'Décimo XV' ? '#92400E'  : '#15803D'
                    }}>{r.distincion}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Facultades */}
        <div style={{
          background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
          boxShadow:'0 1px 3px rgba(0,0,0,.08)', overflow:'hidden',
          animation:'fadeUp .6s ease both'
        }}>
          <div style={{
            padding:'14px 18px', borderBottom:'1px solid #E5E7EB',
            display:'flex', alignItems:'center', gap:'8px'
          }}>
            <i className="ti ti-building" style={{ color:'#6B7280', fontSize:'18px' }}/>
            <span style={{ fontSize:'14px', fontWeight:600 }}>Resumen por facultad</span>
          </div>
          <div style={{ padding:'4px 0' }}>
            {facultades.map(f => (
              <div key={f.nombre} style={{
                display:'grid', gridTemplateColumns:'160px 60px 60px 1fr',
                alignItems:'center', gap:'12px', padding:'10px 18px',
                borderBottom:'1px solid #F3F4F6', fontSize:'13px'
              }}>
                <span style={{ fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.nombre}</span>
                <span style={{ color:'#6B7280', textAlign:'center' }}>{f.alumnos}</span>
                <span style={{ fontWeight:600, color:notaColor(f.promedio), textAlign:'center' }}>{f.promedio}</span>
                <div style={{ background:'#F4F6F9', borderRadius:'4px', height:'6px', overflow:'hidden' }}>
                  <div style={{
                    width:`${(f.promedio/20)*100}%`, height:'100%',
                    background:'#E85D04', borderRadius:'4px',
                    transition:'width 1s ease'
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}
