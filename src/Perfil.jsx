import { useState, useEffect, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import {
  getEstudianteDetalle, updateNota, updateAsistencia,
  addObservacion, sendMensaje, subscribeMensajes,
  uploadEntrevista, agendarCita, updateCita
} from './lib/queries'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

function notaColor(n) {
  if (n === null || n === undefined) return '#9CA3AF'
  if (n >= 14) return '#16A34A'
  if (n >= 11) return '#D97706'
  return '#DC2626'
}

function riesgoColor(r) {
  if (r === 'ROJO' || r === 'ROJO_FALTAS') return { color:'#DC2626', bg:'#FEF2F2', txt: r==='ROJO_FALTAS'?'FALTAS EXCESIVAS':'RIESGO ALTO' }
  if (r === 'AMBAR') return { color:'#D97706', bg:'#FFFBEB', txt:'RIESGO MODERADO' }
  if (r === 'VERDE') return { color:'#16A34A', bg:'#F0FDF4', txt:'SIN RIESGO' }
  return { color:'#9CA3AF', bg:'#F4F6F9', txt:'SIN NOTAS' }
}

function RingSmall({ pct, color, size=80 }) {
  const r = (size/2)-8, circ = 2*Math.PI*r
  const [offset, setOffset] = useState(circ)
  useEffect(() => { const t=setTimeout(()=>setOffset(circ-(pct/100)*circ),150); return ()=>clearTimeout(t) }, [pct, circ])
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F1F4" strokeWidth="7"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition:'stroke-dashoffset 1s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, color }}>{pct}%</div>
    </div>
  )
}

function NotaInput({ label, pct, valor, onChange, saving }) {
  const [draft, setDraft] = useState(valor ?? '')
  useEffect(() => setDraft(valor ?? ''), [valor])

  function handleBlur() {
    const n = parseFloat(draft)
    if (isNaN(n) || n < 0 || n > 20) { setDraft(valor ?? ''); return }
    onChange(n)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
      <label style={{ fontSize:'11px', color:'#6B7280', fontWeight:500 }}>{label} ({pct}%)</label>
      <div style={{ position:'relative' }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleBlur}
          type="number" min="0" max="20" step="0.5"
          placeholder="—"
          style={{
            width:'90px', height:'36px', border:`1px solid ${valor!==null&&valor!==undefined?notaColor(valor):'#E5E7EB'}`,
            borderRadius:'8px', padding:'0 10px', fontSize:'14px', fontWeight:600,
            color:notaColor(valor), background:'#fff', textAlign:'center'
          }}
        />
        {saving && <i className="ti ti-loader-2" style={{ position:'absolute', right:'6px', top:'10px', color:'#9CA3AF', fontSize:'14px', animation:'spin .7s linear infinite' }}/>}
      </div>
    </div>
  )
}

