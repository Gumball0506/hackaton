import { useState, useMemo } from 'react'

const C = {
  red:'#DC2626', redBg:'#FEF2F2', redBorder:'#FECACA',
  amber:'#D97706', amberBg:'#FFFBEB', amberBorder:'#FDE68A',
  green:'#16A34A', greenBg:'#F0FDF4', greenBorder:'#BBF7D0',
  blue:'#2563EB', textMuted:'#9CA3AF', textSecondary:'#6B7280', textPrimary:'#111827',
  border:'#E5E7EB', brand:'#E85D04',
}

function generarAlertas(estudiantes) {
  const alertas = []
  estudiantes.forEach(e => {
    const id = e.id
    if (e.faltas >= 5) {
      const pct = Math.round(e.faltas / 16 * 100)
      alertas.push({
        id:`${id}-faltas`, estudianteId:id, tipo:'INHABILITACION', severidad:'CRITICA',
        titulo:'Riesgo de inhabilitación por inasistencia',
        descripcion:`${e.faltas} faltas acumuladas de 16 sesiones (${pct}%)`,
        detalle:'El reglamento UNFV establece inhabilitación con más del 30% de inasistencias (≥ 5 faltas).',
        metrica:`${e.faltas}/16`,
      })
    } else if (e.faltas >= 3) {
      alertas.push({
        id:`${id}-asist`, estudianteId:id, tipo:'RIESGO_ASISTENCIA', severidad:'ALTA',
        titulo:'Zona de alerta por inasistencia',
        descripcion:`${e.faltas} faltas — a ${5 - e.faltas} falta(s) de inhabilitación`,
        detalle:'Tendencia preocupante. Requiere seguimiento preventivo.',
        metrica:`${e.faltas}/16`,
      })
    }
    if (e.promedio !== null && e.promedio < 11) {
      alertas.push({
        id:`${id}-nota`, estudianteId:id, tipo:'RIESGO_ACADEMICO', severidad:'CRITICA',
        titulo:'Promedio por debajo del mínimo aprobatorio',
        descripcion:`Promedio actual: ${e.promedio}/20 (mínimo aprobatorio: 11)`,
        detalle:`Parcial ${e.parcial ?? '—'} · Final ${e.final ?? '—'} · Práctica ${e.practica ?? '—'}`,
        metrica:`${e.promedio}/20`,
      })
    } else if (e.promedio !== null && e.promedio < 13) {
      alertas.push({
        id:`${id}-ambar`, estudianteId:id, tipo:'TENDENCIA_BAJA', severidad:'ALTA',
        titulo:'Rendimiento en zona de riesgo moderado',
        descripcion:`Promedio actual: ${e.promedio}/20 — riesgo de bajar del mínimo aprobatorio`,
        detalle:'Seguimiento recomendado. Posible necesidad de tutoría académica.',
        metrica:`${e.promedio}/20`,
      })
    }
    if (e.parcial !== null && e.parcial < 11) {
      alertas.push({
        id:`${id}-sust`, estudianteId:id, tipo:'SUSTITUTORIO', severidad:'MEDIA',
        titulo:'Candidato a examen sustitutorio',
        descripcion:`Nota parcial: ${e.parcial}/20 — necesita sustitutorio para mejorar promedio`,
        detalle:'Coordinar con el estudiante la preparación para el examen sustitutorio.',
        metrica:`${e.parcial}/20`,
      })
    }
  })
  return alertas
}

const TIPO_META = {
  INHABILITACION:    { label:'Inhabilitación',  color:C.red,     bg:C.redBg,   border:C.redBorder   },
  RIESGO_ACADEMICO:  { label:'Riesgo acad.',    color:C.red,     bg:C.redBg,   border:C.redBorder   },
  RIESGO_ASISTENCIA: { label:'Asistencia',      color:C.amber,   bg:C.amberBg, border:C.amberBorder },
  TENDENCIA_BAJA:    { label:'Tendencia baja',  color:C.amber,   bg:C.amberBg, border:C.amberBorder },
  SUSTITUTORIO:      { label:'Sustitutorio',    color:'#7C3AED', bg:'#F5F3FF', border:'#DDD6FE'     },
}
const SEV_META = {
  CRITICA: { label:'CRÍTICA', color:C.red,     bg:C.redBg   },
  ALTA:    { label:'ALTA',    color:C.amber,   bg:C.amberBg },
  MEDIA:   { label:'MEDIA',   color:'#7C3AED', bg:'#F5F3FF' },
}
const ORDEN_SEV = { CRITICA:0, ALTA:1, MEDIA:2 }

