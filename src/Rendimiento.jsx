import { useMemo } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Tooltip, Legend, Title
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Title)

function riesgoStyle(r) {
  if (r === 'ROJO' || r === 'ROJO_FALTAS') return { dot:'#DC2626', txt:'#991B1B', bg:'#FEF2F2' }
  if (r === 'AMBAR') return { dot:'#D97706', txt:'#B45309', bg:'#FFFBEB' }
  if (r === 'VERDE') return { dot:'#16A34A', txt:'#15803D', bg:'#F0FDF4' }
  return { dot:'#9CA3AF', txt:'#6B7280', bg:'#F9FAFB' }
}

function KCard({ label, value, sub, color = '#374151' }) {
  return (
    <div style={{
      background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px',
      padding:'18px 20px', flex:1, minWidth:'140px'
    }}>
      <div style={{ fontSize:'12px', color:'#6B7280', marginBottom:'6px' }}>{label}</div>
      <div style={{ fontSize:'26px', fontWeight:700, color }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'4px' }}>{sub}</div>}
    </div>
  )
}

export default function Rendimiento({ estudiantes = [], onVerEstudiante }) {
  const conNota  = estudiantes.filter(e => e.promedio !== null)
  const sinNota  = estudiantes.filter(e => e.promedio === null)
  const secA     = conNota.filter(e => e.seccion === 'A')
  const secB     = conNota.filter(e => e.seccion === 'B')

  const avg = arr => arr.length ? (arr.reduce((s, e) => s + (e.promedio ?? 0), 0) / arr.length).toFixed(1) : null
  const avgAll = avg(conNota)
  const avgA   = avg(secA)
  const avgB   = avg(secB)

  const aprobados   = conNota.filter(e => e.promedio >= 11).length
  const desaprobados= conNota.filter(e => e.promedio < 11).length

  // Distribución de notas por rango
  const rangos = ['0–6','7–10','11–12','13–14','15–17','18–20']
  const limits = [[0,6],[7,10],[11,12],[13,14],[15,17],[18,20]]
  const dist   = limits.map(([lo, hi]) =>
    conNota.filter(e => e.promedio >= lo && e.promedio <= hi).length
  )
  const distA  = limits.map(([lo,hi]) => secA.filter(e => e.promedio >= lo && e.promedio <= hi).length)
  const distB  = limits.map(([lo,hi]) => secB.filter(e => e.promedio >= lo && e.promedio <= hi).length)

  const barData = {
    labels: rangos,
    datasets: [
      { label:'Sección A', data: distA, backgroundColor:'#E85D04', borderRadius:6 },
      { label:'Sección B', data: distB, backgroundColor:'#1A1A2E', borderRadius:6 },
    ]
  }
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position:'top' } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  }

  // Scatter: parcial vs final (datos ficticios si no hay reales)
  const MOCK_TREND = [14,13,12,15,11,10,13,14,12,11,13,15,14,12,10,11]
  const trendLabels = Array.from({ length: 16 }, (_, i) => `Est. ${i + 1}`)
  const trendData = {
    labels: trendLabels,
    datasets: [{
      label: 'Promedio estimado por orden',
      data: conNota.length >= 3
        ? conNota.slice(0, 16).map(e => e.promedio)
        : MOCK_TREND,
      borderColor: '#E85D04', backgroundColor: 'rgba(232,93,4,0.08)',
      tension: 0.35, fill: true, pointRadius: 4, pointHoverRadius: 6,
    }]
  }
  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 20 } }
  }

  const top10 = useMemo(() =>
    [...conNota].sort((a, b) => b.promedio - a.promedio).slice(0, 10),
    [conNota]
  )

  return (
    <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'20px' }}>
      {/* KPIs */}
      <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
        <KCard label="Total estudiantes"    value={estudiantes.length} sub="Base de Datos II" />
        <KCard label="Con nota registrada"  value={conNota.length}     sub={`${sinNota.length} pendientes`} />
        <KCard label="Promedio general"     value={avgAll ? `${avgAll}/20` : '—'} color='#E85D04' />
        <KCard label="Promedio Sección A"   value={avgA ? `${avgA}/20` : '—'}  color='#1A1A2E' />
        <KCard label="Promedio Sección B"   value={avgB ? `${avgB}/20` : '—'}  color='#1A1A2E' />
        <KCard label="Aprobados"            value={aprobados}           color='#16A34A' sub={`${desaprobados} desaprobados`} />
      </div>

      {/* Gráficas */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px' }}>
        <div style={{
          background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'20px'
        }}>
          <div style={{ fontWeight:600, marginBottom:'4px' }}>Distribución de notas por sección</div>
          <div style={{ fontSize:'12px', color:'#9CA3AF', marginBottom:'16px' }}>Cantidad de estudiantes por rango</div>
          <div style={{ height:'220px' }}>
            {conNota.length > 0
              ? <Bar data={barData} options={barOpts}/>
              : <NoData/>
            }
          </div>
        </div>

        <div style={{
          background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'20px'
        }}>
          <div style={{ fontWeight:600, marginBottom:'4px' }}>Tendencia de rendimiento</div>
          <div style={{ fontSize:'12px', color:'#9CA3AF', marginBottom:'16px' }}>
            Promedio por estudiante (orden de lista)
            {conNota.length < 3 && <span style={{ color:'#D97706' }}> · datos de muestra</span>}
          </div>
          <div style={{ height:'220px' }}>
            <Line data={trendData} options={lineOpts}/>
          </div>
        </div>
      </div>

      {/* Top 10 */}
      <div style={{
        background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'20px'
      }}>
        <div style={{ fontWeight:600, marginBottom:'16px' }}>
          Top 10 — Mejor rendimiento
          {conNota.length === 0 && <span style={{ fontWeight:400, fontSize:'12px', color:'#9CA3AF', marginLeft:'8px' }}>sin notas registradas aún</span>}
        </div>
        {top10.length > 0 ? (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
            <thead>
              <tr style={{ borderBottom:'2px solid #F3F4F6' }}>
                {['#','Estudiante','Sec.','Código','Parcial','Final','Práctica','Promedio','Estado'].map(h => (
                  <th key={h} style={{ padding:'8px 10px', textAlign:'left', color:'#6B7280', fontWeight:500, fontSize:'11.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top10.map((e, i) => {
                const s = riesgoStyle(e.riesgo)
                return (
                  <tr key={e.id} style={{ borderBottom:'1px solid #F3F4F6' }}
                    onMouseEnter={ev => ev.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding:'9px 10px', fontWeight:600, color:'#E85D04' }}>{i + 1}</td>
                    <td style={{ padding:'9px 10px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <div style={{
                          width:'28px', height:'28px', borderRadius:'50%', background:'#1A1A2E',
                          color:'#fff', fontSize:'10px', fontWeight:700, flexShrink:0,
                          display:'flex', alignItems:'center', justifyContent:'center'
                        }}>{e.iniciales}</div>
                        <span style={{ fontWeight:500 }}>{e.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding:'9px 10px', color:'#6B7280' }}>{e.seccion}</td>
                    <td style={{ padding:'9px 10px', color:'#6B7280', fontSize:'12px' }}>{e.codigo}</td>
                    <td style={{ padding:'9px 10px', color: e.parcial >= 11 ? '#16A34A' : '#DC2626' }}>{e.parcial ?? '—'}</td>
                    <td style={{ padding:'9px 10px', color: e.final >= 11 ? '#16A34A' : '#DC2626' }}>{e.final ?? '—'}</td>
                    <td style={{ padding:'9px 10px', color: e.practica >= 11 ? '#16A34A' : '#DC2626' }}>{e.practica ?? '—'}</td>
                    <td style={{ padding:'9px 10px', fontWeight:700, color: e.promedio >= 11 ? '#16A34A' : '#DC2626' }}>{e.promedio ?? '—'}</td>
                    <td style={{ padding:'9px 10px' }}>
                      <span style={{
                        background: s.bg, color: s.txt, fontSize:'10.5px', fontWeight:600,
                        borderRadius:'20px', padding:'3px 9px'
                      }}>{e.riesgo === 'VERDE' ? 'Sin riesgo' : e.riesgo === 'AMBAR' ? 'Moderado' : e.riesgo === 'ROJO' ? 'Alto' : 'Pendiente'}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <NoData msg="Ingresa notas desde el perfil de cada estudiante para ver el ranking."/>
        )}
      </div>

      {/* Sección A vs B */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px' }}>
        {['A','B'].map(sec => {
          const arr = estudiantes.filter(e => e.seccion === sec)
          const cn  = arr.filter(e => e.promedio !== null)
          const pr  = avg(cn)
          const ap  = cn.filter(e => e.promedio >= 11).length
          const de  = cn.filter(e => e.promedio < 11).length
          const ro  = arr.filter(e => e.riesgo === 'ROJO' || e.riesgo === 'ROJO_FALTAS').length
          return (
            <div key={sec} style={{
              background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'20px'
            }}>
              <div style={{ fontWeight:600, fontSize:'15px', marginBottom:'14px' }}>
                Sección {sec} — {arr.length} estudiantes
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[
                  { label:'Promedio sección',  value: pr ? `${pr}/20` : '—' },
                  { label:'Aprobados',          value: cn.length ? `${ap}/${cn.length}` : '—', color:'#16A34A' },
                  { label:'Desaprobados',       value: cn.length ? `${de}/${cn.length}` : '—', color: de > 0 ? '#DC2626' : '#374151' },
                  { label:'En riesgo alto',     value: ro > 0 ? ro : '0', color: ro > 0 ? '#DC2626' : '#374151' },
                  { label:'Sin nota aún',       value: arr.length - cn.length },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid #F3F4F6' }}>
                    <span style={{ fontSize:'13px', color:'#6B7280' }}>{row.label}</span>
                    <span style={{ fontSize:'14px', fontWeight:600, color: row.color || '#374151' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function NoData({ msg = 'Sin datos suficientes para mostrar la gráfica.' }) {
  return (
    <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'8px', color:'#9CA3AF' }}>
      <i className="ti ti-chart-bar" style={{ fontSize:'32px' }}/>
      <span style={{ fontSize:'12px', textAlign:'center' }}>{msg}</span>
    </div>
  )
}