export default function Perfil({ estudiante: est, onRefresh }) {
  const [detalle,    setDetalle]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [savingNota, setSavingNota] = useState({})
  const [nuevaNota,  setNuevaNota]  = useState('')
  const [msgText,    setMsgText]    = useState('')
  const [tab,        setTab]        = useState('notas')
  const [citaForm,   setCitaForm]   = useState({ fecha:'', lugar:'', motivo:'' })
  const [showCita,   setShowCita]   = useState(false)
  const msgEndRef = useRef(null)

  useEffect(() => { cargar() }, [est.id])

  async function cargar() {
    setLoading(true)
    try {
      const d = await getEstudianteDetalle(est.id)
      setDetalle(d)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  // Real-time mensajes
  useEffect(() => {
    if (!est.id) return
    const sub = subscribeMensajes(est.id, msg => {
      setDetalle(d => d ? { ...d, mensajes:[msg, ...d.mensajes] } : d)
    })
    return () => sub.unsubscribe()
  }, [est.id])

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [detalle?.mensajes])

  async function handleNotaChange(campo, valor) {
    setSavingNota(s => ({ ...s, [campo]:true }))
    try {
      await updateNota(detalle.matricula_id, campo, valor)
      await cargar()
      onRefresh?.()
    } catch(e) { console.error(e) }
    finally { setSavingNota(s => ({ ...s, [campo]:false })) }
  }

  async function handleObs() {
    if (!nuevaNota.trim()) return
    await addObservacion(est.id, nuevaNota)
    setNuevaNota('')
    await cargar()
  }

  async function handleMsg() {
    if (!msgText.trim()) return
    await sendMensaje(est.id, msgText)
    setMsgText('')
    await cargar()
  }

  async function handleEntrevista(e) {
    const file = e.target.files[0]
    if (!file) return
    const nombre = file.name.replace(/\.[^.]+$/, '')
    await uploadEntrevista(est.id, nombre, { archivo:file.name, fecha: new Date().toISOString() }, file)
    await cargar()
    e.target.value = ''
  }

  async function handleCita() {
    if (!citaForm.fecha || !citaForm.lugar || !citaForm.motivo) return
    await agendarCita(est.id, citaForm)
    setCitaForm({ fecha:'', lugar:'', motivo:'' })
    setShowCita(false)
    await cargar()
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'300px', flexDirection:'column', gap:'12px' }}>
      <div style={{ width:'32px', height:'32px', border:'3px solid #E5E7EB', borderTopColor:'#E85D04', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
      <span style={{ fontSize:'13px', color:'#6B7280' }}>Cargando perfil...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const d   = detalle
  const rc  = riesgoColor(est.riesgo)
  const notas = d?.notas ?? {}

  const chartLabels = ['Parcial','Final','Práctica']
  const chartVals   = [notas.parcial, notas.final, notas.practica].filter(v => v !== null && v !== undefined)
  const chartData = {
    labels: chartLabels.slice(0, chartVals.length),
    datasets: [{
      label:'Nota', data:chartVals,
      borderColor:'#E85D04', backgroundColor:'rgba(232,93,4,0.08)',
      tension:.4, fill:true, pointRadius:6, pointBackgroundColor:'#E85D04'
    }]
  }
  const chartOptions = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false} },
    scales:{
      y:{ min:0, max:20, grid:{ color:'#F3F4F6' }, ticks:{ font:{size:11} } },
      x:{ grid:{display:false}, ticks:{ font:{size:11} } }
    }
  }

  const TABS = [
    { key:'notas',       icon:'ti-notes',          label:'Notas' },
    { key:'asistencias', icon:'ti-calendar-stats',  label:'Asistencias' },
    { key:'mensajes',    icon:'ti-message',         label:'Mensajes', badge: d?.mensajes?.length },
    { key:'entrevistas', icon:'ti-file-text',       label:'Entrevistas', badge: d?.entrevistas?.length },
    { key:'citas',       icon:'ti-heart-handshake', label:'Citas Psicólogo', badge: d?.citas?.length },
    { key:'observaciones',icon:'ti-pencil',         label:'Observaciones' },
  ]

  return (
    <div style={{ padding:'24px', animation:'fadeUp .35s ease both' }}>
      {/* Hero */}
      <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'22px 24px', marginBottom:'16px', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'20px', flexWrap:'wrap' }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'#E85D04', color:'#fff', fontSize:'22px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {est.iniciales}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'20px', fontWeight:700 }}>{est.nombre}</div>
            <div style={{ fontSize:'13px', color:'#9CA3AF', marginTop:'4px', display:'flex', alignItems:'center', gap:'6px' }}>
              <i className="ti ti-id"/>{est.codigo}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'10px' }}>
              {['V Ciclo','Informática','FISI - UNFV', `Sección ${est.seccion}${est.grupo?` Grupo ${est.grupo}`:''}`].map(p => (
                <span key={p} style={{ fontSize:'11px', fontWeight:500, background:'#F4F6F9', color:'#6B7280', borderRadius:'6px', padding:'4px 10px' }}>{p}</span>
              ))}
              <span style={{ fontSize:'11px', fontWeight:700, background:rc.bg, color:rc.color, borderRadius:'6px', padding:'4px 10px' }}>
                {rc.txt}
              </span>
            </div>
            <div style={{ fontSize:'12px', color:'#6B7280', marginTop:'8px' }}>
              Curso: Base de Datos II · Período 2026-I · Faltas: {est.faltas ?? 0}/16 sesiones
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <button onClick={() => setTab('mensajes')} style={{ border:'1px solid #E85D04', color:'#E85D04', background:'#fff', borderRadius:'8px', padding:'8px 16px', fontSize:'12.5px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
              <i className="ti ti-message"/>Enviar mensaje
            </button>
            <button onClick={() => { setTab('citas'); setShowCita(true) }} style={{ border:'1px solid #185FA5', color:'#185FA5', background:'#fff', borderRadius:'8px', padding:'8px 16px', fontSize:'12.5px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
              <i className="ti ti-calendar-plus"/>Agendar psicólogo
            </button>
            <label style={{ border:'1px solid #E5E7EB', color:'#6B7280', background:'#fff', borderRadius:'8px', padding:'8px 16px', fontSize:'12.5px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
              <i className="ti ti-upload"/>Subir entrevista
              <input type="file" accept=".pdf,.json,.mp3,.wav,.mp4" onChange={handleEntrevista} style={{ display:'none' }}/>
            </label>
          </div>
        </div>
      </div>

      {/* Minimétricas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
        {[
          { label:'Parcial (30%)',   value:notas.parcial,  sub:'/20' },
          { label:'Final (30%)',     value:notas.final,    sub:'/20' },
          { label:'Práctica (40%)', value:notas.practica, sub:'/20' },
          { label:'Promedio final', value:notas.promedio, sub:'/20', bold:true },
        ].map(m => (
          <div key={m.label} style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'14px 16px', boxShadow:'0 1px 3px rgba(0,0,0,.06)', textAlign:'center' }}>
            <div style={{ fontSize:'11px', color:'#6B7280', marginBottom:'6px' }}>{m.label}</div>
            <div style={{ fontSize:'26px', fontWeight: m.bold ? 800 : 600, color:notaColor(m.value), lineHeight:1 }}>
              {m.value !== null && m.value !== undefined ? m.value : '—'}
              <span style={{ fontSize:'13px', fontWeight:400, color:'#9CA3AF' }}>{m.value !== null && m.value !== undefined ? m.sub : ''}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'16px', flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display:'flex', alignItems:'center', gap:'6px',
            border:'1px solid #E5E7EB', borderRadius:'8px', padding:'8px 14px',
            fontSize:'13px', fontWeight: tab===t.key ? 600 : 400, cursor:'pointer',
            background: tab===t.key ? '#E85D04' : '#fff',
            color: tab===t.key ? '#fff' : '#374151',
            transition:'background .15s'
          }}>
            <i className={`ti ${t.icon}`}/>
            {t.label}
            {t.badge > 0 && (
              <span style={{ background: tab===t.key?'rgba(255,255,255,.3)':'#E85D04', color: tab===t.key?'#fff':'#fff', borderRadius:'20px', fontSize:'10px', fontWeight:700, padding:'1px 6px' }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Notas */}
      {tab === 'notas' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'16px' }}>Registrar / Editar notas</div>
            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'16px' }}>
              <NotaInput label="Parcial"  pct={30} valor={notas.parcial}  saving={savingNota.parcial}  onChange={v=>handleNotaChange('parcial',v)}/>
              <NotaInput label="Final"    pct={30} valor={notas.final}    saving={savingNota.final}    onChange={v=>handleNotaChange('final',v)}/>
              <NotaInput label="Práctica" pct={40} valor={notas.practica} saving={savingNota.practica} onChange={v=>handleNotaChange('practica',v)}/>
            </div>
            <div style={{ background:'#F9FAFB', borderRadius:'8px', padding:'12px', fontSize:'12.5px', color:'#6B7280' }}>
              <strong>Fórmula:</strong> (Parcial × 0.30) + (Final × 0.30) + (Práctica × 0.40)
              {notas.promedio !== null && notas.promedio !== undefined && (
                <div style={{ marginTop:'6px', color:notaColor(notas.promedio), fontWeight:600, fontSize:'14px' }}>
                  Promedio actual: {notas.promedio}/20 {notas.promedio < 11 ? '❌ Desaprobado' : '✅ Aprobado'}
                </div>
              )}
            </div>
          </div>
          {chartVals.length > 0 ? (
            <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
              <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'12px' }}>Tendencia de notas</div>
              <div style={{ height:'180px' }}>
                <Line data={chartData} options={chartOptions}/>
              </div>
            </div>
          ) : (
            <div style={{ background:'#F9FAFB', border:'1px dashed #E5E7EB', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:'13px', flexDirection:'column', gap:'8px' }}>
              <i className="ti ti-chart-line" style={{ fontSize:'28px' }}/>
              Sin notas registradas aún
            </div>
          )}
        </div>
      )}

      {/* Tab: Asistencias */}
      {tab === 'asistencias' && (
        <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
            <div style={{ fontSize:'14px', fontWeight:600 }}>Control de asistencias — 16 sesiones</div>
            <div style={{ display:'flex', gap:'8px', fontSize:'12px' }}>
              {[{txt:'Presente',c:'#16A34A'},{txt:'Falta',c:'#DC2626'},{txt:'Sin registrar',c:'#9CA3AF'}].map(x=>(
                <span key={x.txt} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                  <span style={{ width:'10px', height:'10px', borderRadius:'50%', background:x.c, display:'inline-block' }}/>
                  {x.txt}
                </span>
              ))}
            </div>
          </div>
          {d?.pct_asistencia !== null && d?.pct_asistencia > 0 && (
            <div style={{ marginBottom:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
              <RingSmall pct={d.pct_asistencia} color={d.pct_asistencia >= 70 ? '#16A34A' : d.pct_asistencia >= 50 ? '#D97706' : '#DC2626'} size={72}/>
              <div>
                <div style={{ fontSize:'14px', fontWeight:600 }}>
                  {d.presentes} asistencias · {d.faltas} faltas
                </div>
                {d.faltas >= 5 && (
                  <div style={{ fontSize:'12px', color:'#DC2626', fontWeight:600, marginTop:'4px' }}>
                    <i className="ti ti-alert-triangle"/> Superó el límite del 30% de faltas
                  </div>
                )}
              </div>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:'8px' }}>
            {d?.asistencias?.map(a => (
              <div key={a.sesion} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'10px', color:'#9CA3AF', marginBottom:'4px' }}>S{a.sesion}</div>
                <div style={{ display:'flex', gap:'4px', justifyContent:'center' }}>
                  <button
                    onClick={() => updateAsistencia(d.matricula_id, a.sesion, true).then(cargar)}
                    title="Presente"
                    style={{
                      width:'28px', height:'28px', borderRadius:'6px', border:'none', cursor:'pointer',
                      background: a.presente === true ? '#16A34A' : '#F4F6F9',
                      color: a.presente === true ? '#fff' : '#9CA3AF', fontSize:'12px',
                      transition:'background .15s'
                    }}
                  ><i className="ti ti-check"/></button>
                  <button
                    onClick={() => updateAsistencia(d.matricula_id, a.sesion, false).then(cargar)}
                    title="Falta"
                    style={{
                      width:'28px', height:'28px', borderRadius:'6px', border:'none', cursor:'pointer',
                      background: a.presente === false ? '#DC2626' : '#F4F6F9',
                      color: a.presente === false ? '#fff' : '#9CA3AF', fontSize:'12px',
                      transition:'background .15s'
                    }}
                  ><i className="ti ti-x"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Mensajes */}
      {tab === 'mensajes' && (
        <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', boxShadow:'0 1px 3px rgba(0,0,0,.06)', display:'flex', flexDirection:'column', height:'480px' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid #E5E7EB', fontSize:'14px', fontWeight:600 }}>
            Chat con {est.nombre.split(' ').slice(-2).join(' ')}
            <span style={{ fontSize:'11px', color:'#9CA3AF', marginLeft:'8px' }}>· compartido con app móvil</span>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {d?.mensajes?.length === 0 && (
              <div style={{ textAlign:'center', color:'#9CA3AF', fontSize:'13px', marginTop:'40px' }}>Sin mensajes aún</div>
            )}
            {[...(d?.mensajes??[])].reverse().map(m => (
              <div key={m.id} style={{ display:'flex', justifyContent: m.remitente==='tutor'?'flex-end':'flex-start' }}>
                <div style={{
                  maxWidth:'70%', padding:'10px 14px', borderRadius:m.remitente==='tutor'?'12px 12px 2px 12px':'12px 12px 12px 2px',
                  background: m.remitente==='tutor'?'#E85D04':'#F4F6F9',
                  color: m.remitente==='tutor'?'#fff':'#111827', fontSize:'13px'
                }}>
                  {m.contenido}
                  <div style={{ fontSize:'10px', marginTop:'4px', opacity:.7 }}>
                    {new Date(m.created_at).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            <div ref={msgEndRef}/>
          </div>
          <div style={{ padding:'12px 16px', borderTop:'1px solid #E5E7EB', display:'flex', gap:'8px' }}>
            <input
              value={msgText} onChange={e => setMsgText(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleMsg()}
              placeholder="Escribe un mensaje al estudiante..."
              style={{ flex:1, border:'1px solid #E5E7EB', borderRadius:'8px', padding:'10px 13px', fontSize:'13px' }}
            />
            <button onClick={handleMsg} style={{ background:'#E85D04', color:'#fff', border:'none', borderRadius:'8px', padding:'10px 18px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
              <i className="ti ti-send"/>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Entrevistas */}
      {tab === 'entrevistas' && (
        <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <div style={{ fontSize:'14px', fontWeight:600 }}>Entrevistas subidas</div>
            <label style={{ border:'1px solid #E85D04', color:'#E85D04', background:'#fff', borderRadius:'8px', padding:'8px 14px', fontSize:'13px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
              <i className="ti ti-plus"/>Subir entrevista
              <input type="file" accept=".pdf,.json,.mp3,.wav,.mp4" onChange={handleEntrevista} style={{ display:'none' }}/>
            </label>
          </div>
          {d?.entrevistas?.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px', color:'#9CA3AF', fontSize:'13px', background:'#F9FAFB', borderRadius:'8px', border:'1px dashed #E5E7EB' }}>
              <i className="ti ti-file-off" style={{ fontSize:'28px', display:'block', marginBottom:'8px' }}/>
              Sin entrevistas subidas aún
            </div>
          ) : d?.entrevistas?.map(e => (
            <div key={e.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', borderRadius:'8px', background:'#F9FAFB', marginBottom:'8px', border:'1px solid #E5E7EB' }}>
              <i className="ti ti-file-text" style={{ fontSize:'20px', color:'#E85D04', flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:500, fontSize:'13px' }}>{e.nombre}</div>
                <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{e.fecha} · {e.storage_path ? 'Archivo subido' : 'Solo metadata'}</div>
              </div>
              <span style={{ fontSize:'10px', background:'#FFF0E8', color:'#C44D00', borderRadius:'20px', padding:'3px 8px', fontWeight:600 }}>JSON</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Citas Psicólogo */}
      {tab === 'citas' && (
        <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <div style={{ fontSize:'14px', fontWeight:600 }}>Citas con psicólogo</div>
            <button onClick={() => setShowCita(v=>!v)} style={{ border:'1px solid #185FA5', color:'#185FA5', background:'#fff', borderRadius:'8px', padding:'8px 14px', fontSize:'13px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
              <i className="ti ti-plus"/>Nueva cita
            </button>
          </div>

          {showCita && (
            <div style={{ background:'#F0F7FF', border:'1px solid #BFDBFE', borderRadius:'10px', padding:'16px', marginBottom:'16px' }}>
              <div style={{ fontSize:'13px', fontWeight:600, color:'#185FA5', marginBottom:'12px' }}>Agendar nueva cita</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                <div>
                  <label style={{ fontSize:'11px', color:'#6B7280', fontWeight:500, display:'block', marginBottom:'4px' }}>Fecha y hora</label>
                  <input type="datetime-local" value={citaForm.fecha} onChange={e=>setCitaForm(f=>({...f,fecha:e.target.value}))}
                    style={{ width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', height:'36px', padding:'0 10px', fontSize:'13px' }}/>
                </div>
                <div>
                  <label style={{ fontSize:'11px', color:'#6B7280', fontWeight:500, display:'block', marginBottom:'4px' }}>Lugar</label>
                  <input type="text" value={citaForm.lugar} onChange={e=>setCitaForm(f=>({...f,lugar:e.target.value}))}
                    placeholder="Ej: Oficina psicólogo UNFV"
                    style={{ width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', height:'36px', padding:'0 10px', fontSize:'13px' }}/>
                </div>
              </div>
              <div style={{ marginBottom:'10px' }}>
                <label style={{ fontSize:'11px', color:'#6B7280', fontWeight:500, display:'block', marginBottom:'4px' }}>Motivo</label>
                <textarea value={citaForm.motivo} onChange={e=>setCitaForm(f=>({...f,motivo:e.target.value}))}
                  placeholder="Describe el motivo de la cita..."
                  rows={2}
                  style={{ width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'8px 10px', fontSize:'13px', resize:'vertical' }}/>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={handleCita} style={{ background:'#185FA5', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                  Agendar cita
                </button>
                <button onClick={() => setShowCita(false)} style={{ background:'#fff', color:'#6B7280', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', cursor:'pointer' }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {d?.citas?.length === 0 && !showCita ? (
            <div style={{ textAlign:'center', padding:'32px', color:'#9CA3AF', fontSize:'13px', background:'#F9FAFB', borderRadius:'8px', border:'1px dashed #E5E7EB' }}>
              Sin citas agendadas
            </div>
          ) : d?.citas?.map(c => {
            const estadoColors = {
              pendiente:{ bg:'#FFFBEB', color:'#B45309', border:'#FDE68A' },
              confirmada:{ bg:'#F0FDF4', color:'#15803D', border:'#BBF7D0' },
              realizada:{ bg:'#EFF6FF', color:'#185FA5', border:'#BFDBFE' },
              cancelada:{ bg:'#F9FAFB', color:'#9CA3AF', border:'#E5E7EB' },
            }
            const ec = estadoColors[c.estado] ?? estadoColors.pendiente
            return (
              <div key={c.id} style={{ border:'1px solid #E5E7EB', borderRadius:'8px', padding:'14px', marginBottom:'8px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px', flexWrap:'wrap' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'13px' }}>{c.lugar || 'Lugar por confirmar'}</div>
                    <div style={{ fontSize:'12px', color:'#6B7280', marginTop:'3px' }}>
                      {c.fecha ? new Date(c.fecha).toLocaleString('es-PE',{dateStyle:'medium',timeStyle:'short'}) : 'Fecha por confirmar'}
                    </div>
                    {c.motivo && <div style={{ fontSize:'12px', color:'#6B7280', marginTop:'4px' }}>{c.motivo}</div>}
                  </div>
                  <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                    <span style={{ fontSize:'10.5px', fontWeight:600, background:ec.bg, color:ec.color, border:`1px solid ${ec.border}`, borderRadius:'20px', padding:'3px 9px' }}>
                      {c.estado.toUpperCase()}
                    </span>
                    {c.estado === 'pendiente' && (
                      <button onClick={() => updateCita(c.id,'confirmada').then(cargar)}
                        style={{ border:'1px solid #16A34A', color:'#16A34A', background:'#fff', borderRadius:'6px', padding:'4px 10px', fontSize:'11px', fontWeight:600, cursor:'pointer' }}>
                        Confirmar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab: Observaciones */}
      {tab === 'observaciones' && (
        <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'12px' }}>Observaciones del tutor</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
            {d?.observaciones?.length === 0 && (
              <div style={{ textAlign:'center', padding:'24px', color:'#9CA3AF', fontSize:'13px' }}>Sin observaciones registradas</div>
            )}
            {d?.observaciones?.map((o,i) => (
              <div key={i} style={{ background:'#F9FAFB', borderRadius:'8px', padding:'12px 14px', fontSize:'13px', borderLeft:'3px solid #E85D04' }}>
                <div style={{ fontSize:'11px', color:'#9CA3AF', marginBottom:'4px' }}>
                  {new Date(o.created_at).toLocaleDateString('es-PE',{dateStyle:'medium'})} · Mg. Jorge Mendoza
                </div>
                {o.texto}
              </div>
            ))}
          </div>
          <textarea value={nuevaNota} onChange={e=>setNuevaNota(e.target.value)}
            placeholder="Agregar nueva observación..."
            rows={3}
            style={{ width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', resize:'vertical', marginBottom:'8px' }}
          />
          <button onClick={handleObs} style={{ background:'#E85D04', color:'#fff', border:'none', borderRadius:'8px', padding:'9px 18px', fontSize:'13px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
            <i className="ti ti-check"/>Guardar observación
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}
