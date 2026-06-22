import { useState } from 'react'
import { calcKPIs } from './lib/queries'

function Pill({ label, value, color = '#374151', bg = '#F3F4F6' }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F3F4F6' }}>
      <span style={{ fontSize:'13px', color:'#6B7280' }}>{label}</span>
      <span style={{ fontSize:'14px', fontWeight:700, color, background: bg === '#F3F4F6' ? 'transparent' : bg, padding: bg !== '#F3F4F6' ? '2px 10px' : 0, borderRadius:'20px' }}>{value}</span>
    </div>
  )
}

function Section({ title, children, icon }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:600, fontSize:'15px', marginBottom:'14px' }}>
        <i className={`ti ${icon}`} style={{ color:'#E85D04' }}/>{title}
      </div>
      {children}
    </div>
  )
}

export default function Reportes({ estudiantes = [] }) {
  const [exportando, setExportando] = useState(false)
  const kpis = calcKPIs(estudiantes)

  const secA = estudiantes.filter(e => e.seccion === 'A')
  const secB = estudiantes.filter(e => e.seccion === 'B')

  const avgFn = arr => {
    const cn = arr.filter(e => e.promedio !== null)
    return cn.length ? (cn.reduce((s, e) => s + e.promedio, 0) / cn.length).toFixed(1) : '—'
  }

  const asistFn = arr => {
    const todos = arr.flatMap(e => e.asistencias ?? [])
    const reg   = todos.filter(a => a.presente !== null)
    const pres  = todos.filter(a => a.presente === true)
    return reg.length ? Math.round(pres.length / reg.length * 100) : null
  }

  const pctA = asistFn(secA)
  const pctB = asistFn(secB)
  const pctT = asistFn(estudiantes)

  const conFaltas5 = estudiantes.filter(e => e.faltas >= 5).length
  const sinNota    = estudiantes.filter(e => e.promedio === null).length
  const conNota    = estudiantes.length - sinNota

  function exportarCSV() {
    setExportando(true)
    const headers = 'Código,Apellidos y Nombres,Sección,Parcial,Final,Práctica,Promedio,Faltas,Estado'
    const rows = estudiantes.map(e =>
      [e.codigo, `"${e.nombre}"`, e.seccion, e.parcial ?? '', e.final ?? '', e.practica ?? '', e.promedio ?? '', e.faltas, e.riesgo].join(',')
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `reporte_base_datos_II_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setTimeout(() => setExportando(false), 1000)
  }

  function exportarTXT() {
    setExportando(true)
    const lineas = [
      '══════════════════════════════════════════════════════',
      'REPORTE ACADÉMICO — BASE DE DATOS II | UNFV',
      `Generado: ${new Date().toLocaleString('es-PE')}`,
      'Tutor: Mg. Jorge Mendoza Quispe',
      '══════════════════════════════════════════════════════',
      '',
      'RESUMEN GENERAL',
      `  Total estudiantes : ${estudiantes.length}`,
      `  Con nota          : ${conNota}`,
      `  Sin nota          : ${sinNota}`,
      `  Promedio general  : ${kpis.avg ?? '—'}/20`,
      `  En riesgo alto    : ${kpis.rojos}`,
      `  En riesgo moderado: ${kpis.ambar}`,
      `  Sin riesgo        : ${kpis.verdes}`,
      '',
      'SECCIÓN A',
      `  Estudiantes : ${secA.length}`,
      `  Promedio    : ${avgFn(secA)}/20`,
      `  % Asistencia: ${pctA !== null ? pctA + '%' : '—'}`,
      '',
      'SECCIÓN B',
      `  Estudiantes : ${secB.length}`,
      `  Promedio    : ${avgFn(secB)}/20`,
      `  % Asistencia: ${pctB !== null ? pctB + '%' : '—'}`,
      '',
      'DETALLE DE ESTUDIANTES',
      '──────────────────────────────────────────────────────',
      ...estudiantes.map(e =>
        `  ${e.codigo}  ${e.nombre.padEnd(40)}  Sec.${e.seccion}  Prom:${e.promedio ?? 'S/N'}  Faltas:${e.faltas}  [${e.riesgo}]`
      ),
      '',
      '══════════════════════════════════════════════════════',
    ]
    const blob = new Blob([lineas.join('\n')], { type:'text/plain;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `reporte_${new Date().toISOString().slice(0,10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setTimeout(() => setExportando(false), 1000)
  }

  return (
    <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'20px' }}>
      {/* Header + Export */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ fontWeight:700, fontSize:'18px' }}>Reportes y Estadísticas</div>
          <div style={{ fontSize:'13px', color:'#6B7280', marginTop:'2px' }}>
            Base de Datos II · Ciclo V · 2026-I
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={exportarTXT} disabled={exportando} style={{
            display:'flex', alignItems:'center', gap:'6px',
            border:'1px solid #E5E7EB', background:'#fff', color:'#374151',
            borderRadius:'9px', padding:'9px 16px', fontWeight:600, fontSize:'13px', cursor:'pointer'
          }}>
            <i className="ti ti-file-text"/>Exportar TXT
          </button>
          <button onClick={exportarCSV} disabled={exportando} style={{
            display:'flex', alignItems:'center', gap:'6px',
            background:'#E85D04', color:'#fff', border:'none',
            borderRadius:'9px', padding:'9px 16px', fontWeight:600, fontSize:'13px', cursor:'pointer'
          }}>
            <i className="ti ti-table-export"/>{exportando ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      {/* KPI rápidos */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'12px' }}>
        {[
          { label:'Total',        value: estudiantes.length, icon:'ti-users',          color:'#374151' },
          { label:'Con nota',     value: conNota,            icon:'ti-clipboard-check', color:'#2563EB' },
          { label:'Sin nota',     value: sinNota,            icon:'ti-clock',           color:'#9CA3AF' },
          { label:'Riesgo alto',  value: kpis.rojos,         icon:'ti-alert-triangle',  color:'#DC2626' },
          { label:'Riesgo mod.',  value: kpis.ambar,         icon:'ti-alert-circle',    color:'#D97706' },
          { label:'Sin riesgo',   value: kpis.verdes,        icon:'ti-circle-check',    color:'#16A34A' },
          { label:'≥5 faltas',    value: conFaltas5,         icon:'ti-calendar-off',    color:'#DC2626' },
          { label:'% Asistencia', value: pctT !== null ? `${pctT}%` : '—', icon:'ti-calendar', color:'#2563EB' },
        ].map(k => (
          <div key={k.label} style={{
            background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px',
            padding:'16px', display:'flex', flexDirection:'column', gap:'6px'
          }}>
            <i className={`ti ${k.icon}`} style={{ color: k.color, fontSize:'20px' }}/>
            <div style={{ fontSize:'24px', fontWeight:700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize:'12px', color:'#6B7280' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px' }}>
        {/* Sección A */}
        <Section title="Sección A" icon="ti-users">
          <Pill label="Estudiantes"        value={secA.length}/>
          <Pill label="Promedio"           value={`${avgFn(secA)}/20`}   color='#E85D04'/>
          <Pill label="% Asistencia"       value={pctA !== null ? `${pctA}%` : '—'} color={pctA < 70 ? '#DC2626' : '#16A34A'}/>
          <Pill label="Con ≥5 faltas"      value={secA.filter(e=>e.faltas>=5).length} color={secA.filter(e=>e.faltas>=5).length > 0 ? '#DC2626' : '#16A34A'}/>
          <Pill label="En riesgo alto"     value={secA.filter(e=>e.riesgo==='ROJO'||e.riesgo==='ROJO_FALTAS').length} color='#DC2626'/>
          <Pill label="En riesgo moderado" value={secA.filter(e=>e.riesgo==='AMBAR').length} color='#D97706'/>
          <Pill label="Sin riesgo"         value={secA.filter(e=>e.riesgo==='VERDE').length} color='#16A34A'/>
        </Section>

        {/* Sección B */}
        <Section title="Sección B" icon="ti-users">
          <Pill label="Estudiantes"        value={secB.length}/>
          <Pill label="Promedio"           value={`${avgFn(secB)}/20`}   color='#E85D04'/>
          <Pill label="% Asistencia"       value={pctB !== null ? `${pctB}%` : '—'} color={pctB < 70 ? '#DC2626' : '#16A34A'}/>
          <Pill label="Con ≥5 faltas"      value={secB.filter(e=>e.faltas>=5).length} color={secB.filter(e=>e.faltas>=5).length > 0 ? '#DC2626' : '#16A34A'}/>
          <Pill label="En riesgo alto"     value={secB.filter(e=>e.riesgo==='ROJO'||e.riesgo==='ROJO_FALTAS').length} color='#DC2626'/>
          <Pill label="En riesgo moderado" value={secB.filter(e=>e.riesgo==='AMBAR').length} color='#D97706'/>
          <Pill label="Sin riesgo"         value={secB.filter(e=>e.riesgo==='VERDE').length} color='#16A34A'/>
        </Section>
      </div>

      {/* Distribución notas */}
      <Section title="Distribución por rango de notas" icon="ti-chart-bar">
        {[['18–20','Excelente','#16A34A',[18,20]],['15–17','Muy bueno','#22C55E',[15,17]],
          ['13–14','Bueno','#84CC16',[13,14]],['11–12','Regular','#D97706',[11,12]],
          ['0–10','Desaprobado','#DC2626',[0,10]]
        ].map(([rango, label, color, [lo,hi]]) => {
          const cn = estudiantes.filter(e => e.promedio !== null)
          const n  = cn.filter(e => e.promedio >= lo && e.promedio <= hi).length
          const pct = cn.length ? Math.round(n / cn.length * 100) : 0
          return (
            <div key={rango} style={{ marginBottom:'10px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'4px' }}>
                <span style={{ color:'#374151', fontWeight:500 }}>{rango} — {label}</span>
                <span style={{ color:'#6B7280' }}>{n} est. ({pct}%)</span>
              </div>
              <div style={{ height:'8px', background:'#F3F4F6', borderRadius:'4px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:'4px', transition:'width 0.6s ease' }}/>
              </div>
            </div>
          )
        })}
      </Section>

      {/* Tabla completa */}
      <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'20px' }}>
        <div style={{ fontWeight:600, fontSize:'15px', marginBottom:'14px' }}>
          <i className="ti ti-table" style={{ color:'#E85D04', marginRight:'8px' }}/>
          Listado completo de estudiantes
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12.5px' }}>
            <thead>
              <tr style={{ background:'#F9FAFB', borderBottom:'2px solid #E5E7EB' }}>
                {['Código','Apellidos y Nombres','Sec.','Parcial','Final','Práctica','Promedio','Faltas','Estado'].map(h => (
                  <th key={h} style={{ padding:'9px 10px', textAlign:'left', color:'#6B7280', fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((e, i) => {
                const rojo = e.riesgo === 'ROJO' || e.riesgo === 'ROJO_FALTAS'
                const ambar = e.riesgo === 'AMBAR'
                return (
                  <tr key={e.id} style={{ borderBottom:'1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding:'8px 10px', color:'#6B7280', fontFamily:'monospace' }}>{e.codigo}</td>
                    <td style={{ padding:'8px 10px', fontWeight:500 }}>{e.nombre}</td>
                    <td style={{ padding:'8px 10px', color:'#6B7280' }}>{e.seccion}</td>
                    <td style={{ padding:'8px 10px', color: e.parcial !== null ? (e.parcial >= 11 ? '#16A34A' : '#DC2626') : '#9CA3AF' }}>{e.parcial ?? '—'}</td>
                    <td style={{ padding:'8px 10px', color: e.final !== null ? (e.final >= 11 ? '#16A34A' : '#DC2626') : '#9CA3AF' }}>{e.final ?? '—'}</td>
                    <td style={{ padding:'8px 10px', color: e.practica !== null ? (e.practica >= 11 ? '#16A34A' : '#DC2626') : '#9CA3AF' }}>{e.practica ?? '—'}</td>
                    <td style={{ padding:'8px 10px', fontWeight:700, color: e.promedio !== null ? (e.promedio >= 11 ? '#16A34A' : '#DC2626') : '#9CA3AF' }}>{e.promedio ?? '—'}</td>
                    <td style={{ padding:'8px 10px', color: e.faltas >= 5 ? '#DC2626' : '#374151', fontWeight: e.faltas >= 5 ? 700 : 400 }}>{e.faltas}</td>
                    <td style={{ padding:'8px 10px' }}>
                      <span style={{
                        fontSize:'10.5px', fontWeight:600, borderRadius:'20px', padding:'2px 8px',
                        background: rojo ? '#FEF2F2' : ambar ? '#FFFBEB' : e.riesgo === 'VERDE' ? '#F0FDF4' : '#F3F4F6',
                        color:      rojo ? '#991B1B' : ambar ? '#B45309' : e.riesgo === 'VERDE' ? '#15803D' : '#6B7280',
                      }}>
                        {rojo ? '🔴 Riesgo' : ambar ? '🟡 Moderado' : e.riesgo === 'VERDE' ? '🟢 OK' : '⏳ Pendiente'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