function MicroBar({ value, max, color, height=5 }) {
  const pct = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0
  return (
    <div style={{ height, borderRadius:3, background:'#F1F1F4', overflow:'hidden', marginTop:6 }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, transition:'width .6s ease' }}/>
    </div>
  )
}

function Avatar({ initials, size=40, bg=C.brand }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', background:bg,
      color:'#fff', fontWeight:700, fontSize:size*0.32, flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center'
    }}>{initials}</div>
  )
}

const TABS = [
  ['todas','Todas'],['criticas','Críticas'],['asistencia','Asistencia'],
  ['academicas','Académicas'],['atendidas','Atendidas'],
]

export default function Alertas({ estudiantes=[], onVerEstudiante }) {
  const [tab,        setTab]        = useState('todas')
  const [busqueda,   setBusqueda]   = useState('')
  const [atendidas,  setAtendidas]  = useState(new Set())
  const [expandidos, setExpandidos] = useState(new Set())
  const [notifEnv,   setNotifEnv]   = useState(new Set())

  const todasAlertas = useMemo(() => generarAlertas(estudiantes), [estudiantes])

  const kpis = useMemo(() => {
    const pend        = todasAlertas.filter(a => !atendidas.has(a.id))
    const enRiesgoIds = new Set(pend.map(a => a.estudianteId))
    const enRiesgo    = estudiantes.filter(e => enRiesgoIds.has(e.id))
    const conNota     = enRiesgo.filter(e => e.promedio !== null)
    const promRiesgo  = conNota.length
      ? (conNota.reduce((s,e) => s+e.promedio, 0)/conNota.length).toFixed(1) : '—'
    const cnGeneral   = estudiantes.filter(e => e.promedio !== null)
    const promGeneral = cnGeneral.length
      ? (cnGeneral.reduce((s,e) => s+e.promedio, 0)/cnGeneral.length).toFixed(1) : null
    const distTipo = {}
    pend.forEach(a => { distTipo[a.tipo] = (distTipo[a.tipo]||0)+1 })
    return {
      total:         pend.length,
      criticas:      pend.filter(a => a.severidad==='CRITICA').length,
      inhabilitados: pend.filter(a => a.tipo==='INHABILITACION').length,
      sustitutorios: pend.filter(a => a.tipo==='SUSTITUTORIO').length,
      tendencia:     pend.filter(a => a.tipo==='TENDENCIA_BAJA').length,
      enRiesgo:      enRiesgoIds.size,
      pctRiesgo:     Math.round(enRiesgoIds.size/(estudiantes.length||1)*100),
      promRiesgo, promGeneral,
      atendidas:     atendidas.size,
      tasaAtencion:  todasAlertas.length>0 ? Math.round(atendidas.size/todasAlertas.length*100) : 0,
      distTipo,
      rojos:  estudiantes.filter(e => e.riesgo==='ROJO'||e.riesgo==='ROJO_FALTAS').length,
      ambar:  estudiantes.filter(e => e.riesgo==='AMBAR').length,
      verdes: estudiantes.filter(e => e.riesgo==='VERDE').length,
    }
  }, [todasAlertas, atendidas, estudiantes])

  const alertasFiltradas = useMemo(() => {
    return todasAlertas.filter(a => {
      const atendida = atendidas.has(a.id)
      const est      = estudiantes.find(e => e.id===a.estudianteId)
      if (!est) return false
      const q        = busqueda.toLowerCase()
      const matchQ   = !busqueda || est.nombre.toLowerCase().includes(q) || est.codigo?.includes(q)
      if (!matchQ) return false
      if (tab==='atendidas')  return atendida
      if (atendida)           return false
      if (tab==='criticas')   return a.severidad==='CRITICA'
      if (tab==='asistencia') return a.tipo==='INHABILITACION'||a.tipo==='RIESGO_ASISTENCIA'
      if (tab==='academicas') return ['RIESGO_ACADEMICO','TENDENCIA_BAJA','SUSTITUTORIO'].includes(a.tipo)
      return true
    })
  }, [todasAlertas, tab, atendidas, busqueda, estudiantes])

  const grupos = useMemo(() => {
    const map = new Map()
    alertasFiltradas.forEach(a => {
      if (!map.has(a.estudianteId)) map.set(a.estudianteId, [])
      map.get(a.estudianteId).push(a)
    })
    map.forEach(list => list.sort((a,b) => ORDEN_SEV[a.severidad]-ORDEN_SEV[b.severidad]))
    return [...map.entries()].sort((a,b) => ORDEN_SEV[a[1][0].severidad]-ORDEN_SEV[b[1][0].severidad])
  }, [alertasFiltradas])

  const tabCount = t => {
    const pend = todasAlertas.filter(a => !atendidas.has(a.id))
    if (t==='todas')      return pend.length
    if (t==='atendidas')  return atendidas.size
    if (t==='criticas')   return pend.filter(a => a.severidad==='CRITICA').length
    if (t==='asistencia') return pend.filter(a => a.tipo==='INHABILITACION'||a.tipo==='RIESGO_ASISTENCIA').length
    if (t==='academicas') return pend.filter(a => ['RIESGO_ACADEMICO','TENDENCIA_BAJA','SUSTITUTORIO'].includes(a.tipo)).length
    return 0
  }

  const toggleAtendida = id => setAtendidas(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s })
  const marcarTodas    = eid => {
    const ids = todasAlertas.filter(a => a.estudianteId===eid).map(a => a.id)
    setAtendidas(prev => { const s=new Set(prev); ids.forEach(id => s.add(id)); return s })
  }
  const toggleExpand  = eid => setExpandidos(prev => { const s=new Set(prev); s.has(eid)?s.delete(eid):s.add(eid); return s })
  const expandirTodos = () => setExpandidos(new Set(grupos.map(([eid]) => eid)))
  const colapsarTodos = () => setExpandidos(new Set())

  const insights = [
    kpis.inhabilitados>0  && { color:C.red,   bg:C.redBg,   border:C.redBorder,   txt:`${kpis.inhabilitados} estudiante${kpis.inhabilitados>1?'s':''} con riesgo de inhabilitación — derivar a tutoría urgente.` },
    kpis.sustitutorios>0  && { color:'#7C3AED', bg:'#F5F3FF', border:'#DDD6FE',   txt:`${kpis.sustitutorios} candidato${kpis.sustitutorios>1?'s':''} a examen sustitutorio — coordinar sesión de repaso grupal.` },
    kpis.tendencia>0      && { color:C.amber, bg:C.amberBg,  border:C.amberBorder, txt:`${kpis.tendencia} estudiante${kpis.tendencia>1?'s':''} con tendencia a la baja — intervención preventiva antes del final.` },
    kpis.promRiesgo!=='—' && kpis.promGeneral && {
      color:C.blue, bg:'#EFF6FF', border:'#BFDBFE',
      txt:`Promedio grupo en riesgo: ${kpis.promRiesgo}/20 vs ${kpis.promGeneral}/20 general (dif: ${(parseFloat(kpis.promRiesgo)-parseFloat(kpis.promGeneral)).toFixed(1)} pts).`
    },
  ].filter(Boolean)

  return (
    <div style={{ padding:'20px 24px', fontFamily:'Inter,sans-serif' }}>

      {/* PANEL DARK */}
      <div style={{
        background:'linear-gradient(135deg,#1A1A2E 0%,#252545 100%)',
        borderRadius:12, padding:'20px 24px', marginBottom:18, color:'#fff'
      }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:20, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:10.5, color:'#8888A8', textTransform:'uppercase', letterSpacing:'.5px', fontWeight:600, marginBottom:4 }}>
              Monitoreo en tiempo real — Base de Datos II · Ciclo 2026-I
            </div>
            <div style={{ fontSize:26, fontWeight:700, lineHeight:1.1 }}>{kpis.total} alertas activas</div>
            <div style={{ fontSize:12.5, color:'#A0A0C0', marginTop:6, lineHeight:1.5 }}>
              <span style={{ color:'#FCA5A5', fontWeight:600 }}>{kpis.criticas} críticas</span>
              {' '}requieren atención inmediata ·{' '}
              <span style={{ color:'#86EFAC', fontWeight:600 }}>{kpis.atendidas} atendidas</span>
              {' '}({kpis.tasaAtencion}% resolución)
            </div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {[
              { label:'Inhabilitados', val:kpis.inhabilitados, c:'#FCA5A5', bg:'rgba(220,38,38,.18)',  icon:'🚫' },
              { label:'Sustitutorio',  val:kpis.sustitutorios, c:'#FCD34D', bg:'rgba(217,119,6,.18)',  icon:'📝' },
              { label:'Tendencia ↓',  val:kpis.tendencia,      c:'#93C5FD', bg:'rgba(37,99,235,.18)',  icon:'📉' },
              { label:'Atendidas',    val:kpis.atendidas,      c:'#6EE7B7', bg:'rgba(16,185,129,.15)', icon:'✅' },
            ].map((s,i) => (
              <div key={i} style={{ background:s.bg, borderRadius:10, padding:'10px 14px', textAlign:'center', minWidth:80, border:'1px solid rgba(255,255,255,.06)' }}>
                <div style={{ fontSize:11 }}>{s.icon}</div>
                <div style={{ fontSize:22, fontWeight:700, color:s.c, lineHeight:1.1, marginTop:2 }}>{s.val}</div>
                <div style={{ fontSize:10, color:'#9898B8', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>

        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{ fontSize:11, color:C.textSecondary }}>Estudiantes en riesgo</span>
            <i className="ti ti-users" style={{ color:C.red }}/>
          </div>
          <div style={{ fontSize:28, fontWeight:700, marginTop:8, color:C.red }}>{kpis.enRiesgo}</div>
          <MicroBar value={kpis.enRiesgo} max={estudiantes.length} color={C.red}/>
          <div style={{ fontSize:10.5, color:C.textMuted, marginTop:4 }}>{kpis.pctRiesgo}% del grupo ({estudiantes.length} est.)</div>
          <div style={{ display:'flex', gap:5, marginTop:8, flexWrap:'wrap' }}>
            {[['ROJO',kpis.rojos,C.red,C.redBg],['ÁMBAR',kpis.ambar,C.amber,C.amberBg],['VERDE',kpis.verdes,C.green,C.greenBg]].map(([l,n,c,bg]) => (
              <span key={l} style={{ fontSize:10, fontWeight:600, background:bg, color:c, borderRadius:6, padding:'2px 7px' }}>{l} {n}</span>
            ))}
          </div>
        </div>

        <div style={{ background:'#fff', border:`1px solid ${C.redBorder}`, borderRadius:10, padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{ fontSize:11, color:C.textSecondary }}>Alertas nivel crítico</span>
            <i className="ti ti-alert-octagon" style={{ color:C.red }}/>
          </div>
          <div style={{ fontSize:28, fontWeight:700, marginTop:8, color:C.red }}>{kpis.criticas}</div>
          <MicroBar value={kpis.criticas} max={kpis.total||1} color={C.red}/>
          <div style={{ fontSize:10.5, color:C.textMuted, marginTop:4 }}>
            {kpis.total>0 ? Math.round(kpis.criticas/kpis.total*100) : 0}% del total de alertas
          </div>
          <div style={{ fontSize:11, color:C.red, marginTop:6, fontStyle:'italic' }}>Requieren acción en menos de 24h</div>
        </div>

        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{ fontSize:11, color:C.textSecondary }}>Inhabilitados por asistencia</span>
            <i className="ti ti-clock-off" style={{ color:C.red }}/>
          </div>
          <div style={{ fontSize:28, fontWeight:700, marginTop:8, color:C.red }}>{kpis.inhabilitados}</div>
          <MicroBar value={kpis.inhabilitados} max={estudiantes.length} color={C.red}/>
          <div style={{ fontSize:10.5, color:C.textMuted, marginTop:4 }}>Superaron el 30% de faltas (≥5/16)</div>
          <div style={{ fontSize:11, color:C.amber, marginTop:6 }}>
            +{estudiantes.filter(e => e.faltas>=3&&e.faltas<5).length} en zona de alerta (3–4 faltas)
          </div>
        </div>

        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{ fontSize:11, color:C.textSecondary }}>Tasa de atención del tutor</span>
            <i className="ti ti-circle-check" style={{ color:kpis.tasaAtencion>=50?C.green:C.amber }}/>
          </div>
          <div style={{ fontSize:28, fontWeight:700, marginTop:8, color:kpis.tasaAtencion>=50?C.green:C.amber }}>{kpis.tasaAtencion}%</div>
          <MicroBar value={kpis.tasaAtencion} max={100} color={kpis.tasaAtencion>=50?C.green:C.amber}/>
          <div style={{ fontSize:10.5, color:C.textMuted, marginTop:4 }}>{kpis.atendidas} de {todasAlertas.length} alertas resueltas</div>
          <div style={{ fontSize:11, color:C.textSecondary, marginTop:6 }}>Meta recomendada: ≥ 80%</div>
        </div>

        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{ fontSize:11, color:C.textSecondary }}>Promedio — grupo en riesgo</span>
            <i className="ti ti-trending-down" style={{ color:C.red }}/>
          </div>
          <div style={{ fontSize:28, fontWeight:700, marginTop:8, color:C.red }}>
            {kpis.promRiesgo}<span style={{ fontSize:14, fontWeight:400, color:C.textMuted }}>/20</span>
          </div>
          <MicroBar value={parseFloat(kpis.promRiesgo)||0} max={20} color={C.red}/>
          <div style={{ fontSize:10.5, color:C.textMuted, marginTop:4 }}>Promedio grupo general: {kpis.promGeneral??'—'}/20</div>
          {kpis.promRiesgo!=='—'&&kpis.promGeneral&&(
            <div style={{ fontSize:11, color:C.red, marginTop:6 }}>
              Diferencia: {(parseFloat(kpis.promRiesgo)-parseFloat(kpis.promGeneral)).toFixed(1)} pts
            </div>
          )}
        </div>

        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{ fontSize:11, color:C.textSecondary }}>Candidatos a sustitutorio</span>
            <i className="ti ti-pencil" style={{ color:C.amber }}/>
          </div>
          <div style={{ fontSize:28, fontWeight:700, marginTop:8, color:C.amber }}>{kpis.sustitutorios}</div>
          <MicroBar value={kpis.sustitutorios} max={estudiantes.length} color={C.amber}/>
          <div style={{ fontSize:10.5, color:C.textMuted, marginTop:4 }}>Parcial con nota menor a 11/20</div>
          <div style={{ fontSize:11, color:C.amber, marginTop:6, fontStyle:'italic' }}>Sin aprobarlo reprobarán el ciclo</div>
        </div>

        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{ fontSize:11, color:C.textSecondary }}>Sin nota registrada</span>
            <i className="ti ti-clipboard-x" style={{ color:C.textMuted }}/>
          </div>
          <div style={{ fontSize:28, fontWeight:700, marginTop:8, color:C.textSecondary }}>
            {estudiantes.filter(e => e.promedio===null).length}
          </div>
          <MicroBar value={estudiantes.filter(e=>e.promedio===null).length} max={estudiantes.length} color={C.textMuted}/>
          <div style={{ fontSize:10.5, color:C.textMuted, marginTop:4 }}>Estudiantes sin evaluaciones aún</div>
          <div style={{ fontSize:11, color:C.textSecondary, marginTop:6 }}>Ingresar notas desde Perfil</div>
        </div>

        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{ fontSize:11, color:C.textSecondary }}>Riesgo por sección</span>
            <i className="ti ti-layout-columns" style={{ color:C.blue }}/>
          </div>
          {['A','B'].map(sec => {
            const arr = estudiantes.filter(e => e.seccion===sec)
            const r   = arr.filter(e => e.riesgo==='ROJO'||e.riesgo==='ROJO_FALTAS'||e.riesgo==='AMBAR').length
            const pct = arr.length ? Math.round(r/arr.length*100) : 0
            return (
              <div key={sec} style={{ marginTop:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                  <span style={{ color:C.textSecondary }}>Sección {sec}</span>
                  <span style={{ fontWeight:600, color:pct>30?C.red:pct>15?C.amber:C.green }}>{r}/{arr.length} ({pct}%)</span>
                </div>
                <MicroBar value={r} max={arr.length} color={pct>30?C.red:pct>15?C.amber:C.green} height={4}/>
              </div>
            )
          })}
        </div>
      </div>

      {/* DISTRIBUCIÓN + INSIGHTS */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, padding:18 }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Distribución por tipo de alerta</div>
          {Object.entries(kpis.distTipo).sort((a,b)=>b[1]-a[1]).map(([tipo,cnt]) => {
            const m   = TIPO_META[tipo]||{ label:tipo, color:C.textSecondary, bg:'#F3F4F6', border:C.border }
            const pct = kpis.total>0 ? Math.round(cnt/kpis.total*100) : 0
            return (
              <div key={tipo} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                  <span style={{ fontSize:12, fontWeight:500, color:m.color }}>{m.label}</span>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:11, color:C.textMuted }}>{pct}%</span>
                    <span style={{ fontSize:13, fontWeight:700, color:m.color, minWidth:18, textAlign:'right' }}>{cnt}</span>
                  </div>
                </div>
                <div style={{ height:6, borderRadius:3, background:'#F1F1F4', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:m.color, borderRadius:3, transition:'width .5s' }}/>
                </div>
              </div>
            )
          })}
          {Object.keys(kpis.distTipo).length===0&&(
            <div style={{ color:C.textMuted, fontSize:13, textAlign:'center', padding:20 }}>Sin alertas activas</div>
          )}
        </div>

        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10, padding:18 }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
            <i className="ti ti-bulb" style={{ color:C.amber }}/> Insights automáticos
          </div>
          {insights.length>0 ? insights.map((r,i) => (
            <div key={i} style={{
              display:'flex', gap:8, padding:'9px 11px', borderRadius:8,
              background:r.bg, border:`1px solid ${r.border}`, marginBottom:8
            }}>
              <span style={{ color:r.color, flexShrink:0, marginTop:1 }}>▶</span>
              <span style={{ fontSize:12, color:r.color, lineHeight:1.5 }}>{r.txt}</span>
            </div>
          )) : (
            <div style={{ color:C.green, fontSize:13, textAlign:'center', padding:20 }}>
              <i className="ti ti-circle-check" style={{ fontSize:28, display:'block', marginBottom:8 }}/>
              Sin alertas críticas activas.
            </div>
          )}
        </div>
      </div>

      {/* CONTROLES */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <div style={{ position:'relative', display:'flex', alignItems:'center', background:'#fff', border:`1px solid ${C.border}`, borderRadius:8, height:36, padding:'0 12px', gap:8, width:220 }}>
          <i className="ti ti-search" style={{ color:C.textMuted, fontSize:13 }}/>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar nombre o código..."
            style={{ border:'none', background:'transparent', outline:'none', fontSize:13, width:'100%' }}/>
          {busqueda&&(
            <button onClick={()=>setBusqueda('')} style={{ border:'none', background:'none', cursor:'pointer', color:C.textMuted, padding:0, fontSize:13 }}>✕</button>
          )}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:12, color:C.textMuted }}>{grupos.length} estudiante{grupos.length!==1?'s':''}</span>
          <button onClick={expandidos.size>0?colapsarTodos:expandirTodos}
            style={{ border:`1px solid ${C.border}`, background:'#fff', borderRadius:8, padding:'6px 12px', fontSize:12, cursor:'pointer', color:C.textSecondary }}>
            {expandidos.size>0?'Colapsar todos':'Expandir todos'}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', background:'#fff', border:`1px solid ${C.border}`, borderRadius:'10px 10px 0 0', padding:'0 4px', marginTop:10, borderBottom:'none' }}>
        {TABS.map(([key,label]) => {
          const cnt    = tabCount(key)
          const activo = tab===key
          return (
            <button key={key} onClick={()=>setTab(key)} style={{
              display:'inline-flex', alignItems:'center', gap:6, border:'none',
              borderBottom: activo?`2px solid ${C.brand}`:'2px solid transparent',
              background:'transparent', color:activo?C.brand:C.textSecondary,
              fontWeight:activo?600:400, fontSize:13, padding:'12px 16px', cursor:'pointer', marginBottom:-1
            }}>
              {label}
              {cnt>0&&(
                <span style={{
                  fontSize:10, fontWeight:700,
                  background:activo?(key==='atendidas'?C.greenBg:C.redBg):'#F1F1F4',
                  color:activo?(key==='atendidas'?C.green:C.red):C.textMuted,
                  borderRadius:10, padding:'1px 7px', minWidth:20, textAlign:'center'
                }}>{cnt}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* LISTA */}
      <div style={{ paddingTop:10 }}>
        {grupos.length===0 ? (
          <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:'0 0 10px 10px', padding:40, textAlign:'center' }}>
            <i className="ti ti-circle-check" style={{ fontSize:44, color:C.green, display:'block', margin:'0 auto 12px' }}/>
            <div style={{ fontSize:16, fontWeight:600 }}>
              {tab==='atendidas'?'No hay alertas atendidas aún':'¡Sin alertas en este filtro!'}
            </div>
            <div style={{ fontSize:13, color:C.textMuted, marginTop:4 }}>
              {tab==='atendidas'
                ?'Las alertas que marques como atendidas aparecerán aquí.'
                :'Todos los estudiantes están dentro de los parámetros normales.'}
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {grupos.map(([eid,alertas]) => {
              const e       = estudiantes.find(x => x.id===eid)
              if (!e) return null
              const maxSev  = alertas[0].severidad
              const abierto = expandidos.has(eid)
              const todas   = alertas.every(a => atendidas.has(a.id))
              const notifOk = notifEnv.has(eid)
              const brdColor= maxSev==='CRITICA'?C.redBorder:maxSev==='ALTA'?'#FED7AA':C.amberBorder
              const hdrBg   = maxSev==='CRITICA'?'#FFF8F8':maxSev==='ALTA'?'#FFF4EE':'#FFFBEB'
              const initials = e.iniciales || e.nombre.split(' ').slice(0,2).map(w=>w[0]).join('')

              return (
                <div key={eid} style={{ background:'#fff', borderRadius:10, overflow:'hidden', border:`1px solid ${brdColor}` }}>
                  <div onClick={()=>toggleExpand(eid)}
                    style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:hdrBg, borderBottom:abierto?`1px solid ${C.border}`:'none', cursor:'pointer' }}>
                    <Avatar initials={initials} size={42}
                      bg={e.riesgo==='ROJO'||e.riesgo==='ROJO_FALTAS'?C.red:e.riesgo==='AMBAR'?C.amber:C.green}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <span style={{ fontSize:14, fontWeight:700 }}>{e.nombre}</span>
                        <span style={{ fontSize:10, fontWeight:700, background:SEV_META[maxSev].bg, color:SEV_META[maxSev].color, borderRadius:20, padding:'2px 9px' }}>
                          {SEV_META[maxSev].label}
                        </span>
                        <span style={{ fontSize:10, fontWeight:600, background:'#F1F1F4', color:C.textSecondary, borderRadius:20, padding:'2px 9px' }}>
                          {alertas.length} alerta{alertas.length!==1?'s':''}
                        </span>
                        {todas&&<span style={{ fontSize:10, fontWeight:600, background:C.greenBg, color:C.green, borderRadius:20, padding:'2px 9px' }}>✓ Atendida</span>}
                      </div>
                      <div style={{ display:'flex', gap:14, marginTop:5, flexWrap:'wrap', fontSize:11.5, color:C.textSecondary }}>
                        <span>{e.codigo} · Sección {e.seccion}</span>
                        <span>Prom: <strong style={{ color:e.promedio===null?C.textMuted:e.promedio>=11?C.green:C.red }}>{e.promedio??'—'}/20</strong></span>
                        <span>Faltas: <strong style={{ color:e.faltas>=5?C.red:e.faltas>=3?C.amber:C.green }}>{e.faltas}/16</strong></span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:5, flexShrink:0, alignItems:'center', flexWrap:'wrap', maxWidth:220 }}>
                      {[...new Set(alertas.map(a=>a.tipo))].map(tipo => {
                        const m = TIPO_META[tipo]||{ label:tipo, color:C.textSecondary, bg:'#F3F4F6', border:C.border }
                        return (
                          <span key={tipo} style={{ fontSize:9.5, fontWeight:600, background:m.bg, color:m.color, border:`1px solid ${m.border}`, borderRadius:5, padding:'2px 7px' }}>
                            {m.label}
                          </span>
                        )
                      })}
                      <span style={{ fontSize:12, color:C.textMuted, marginLeft:2 }}>{abierto?'▲':'▼'}</span>
                    </div>
                  </div>

                  {abierto&&(
                    <div style={{ padding:'14px 18px 0' }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:14 }}>
                        {alertas.map(a => {
                          const tm    = TIPO_META[a.tipo]||{ label:a.tipo, color:C.textSecondary, bg:'#F3F4F6', border:C.border }
                          const sm    = SEV_META[a.severidad]
                          const ya    = atendidas.has(a.id)
                          const leftC = ya?C.border:sm.color
                          return (
                            <div key={a.id} style={{
                              display:'flex', gap:12, alignItems:'flex-start', padding:'10px 13px', borderRadius:8,
                              background:ya?'#F9FAFB':a.severidad==='CRITICA'?'#FFF5F5':'#FFFDF5',
                              border:`1px solid ${ya?C.border:brdColor}`,
                              borderLeft:`4px solid ${leftC}`,
                              opacity:ya?0.6:1
                            }}>
                              <i className="ti ti-alert-circle" style={{ color:ya?C.textMuted:tm.color, marginTop:2, flexShrink:0 }}/>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
                                  <span style={{ fontSize:12.5, fontWeight:600, color:ya?C.textMuted:C.textPrimary }}>{a.titulo}</span>
                                  <span style={{ fontSize:9.5, fontWeight:700, background:tm.bg, color:tm.color, border:`1px solid ${tm.border}`, borderRadius:5, padding:'1px 6px' }}>{tm.label}</span>
                                  <span style={{ fontSize:9.5, fontWeight:600, background:sm.bg, color:sm.color, borderRadius:5, padding:'1px 6px' }}>{sm.label}</span>
                                </div>
                                <div style={{ fontSize:12, color:C.textSecondary, marginTop:2 }}>{a.descripcion}</div>
                                <div style={{ fontSize:11, color:C.textMuted, marginTop:1, lineHeight:1.4 }}>{a.detalle}</div>
                              </div>
                              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, flexShrink:0 }}>
                                <span style={{ fontSize:15, fontWeight:700, color:ya?C.textMuted:tm.color }}>{a.metrica}</span>
                                <button onClick={()=>toggleAtendida(a.id)} style={{
                                  fontSize:10, fontWeight:600, cursor:'pointer', border:'none', borderRadius:5, padding:'3px 8px',
                                  background:ya?C.greenBg:'#F1F1F4', color:ya?C.green:C.textSecondary
                                }}>{ya?'✓ Atendida':'Marcar atendida'}</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div style={{ display:'flex', gap:8, padding:'10px 0 14px', borderTop:`1px solid ${C.border}`, flexWrap:'wrap', alignItems:'center' }}>
                        <button onClick={()=>onVerEstudiante(e)} style={{
                          display:'inline-flex', alignItems:'center', gap:6,
                          background:C.brand, color:'#fff', border:'none', borderRadius:8,
                          padding:'8px 15px', fontSize:12.5, fontWeight:600, cursor:'pointer'
                        }}>
                          <i className="ti ti-user"/>Ver perfil completo
                        </button>
                        <button onClick={()=>marcarTodas(eid)} style={{
                          display:'inline-flex', alignItems:'center', gap:6,
                          background:'#fff', color:C.green, border:`1px solid ${C.greenBorder}`, borderRadius:8,
                          padding:'8px 15px', fontSize:12.5, fontWeight:600, cursor:'pointer'
                        }}>
                          <i className="ti ti-checks"/>Marcar todas atendidas
                        </button>
                        <button onClick={()=>setNotifEnv(prev=>{ const s=new Set(prev); s.add(eid); return s })} style={{
                          display:'inline-flex', alignItems:'center', gap:6,
                          background:notifOk?C.greenBg:'#fff', color:notifOk?C.green:C.blue,
                          border:`1px solid ${notifOk?C.greenBorder:C.blue}`,
                          borderRadius:8, padding:'8px 15px', fontSize:12.5, fontWeight:600, cursor:'pointer'
                        }}>
                          <i className={`ti ${notifOk?'ti-check':'ti-send'}`}/>
                          {notifOk?'Notificación enviada':'Enviar notificación'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
