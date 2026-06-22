import { estudiantes } from './data'

const alertas = estudiantes
  .filter(e => e.riesgo === 'ROJO' || e.riesgo === 'AMBAR')
  .sort((a, b) => {
    const order = { ROJO:0, AMBAR:1, VERDE:2 }
    return order[a.riesgo] - order[b.riesgo] || a.desv - b.desv
  })

function riesgoStyle(r) {
  if (r === 'ROJO')  return { pill:'#FEF2F2', pillTxt:'#991B1B', border:'#FECACA', dot:'#DC2626', label:'Riesgo alto',    bg:'#FEF2F2', diag:'Nota reprobatoria — requiere intervención inmediata' }
  return                  { pill:'#FFFBEB', pillTxt:'#B45309', border:'#FDE68A', dot:'#D97706', label:'Riesgo moderado', bg:'#FFFDF5', diag:'Caída significativa respecto a línea base del alumno' }
}

export default function Alertas({ onVerEstudiante }) {
  return (
    <div style={{ padding:'24px', animation:'fadeUp .35s ease both' }}>
      <div style={{ marginBottom:'18px' }}>
        <h2 style={{ fontSize:'18px', fontWeight:600 }}>Alertas de Riesgo</h2>
        <p style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>
          {alertas.length} estudiantes requieren atención — ordenados por urgencia
        </p>
      </div>

      {/* Banner resumen */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'
      }}>
        {[
          { label:'Riesgo alto (Rojo)',    count: alertas.filter(e=>e.riesgo==='ROJO').length,  color:'#DC2626', bg:'#FEF2F2', border:'#FECACA', icon:'ti-alert-circle' },
          { label:'Riesgo moderado (Ámbar)', count: alertas.filter(e=>e.riesgo==='AMBAR').length, color:'#D97706', bg:'#FFFBEB', border:'#FDE68A', icon:'ti-alert-triangle' },
        ].map(b => (
          <div key={b.label} style={{
            background:b.bg, border:`1px solid ${b.border}`, borderRadius:'10px',
            padding:'16px 20px', display:'flex', alignItems:'center', gap:'16px',
            boxShadow:'0 1px 3px rgba(0,0,0,.06)'
          }}>
            <i className={`ti ${b.icon}`} style={{ fontSize:'28px', color:b.color }}/>
            <div>
              <div style={{ fontSize:'28px', fontWeight:700, color:b.color, lineHeight:1 }}>{b.count}</div>
              <div style={{ fontSize:'12.5px', color:b.color, marginTop:'3px', fontWeight:500 }}>{b.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
        boxShadow:'0 1px 3px rgba(0,0,0,.08)', overflow:'hidden'
      }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
            <colgroup>
              <col style={{ width:'220px' }}/>
              <col style={{ width:'115px' }}/>
              <col style={{ width:'60px' }}/>
              <col style={{ width:'85px' }}/>
              <col style={{ width:'70px' }}/>
              <col style={{ width:'115px' }}/>
              <col style={{ width:'1fr' }}/>
              <col style={{ width:'80px' }}/>
            </colgroup>
            <thead>
              <tr style={{ background:'#F9FAFB', fontSize:'11px', color:'#6B7280', textTransform:'uppercase', letterSpacing:'.3px' }}>
                {['Estudiante','Código','Ciclo','Últ. Nota','Desv.','Estado','Diagnóstico','Acción'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:500, borderBottom:'1px solid #E5E7EB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alertas.map(e => {
                const rs = riesgoStyle(e.riesgo)
                return (
                  <tr
                    key={e.id}
                    onClick={() => onVerEstudiante(e)}
                    style={{ background:rs.bg, cursor:'pointer', transition:'background .15s', fontSize:'13px' }}
                    onMouseEnter={ev => ev.currentTarget.style.background='#F0F4F8'}
                    onMouseLeave={ev => ev.currentTarget.style.background=rs.bg}
                  >
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid #F3F4F6' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <div style={{
                          width:'28px', height:'28px', borderRadius:'50%',
                          background: e.riesgo==='ROJO' ? '#DC2626' : '#D97706',
                          color:'#fff', fontSize:'10px', fontWeight:600,
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                        }}>{e.iniciales}</div>
                        <span style={{ fontWeight:500 }}>{e.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid #F3F4F6', color:'#6B7280', fontSize:'12px' }}>{e.codigo}</td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid #F3F4F6', textAlign:'center' }}>{e.ciclo}</td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:700,
                      color: e.ultima_nota < 11 ? '#DC2626' : '#D97706' }}>
                      {e.ultima_nota}
                    </td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:500, color:'#DC2626' }}>
                      {e.desv}
                    </td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid #F3F4F6' }}>
                      <span style={{
                        fontSize:'11px', fontWeight:600,
                        background:rs.pill, color:rs.pillTxt,
                        border:`1px solid ${rs.border}`,
                        borderRadius:'20px', padding:'3px 10px', whiteSpace:'nowrap'
                      }}>
                        <span style={{
                          display:'inline-block', width:'6px', height:'6px',
                          borderRadius:'50%', background:rs.dot, marginRight:'5px'
                        }}/>
                        {rs.label}
                      </span>
                    </td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid #F3F4F6', fontSize:'12px', color:'#6B7280' }}>
                      {rs.diag}
                    </td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid #F3F4F6' }}>
                      <button
                        onClick={ev => { ev.stopPropagation(); onVerEstudiante(e) }}
                        style={{
                          border:'1px solid #E85D04', color:'#E85D04',
                          background:'#fff', borderRadius:'6px',
                          padding:'5px 12px', fontSize:'12px', fontWeight:600,
                          cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'4px'
                        }}
                        onMouseEnter={ev => ev.currentTarget.style.background='#FFF0E8'}
                        onMouseLeave={ev => ev.currentTarget.style.background='#fff'}
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
