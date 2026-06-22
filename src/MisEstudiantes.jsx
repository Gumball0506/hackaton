import { useState } from 'react'
import { estudiantes } from './data'

function riesgoStyle(r) {
  if (r === 'ROJO')  return { pill:'#FEF2F2', pillTxt:'#991B1B', border:'#FECACA', dot:'#DC2626', txt:'Riesgo alto', bg:'#FEF2F2' }
  if (r === 'AMBAR') return { pill:'#FFFBEB', pillTxt:'#B45309', border:'#FDE68A', dot:'#D97706', txt:'Riesgo mod.', bg:'#FFFDF5' }
  return                  { pill:'#F0FDF4', pillTxt:'#15803D', border:'#BBF7D0', dot:'#16A34A', txt:'Sin riesgo',  bg:'#ffffff' }
}

function notaColor(n) {
  if (n >= 14) return '#16A34A'
  if (n >= 11) return '#D97706'
  return '#DC2626'
}

export default function MisEstudiantes({ onVerEstudiante }) {
  const [search, setSearch] = useState('')
  const filtered = estudiantes.filter(e =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.codigo.includes(search)
  )

  return (
    <div style={{ padding:'24px', animation:'fadeUp .35s ease both' }}>
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:'18px', flexWrap:'wrap', gap:'10px'
      }}>
        <div>
          <h2 style={{ fontSize:'18px', fontWeight:600 }}>Mis Estudiantes</h2>
          <p style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'2px' }}>Total: {estudiantes.length} estudiantes asignados</p>
        </div>
        <div style={{
          display:'flex', alignItems:'center', gap:'8px',
          background:'#fff', border:'1px solid #E5E7EB',
          borderRadius:'8px', padding:'0 12px', height:'38px', width:'260px'
        }}>
          <i className="ti ti-search" style={{ color:'#9CA3AF' }}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            style={{ border:'none', outline:'none', fontSize:'13px', width:'100%', background:'transparent' }}
          />
        </div>
      </div>

      <div style={{
        background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px',
        boxShadow:'0 1px 3px rgba(0,0,0,.08)', overflow:'hidden'
      }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
            <colgroup>
              <col style={{ width:'40px' }}/>
              <col style={{ width:'220px' }}/>
              <col style={{ width:'120px' }}/>
              <col style={{ width:'60px' }}/>
              <col style={{ width:'90px' }}/>
              <col style={{ width:'70px' }}/>
              <col style={{ width:'110px' }}/>
              <col style={{ width:'80px' }}/>
            </colgroup>
            <thead>
              <tr style={{ background:'#F9FAFB', fontSize:'11px', color:'#6B7280', textTransform:'uppercase', letterSpacing:'.3px' }}>
                {['#','Estudiante','Código','Ciclo','Últ. Nota','Asistencia','Estado','Acción'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:500, borderBottom:'1px solid #E5E7EB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:'32px', color:'#9CA3AF', fontSize:'13px' }}>
                  No se encontraron estudiantes.
                </td></tr>
              )}
              {filtered.map((e, i) => {
                const rs = riesgoStyle(e.riesgo)
                return (
                  <tr
                    key={e.id}
                    onClick={() => onVerEstudiante(e)}
                    style={{ background:rs.bg, cursor:'pointer', transition:'background .15s', fontSize:'13px' }}
                    onMouseEnter={ev => ev.currentTarget.style.background = '#F0F4F8'}
                    onMouseLeave={ev => ev.currentTarget.style.background = rs.bg}
                  >
                    <td style={{ padding:'11px 14px', color:'#9CA3AF', borderBottom:'1px solid #F3F4F6' }}>{i+1}</td>
                    <td style={{ padding:'11px 14px', borderBottom:'1px solid #F3F4F6' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                        <div style={{
                          width:'30px', height:'30px', borderRadius:'50%',
                          background:'#E85D04', color:'#fff', fontSize:'10px',
                          fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                        }}>{e.iniciales}</div>
                        <span style={{ fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {e.nombre}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding:'11px 14px', borderBottom:'1px solid #F3F4F6', color:'#6B7280', fontSize:'12px' }}>{e.codigo}</td>
                    <td style={{ padding:'11px 14px', borderBottom:'1px solid #F3F4F6', textAlign:'center' }}>{e.ciclo}</td>
                    <td style={{ padding:'11px 14px', borderBottom:'1px solid #F3F4F6', textAlign:'center', fontWeight:600, color:notaColor(e.ultima_nota) }}>{e.ultima_nota}</td>
                    <td style={{ padding:'11px 14px', borderBottom:'1px solid #F3F4F6', textAlign:'center', color:'#D97706', fontWeight:500 }}>71%</td>
                    <td style={{ padding:'11px 14px', borderBottom:'1px solid #F3F4F6' }}>
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
                        {rs.txt}
                      </span>
                    </td>
                    <td style={{ padding:'11px 14px', borderBottom:'1px solid #F3F4F6' }}>
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
