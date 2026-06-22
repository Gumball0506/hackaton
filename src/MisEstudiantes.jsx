import { useState } from 'react'

function riesgoStyle(r) {
  if (r === 'ROJO' || r === 'ROJO_FALTAS') return { pill:'#FEF2F2', pillTxt:'#991B1B', border:'#FECACA', dot:'#DC2626', txt: r==='ROJO_FALTAS'?'Faltas excesivas':'Riesgo alto', bg:'#FEF2F2' }
  if (r === 'AMBAR') return { pill:'#FFFBEB', pillTxt:'#B45309', border:'#FDE68A', dot:'#D97706', txt:'Riesgo mod.', bg:'#FFFDF5' }
  if (r === 'VERDE') return { pill:'#F0FDF4', pillTxt:'#15803D', border:'#BBF7D0', dot:'#16A34A', txt:'Sin riesgo', bg:'#ffffff' }
  return { pill:'#F4F6F9', pillTxt:'#6B7280', border:'#E5E7EB', dot:'#9CA3AF', txt:'Pendiente', bg:'#f9fafb' }
}

function notaColor(n) {
  if (n === null) return '#9CA3AF'
  if (n >= 14) return '#16A34A'
  if (n >= 11) return '#D97706'
  return '#DC2626'
}

export default function MisEstudiantes({ estudiantes, onVerEstudiante }) {
  const [search,  setSearch]  = useState('')
  const [seccion, setSeccion] = useState('Todas')

  const filtered = estudiantes.filter(e => {
    const matchSearch = e.nombre.toLowerCase().includes(search.toLowerCase()) || e.codigo.includes(search)
    const matchSec    = seccion === 'Todas' || e.seccion === seccion
    return matchSearch && matchSec
  })

  const secA = filtered.filter(e => e.seccion === 'A').length
  const secB = filtered.filter(e => e.seccion === 'B').length

  return (
    <div style={{ padding:'24px', animation:'fadeUp .35s ease both' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
        <div>
          <h2 style={{ fontSize:'18px', fontWeight:600 }}>Mis Estudiantes</h2>
          <p style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>
            Base de Datos II · {estudiantes.length} estudiantes · Sección A ({secA > 0 ? estudiantes.filter(e=>e.seccion==='A').length : 31}) / B ({secB > 0 ? estudiantes.filter(e=>e.seccion==='B').length : 30})
          </p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {['Todas','A','B'].map(s => (
            <button key={s} onClick={() => setSeccion(s)} style={{
              border:'1px solid #E5E7EB', borderRadius:'8px', height:'36px', padding:'0 14px',
              fontSize:'13px', fontWeight:500, cursor:'pointer',
              background: seccion === s ? '#E85D04' : '#fff',
              color: seccion === s ? '#fff' : '#374151'
            }}>Sección {s}</button>
          ))}
          <div style={{
            display:'flex', alignItems:'center', gap:'8px', background:'#fff',
            border:'1px solid #E5E7EB', borderRadius:'8px', padding:'0 12px', height:'36px', width:'240px'
          }}>
            <i className="ti ti-search" style={{ color:'#9CA3AF' }}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar nombre o código..."
              style={{ border:'none', outline:'none', fontSize:'13px', width:'100%', background:'transparent' }}
            />
          </div>
        </div>
      </div>

      <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', boxShadow:'0 1px 3px rgba(0,0,0,.08)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
            <colgroup>
              <col style={{ width:'40px' }}/>
              <col style={{ width:'200px' }}/>
              <col style={{ width:'55px' }}/>
              <col style={{ width:'55px' }}/>
              <col style={{ width:'115px' }}/>
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
                {['#','Estudiante','Sec.','Grp.','Código','Parcial','Final','Práctica','Promedio','Faltas','Estado','Acción'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:500, borderBottom:'1px solid #E5E7EB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={12} style={{ textAlign:'center', padding:'32px', color:'#9CA3AF', fontSize:'13px' }}>
                  No se encontraron estudiantes.
                </td></tr>
              )}
              {filtered.map((e, i) => {
                const rs = riesgoStyle(e.riesgo)
                return (
                  <tr key={e.id} onClick={() => onVerEstudiante(e)}
                    style={{ background:rs.bg, cursor:'pointer', transition:'background .15s', fontSize:'13px' }}
                    onMouseEnter={ev => ev.currentTarget.style.background='#F0F4F8'}
                    onMouseLeave={ev => ev.currentTarget.style.background=rs.bg}
                  >
                    <td style={{ padding:'10px 12px', color:'#9CA3AF', borderBottom:'1px solid #F3F4F6' }}>{i+1}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <div style={{
                          width:'28px', height:'28px', borderRadius:'50%', background:'#E85D04',
                          color:'#fff', fontSize:'10px', fontWeight:600,
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                        }}>{e.iniciales}</div>
                        <span style={{ fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontSize:'12.5px' }}>{e.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:600 }}>{e.seccion}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', color:'#6B7280' }}>{e.grupo ?? '—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', color:'#6B7280', fontSize:'11.5px' }}>{e.codigo}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:600, color:notaColor(e.parcial) }}>{e.parcial ?? '—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:600, color:notaColor(e.final) }}>{e.final ?? '—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:600, color:notaColor(e.practica) }}>{e.practica ?? '—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:700, color:notaColor(e.promedio) }}>{e.promedio ?? '—'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6', textAlign:'center', color:e.faltas>=5?'#DC2626':e.faltas>=3?'#D97706':'#111827', fontWeight:e.faltas>=5?700:400 }}>
                      {e.faltas}/16
                    </td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6' }}>
                      <span style={{ fontSize:'10.5px', fontWeight:600, background:rs.pill, color:rs.pillTxt, border:`1px solid ${rs.border}`, borderRadius:'20px', padding:'3px 9px', whiteSpace:'nowrap' }}>
                        <span style={{ display:'inline-block', width:'6px', height:'6px', borderRadius:'50%', background:rs.dot, marginRight:'5px' }}/>
                        {rs.txt}
                      </span>
                    </td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #F3F4F6' }}>
                      <button onClick={ev => { ev.stopPropagation(); onVerEstudiante(e) }}
                        style={{ border:'1px solid #E85D04', color:'#E85D04', background:'#fff', borderRadius:'6px', padding:'5px 11px', fontSize:'12px', fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'4px' }}
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
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
