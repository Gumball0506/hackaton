import { useEffect, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js'
import { perfilDetalle } from './data'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

function notaColor(n) {
  if (n === null) return '#9CA3AF'
  if (n >= 14) return '#16A34A'
  if (n >= 11) return '#D97706'
  return '#DC2626'
}

function RingSmall({ pct, color, size=80 }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)
  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (pct / 100) * circ), 150)
    return () => clearTimeout(t)
  }, [pct, circ])
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F1F4" strokeWidth="7"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition:'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position:'absolute', inset:0, display:'flex', alignItems:'center',
        justifyContent:'center', fontSize:'13px', fontWeight:700, color
      }}>{pct}%</div>
    </div>
  )
}

export default function Perfil({ estudiante }) {
  const d = perfilDetalle
  const [nuevaNota, setNuevaNota] = useState('')
  const [obs, setObs]             = useState(d.observaciones)

  function guardarNota() {
    if (!nuevaNota.trim()) return
    setObs([{ fecha:'Ahora', autor:'Mg. Jorge Mendoza', texto:nuevaNota }, ...obs])
    setNuevaNota('')
  }

  const riskColor = estudiante.riesgo === 'ROJO' ? '#DC2626' : estudiante.riesgo === 'AMBAR' ? '#D97706' : '#16A34A'
  const riskBg    = estudiante.riesgo === 'ROJO' ? '#FEF2F2' : estudiante.riesgo === 'AMBAR' ? '#FFFBEB' : '#F0FDF4'
  const riskTxt   = estudiante.riesgo === 'ROJO' ? '#991B1B' : estudiante.riesgo === 'AMBAR' ? '#B45309' : '#15803D'

  const chartData = {
    labels: d.notas.filter(n => n.nota !== null).map(n => n.evaluacion.replace('Práctica Calificada','PC').replace('Examen ','Exam. ')),
    datasets: [
      {
        label: 'Nota del alumno',
        data: d.notas.filter(n => n.nota !== null).map(n => n.nota),
        borderColor: '#DC2626', backgroundColor: 'rgba(220,38,38,0.08)',
        tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: '#DC2626',
      },
      {
        label: 'Línea base',
        data: d.notas.filter(n => n.nota !== null).map(() => d.base),
        borderColor: '#9CA3AF', borderDash: [6, 3],
        backgroundColor: 'transparent', tension: 0, pointRadius: 0,
      }
    ]
  }

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend:{ display:false }, tooltip:{ mode:'index', intersect:false } },
    scales: {
      y: { min:0, max:20, grid:{ color:'#F3F4F6' }, ticks:{ font:{ size:11 } } },
      x: { grid:{ display:false }, ticks:{ font:{ size:10 } } }
    }
  }

  return (
    <div style={{ padding:'24px', animation:'fadeUp .35s ease both' }}>
      {/* Hero */}
      <div style={{
        background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px',
        padding:'22px 24px', marginBottom:'16px',
        boxShadow:'0 1px 3px rgba(0,0,0,.08)'
      }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'20px', flexWrap:'wrap' }}>
          <div style={{
            width:'72px', height:'72px', borderRadius:'50%', background:'#E85D04',
            color:'#fff', fontSize:'22px', fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
          }}>{estudiante.iniciales}</div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'20px', fontWeight:700 }}>{estudiante.nombre}</div>
            <div style={{ fontSize:'13px', color:'#9CA3AF', marginTop:'4px', display:'flex', alignItems:'center', gap:'6px' }}>
              <i className="ti ti-id"/>
              {estudiante.codigo}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'10px' }}>
              {[d.ciclo, d.escuela, d.facultad].map(p => (
                <span key={p} style={{
                  fontSize:'11px', fontWeight:500, background:'#F4F6F9',
                  color:'#6B7280', borderRadius:'6px', padding:'4px 10px'
                }}>{p}</span>
              ))}
              <span style={{
                fontSize:'11px', fontWeight:700, background:riskBg,
                color:riskTxt, border:`1px solid ${riskBg}`, borderRadius:'6px', padding:'4px 10px'
              }}>RIESGO {estudiante.riesgo}</span>
            </div>
            <div style={{ fontSize:'12px', color:'#6B7280', marginTop:'10px' }}>
              Período {d.periodo} · Perfil: {d.personalidad} · Asistencia: {d.asistencia}%
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <button style={{
              border:'1px solid #E85D04', color:'#E85D04', background:'#fff',
              borderRadius:'8px', padding:'8px 16px', fontSize:'12.5px', fontWeight:600,
              cursor:'pointer', display:'flex', alignItems:'center', gap:'6px'
            }}>
              <i className="ti ti-message"/>Enviar mensaje
            </button>
            <button style={{
              border:'1px solid #185FA5', color:'#185FA5', background:'#fff',
              borderRadius:'8px', padding:'8px 16px', fontSize:'12.5px', fontWeight:600,
              cursor:'pointer', display:'flex', alignItems:'center', gap:'6px'
            }}>
              <i className="ti ti-calendar-plus"/>Agendar psicólogo
            </button>
            <button style={{
              border:'1px solid #E5E7EB', color:'#6B7280', background:'#fff',
              borderRadius:'8px', padding:'8px 16px', fontSize:'12.5px', fontWeight:600,
              cursor:'pointer', display:'flex', alignItems:'center', gap:'6px'
            }}>
              <i className="ti ti-upload"/>Subir entrevista
            </button>
          </div>
        </div>
      </div>

      {/* Minimétricas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
        {[
          { label:'Nota actual',    value:estudiante.ultima_nota, sub:'/20', color:notaColor(estudiante.ultima_nota) },
          { label:'Promedio base',  value:d.base,               sub:'/20', color:'#6B7280' },
          { label:'Desviación',     value: (estudiante.desv > 0?'+':'')+estudiante.desv, sub:'puntos', color: estudiante.desv < 0 ? '#DC2626' : '#16A34A' },
          { label:'Asistencia',     value:d.asistencia+'%',     sub:'del período', color:'#D97706' },
        ].map(m => (
          <div key={m.label} style={{
            background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
            padding:'14px 16px', boxShadow:'0 1px 3px rgba(0,0,0,.06)',
            textAlign:'center'
          }}>
            <div style={{ fontSize:'11px', color:'#6B7280', marginBottom:'6px' }}>{m.label}</div>
            <div style={{ fontSize:'26px', fontWeight:700, color:m.color, lineHeight:1 }}>
              {m.value}<span style={{ fontSize:'13px', fontWeight:400, color:'#9CA3AF' }}>{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid 2 columnas */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {/* IZQUIERDA */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Historial notas */}
          <div style={{
            background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
            boxShadow:'0 1px 3px rgba(0,0,0,.06)', overflow:'hidden'
          }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #E5E7EB' }}>
              <span style={{ fontSize:'14px', fontWeight:600 }}>Historial de notas</span>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12.5px' }}>
              <thead>
                <tr style={{ background:'#F9FAFB', color:'#6B7280', fontSize:'11px' }}>
                  {['Evaluación','Tipo','Fecha','Nota','Peso'].map(h => (
                    <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontWeight:500, borderBottom:'1px solid #E5E7EB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.notas.map(n => (
                  <tr key={n.evaluacion} style={{
                    background: n.tipo==='SUSTI' ? '#FFFBEB' : n.tipo==='EF' ? '#FFF8F8' : '#fff',
                    borderBottom:'1px solid #F3F4F6'
                  }}>
                    <td style={{ padding:'9px 14px', fontWeight: n.tipo==='EF'?600:400 }}>{n.evaluacion}</td>
                    <td style={{ padding:'9px 14px', color:'#6B7280' }}>{n.tipo}</td>
                    <td style={{ padding:'9px 14px', color:'#6B7280' }}>{n.fecha}</td>
                    <td style={{ padding:'9px 14px', fontWeight:600, color:notaColor(n.nota) }}>
                      {n.nota !== null ? n.nota : (
                        <span style={{
                          fontSize:'10px', fontWeight:600, background:'#FFFBEB',
                          color:'#B45309', borderRadius:'20px', padding:'2px 8px'
                        }}>PENDIENTE</span>
                      )}
                    </td>
                    <td style={{ padding:'9px 14px', color:'#9CA3AF' }}>{n.peso > 0 ? n.peso+'%' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tendencia */}
          <div style={{
            background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
            padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,.06)'
          }}>
            <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'12px' }}>Tendencia personal</div>
            <div style={{ height:'170px' }}>
              <Line data={chartData} options={chartOptions}/>
            </div>
            <div style={{ display:'flex', gap:'16px', marginTop:'10px', fontSize:'11px' }}>
              <span style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                <span style={{ width:'12px', height:'3px', background:'#DC2626', display:'inline-block', borderRadius:'2px' }}/>
                Nota del alumno
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                <span style={{ width:'12px', height:'2px', background:'#9CA3AF', display:'inline-block', borderRadius:'2px' }}/>
                Línea base ({d.base})
              </span>
            </div>
          </div>
        </div>

        {/* DERECHA */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Clasificación */}
          <div style={{
            background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
            padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,.06)'
          }}>
            <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'12px' }}>Clasificación académica</div>
            <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
              <div>
                <div style={{ fontSize:'40px', fontWeight:700, color:'#DC2626', lineHeight:1 }}>#{d.rankGlobal}</div>
                <div style={{ fontSize:'12px', color:'#6B7280' }}>de {d.totalEstudiantes} estudiantes</div>
                <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'2px' }}>87% inferior al grupo</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ height:'6px', background:'#F4F6F9', borderRadius:'4px', overflow:'hidden', marginBottom:'8px' }}>
                  <div style={{ width:'87%', height:'100%', background:'#DC2626', borderRadius:'4px' }}/>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                  {['Décimo XV','Tercio Sup.'].map(d2 => (
                    <span key={d2} style={{
                      fontSize:'10px', fontWeight:600, background:'#F4F6F9',
                      color:'#9CA3AF', borderRadius:'20px', padding:'3px 8px',
                      textDecoration:'line-through'
                    }}>{d2}</span>
                  ))}
                  <span style={{
                    fontSize:'10px', fontWeight:600, background:'#FEF2F2',
                    color:'#DC2626', borderRadius:'20px', padding:'3px 8px'
                  }}>NO — Jalada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Asistencia */}
          <div style={{
            background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
            padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,.06)'
          }}>
            <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'12px' }}>Asistencia detallada</div>
            <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'12px' }}>
              <RingSmall pct={d.asistencia} color="#D97706" size={88}/>
              <table style={{ flex:1, fontSize:'12px', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ color:'#9CA3AF', fontSize:'11px' }}>
                    {['Mes','Total','Asistidas'].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'4px 8px', fontWeight:400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {d.asistenciaMensual.map(m => (
                    <tr key={m.mes} style={{ borderTop:'1px solid #F3F4F6' }}>
                      <td style={{ padding:'5px 8px', fontWeight:500 }}>{m.mes}</td>
                      <td style={{ padding:'5px 8px', textAlign:'center', color:'#6B7280' }}>{m.total}</td>
                      <td style={{ padding:'5px 8px', textAlign:'center', fontWeight:600,
                        color: m.asistidas/m.total >= 0.8 ? '#16A34A' : '#DC2626' }}>{m.asistidas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{
              background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:'8px',
              padding:'10px 13px', fontSize:'12px', color:'#92400E',
              display:'flex', alignItems:'center', gap:'8px'
            }}>
              <i className="ti ti-alert-triangle" style={{ color:'#D97706', flexShrink:0 }}/>
              Asistencia por debajo del 75% mínimo reglamentario.
            </div>
          </div>

          {/* Observaciones */}
          <div style={{
            background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
            padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,.06)'
          }}>
            <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'12px' }}>Observaciones del tutor</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'12px' }}>
              {obs.map((o, i) => (
                <div key={i} style={{
                  background:'#F9FAFB', borderRadius:'8px', padding:'11px 13px',
                  fontSize:'12.5px', borderLeft:'3px solid #E85D04'
                }}>
                  <div style={{ fontSize:'11px', color:'#9CA3AF', marginBottom:'4px' }}>
                    {o.fecha} · {o.autor}
                  </div>
                  {o.texto}
                </div>
              ))}
            </div>
            <textarea
              value={nuevaNota}
              onChange={e => setNuevaNota(e.target.value)}
              placeholder="Agregar nueva observación..."
              rows={3}
              style={{
                width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px',
                padding:'10px 12px', fontSize:'13px', resize:'vertical',
                marginBottom:'8px', background:'#fff'
              }}
            />
            <button
              onClick={guardarNota}
              style={{
                background:'#E85D04', color:'#fff', border:'none',
                borderRadius:'8px', padding:'8px 16px', fontSize:'13px',
                fontWeight:600, cursor:'pointer', display:'flex',
                alignItems:'center', gap:'6px'
              }}
            >
              <i className="ti ti-check"/>Guardar nota
            </button>
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
