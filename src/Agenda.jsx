import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

const TUTOR_ID = '00000000-0000-0000-0000-000000000001'

const ESTADO_CFG = {
  pendiente:  { color:'#D97706', bg:'#FFFBEB', label:'Pendiente' },
  confirmada: { color:'#2563EB', bg:'#EFF6FF', label:'Confirmada' },
  realizada:  { color:'#16A34A', bg:'#F0FDF4', label:'Realizada'  },
  cancelada:  { color:'#DC2626', bg:'#FEF2F2', label:'Cancelada'  },
}

// Datos ficticios base para demostración
const FICTICIAS = [
  { id:'f1', estudiante_id:null, tutor_id:TUTOR_ID, fecha:'2026-06-25T09:00:00', lugar:'Consultorio Psicología – Pab. B', motivo:'Problemas de adaptación académica', estado:'confirmada', created_at:'2026-06-20T10:00:00', estudiantes:{ apellidos_y_nombres:'ALFARO GARCIA HUGO ANDRE', codigo:'2021017455', seccion:'A' } },
  { id:'f2', estudiante_id:null, tutor_id:TUTOR_ID, fecha:'2026-06-26T10:30:00', lugar:'Consultorio Psicología – Pab. B', motivo:'Seguimiento de estrés académico', estado:'pendiente', created_at:'2026-06-21T08:00:00', estudiantes:{ apellidos_y_nombres:'BERROSPI MALLMA MARICRUZ PILAR', codigo:'2020010981', seccion:'A' } },
  { id:'f3', estudiante_id:null, tutor_id:TUTOR_ID, fecha:'2026-06-27T11:00:00', lugar:'Online – Meet', motivo:'Orientación vocacional y plan de estudios', estado:'pendiente', created_at:'2026-06-21T09:00:00', estudiantes:{ apellidos_y_nombres:'CASTRO JIMENEZ MIGUEL ANGEL', codigo:'202197196', seccion:'B' } },
  { id:'f4', estudiante_id:null, tutor_id:TUTOR_ID, fecha:'2026-06-23T14:00:00', lugar:'Consultorio Psicología – Pab. A', motivo:'Ansiedad ante exámenes', estado:'realizada', created_at:'2026-06-18T07:00:00', estudiantes:{ apellidos_y_nombres:'FLORES ESPADA CHRISTIAN ARNOLD', codigo:'2021017544', seccion:'A' } },
  { id:'f5', estudiante_id:null, tutor_id:TUTOR_ID, fecha:'2026-07-01T09:30:00', lugar:'Consultorio Psicología – Pab. B', motivo:'Problemas de concentración y hábitos de estudio', estado:'pendiente', created_at:'2026-06-22T08:00:00', estudiantes:{ apellidos_y_nombres:'LAGUNA SIERRALTA ANGELLO LUCIANO', codigo:'202311395', seccion:'B' } },
  { id:'f6', estudiante_id:null, tutor_id:TUTOR_ID, fecha:'2026-07-03T15:00:00', lugar:'Online – Zoom', motivo:'Dificultades personales y familiares', estado:'pendiente', created_at:'2026-06-22T09:00:00', estudiantes:{ apellidos_y_nombres:'NIEVES CAMPOS ELIZABETH YOLANDA', codigo:'202326062', seccion:'B' } },
]

function fmtFecha(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-PE', { weekday:'short', day:'numeric', month:'short', year:'numeric' })
}
function fmtHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit' })
}

export default function Agenda({ onVerEstudiante }) {
  const [citas,    setCitas]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filtro,   setFiltro]   = useState('todas')
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ estudiante:'', fecha:'', hora:'09:00', lugar:'Consultorio Psicología – Pab. B', motivo:'' })
  const [saving,   setSaving]   = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('citas_psicologo')
        .select('*, estudiantes(apellidos_y_nombres, codigo, seccion)')
        .order('fecha', { ascending: true })
      const reales = (data || [])
      // Mezcla reales + ficticias (sin duplicar IDs reales)
      const ids = new Set(reales.map(c => c.id))
      const todas = [...reales, ...FICTICIAS.filter(f => !ids.has(f.id))]
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      setCitas(todas)
    } catch { setCitas(FICTICIAS) }
    finally  { setLoading(false) }
  }

  async function cambiarEstado(id, nuevoEstado) {
    // Si es ficticia, solo actualiza local
    if (id.startsWith('f')) {
      setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c))
      return
    }
    await supabase.from('citas_psicologo').update({ estado: nuevoEstado }).eq('id', id)
    cargar()
  }

  async function guardarCita(e) {
    e.preventDefault()
    setSaving(true)
    const fechaISO = `${form.fecha}T${form.hora}:00`
    // Busca estudiante por nombre parcial
    const { data: ests } = await supabase.from('estudiantes')
      .select('id, apellidos_y_nombres, codigo, seccion')
      .ilike('apellidos_y_nombres', `%${form.estudiante}%`).limit(1)
    const est = ests?.[0]
    if (!est) { alert('Estudiante no encontrado. Revisa el nombre.'); setSaving(false); return }

    await supabase.from('citas_psicologo').insert({
      estudiante_id: est.id, tutor_id: TUTOR_ID,
      fecha: fechaISO, lugar: form.lugar, motivo: form.motivo, estado: 'pendiente'
    })
    setForm({ estudiante:'', fecha:'', hora:'09:00', lugar:'Consultorio Psicología – Pab. B', motivo:'' })
    setShowForm(false)
    setSaving(false)
    cargar()
  }

  const hoy    = new Date()
  const filtradas = citas.filter(c => {
    if (filtro === 'todas')    return true
    if (filtro === 'proximas') return new Date(c.fecha) >= hoy && c.estado !== 'cancelada'
    return c.estado === filtro
  })

  const counts = {
    todas:     citas.length,
    proximas:  citas.filter(c => new Date(c.fecha) >= hoy && c.estado !== 'cancelada').length,
    pendiente: citas.filter(c => c.estado === 'pendiente').length,
    confirmada:citas.filter(c => c.estado === 'confirmada').length,
    realizada: citas.filter(c => c.estado === 'realizada').length,
    cancelada: citas.filter(c => c.estado === 'cancelada').length,
  }

  return (
    <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'20px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ fontWeight:700, fontSize:'18px' }}>Agenda de Citas — Psicólogo</div>
          <div style={{ fontSize:'13px', color:'#6B7280', marginTop:'2px' }}>
            Coordinación con el servicio psicológico UNFV
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display:'flex', alignItems:'center', gap:'7px',
            background:'#E85D04', color:'#fff', border:'none',
            borderRadius:'9px', padding:'10px 18px', fontWeight:600, fontSize:'13px', cursor:'pointer'
          }}
        >
          <i className="ti ti-plus"/>Nueva cita
        </button>
      </div>

      {/* Formulario nueva cita */}
      {showForm && (
        <form onSubmit={guardarCita} style={{
          background:'#fff', border:'1px solid #E85D04', borderRadius:'12px', padding:'20px',
          display:'flex', flexDirection:'column', gap:'12px'
        }}>
          <div style={{ fontWeight:600, marginBottom:'4px' }}>Registrar nueva cita</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label style={{ fontSize:'12px', color:'#6B7280', display:'block', marginBottom:'4px' }}>Nombre del estudiante</label>
              <input required value={form.estudiante} onChange={e => setForm(p => ({...p, estudiante:e.target.value}))}
                placeholder="Ej: Alfaro Garcia Hugo"
                style={{ width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'8px 10px', fontSize:'13px' }}/>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:'12px', color:'#6B7280', display:'block', marginBottom:'4px' }}>Fecha</label>
                <input required type="date" value={form.fecha} onChange={e => setForm(p => ({...p, fecha:e.target.value}))}
                  style={{ width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'8px 10px', fontSize:'13px' }}/>
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#6B7280', display:'block', marginBottom:'4px' }}>Hora</label>
                <input required type="time" value={form.hora} onChange={e => setForm(p => ({...p, hora:e.target.value}))}
                  style={{ border:'1px solid #E5E7EB', borderRadius:'8px', padding:'8px 10px', fontSize:'13px' }}/>
              </div>
            </div>
            <div>
              <label style={{ fontSize:'12px', color:'#6B7280', display:'block', marginBottom:'4px' }}>Lugar</label>
              <input value={form.lugar} onChange={e => setForm(p => ({...p, lugar:e.target.value}))}
                style={{ width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'8px 10px', fontSize:'13px' }}/>
            </div>
            <div>
              <label style={{ fontSize:'12px', color:'#6B7280', display:'block', marginBottom:'4px' }}>Motivo</label>
              <input required value={form.motivo} onChange={e => setForm(p => ({...p, motivo:e.target.value}))}
                placeholder="Describe el motivo de la cita"
                style={{ width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'8px 10px', fontSize:'13px' }}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ border:'1px solid #E5E7EB', background:'#fff', borderRadius:'8px', padding:'8px 16px', cursor:'pointer', fontSize:'13px' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ background:'#E85D04', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 18px', fontWeight:600, fontSize:'13px', cursor:'pointer' }}>
              {saving ? 'Guardando...' : 'Agendar cita'}
            </button>
          </div>
        </form>
      )}

      {/* KPIs */}
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
        {[
          { k:'todas',     label:'Total',      icon:'ti-calendar', color:'#374151' },
          { k:'proximas',  label:'Próximas',   icon:'ti-clock',    color:'#2563EB' },
          { k:'pendiente', label:'Pendientes', icon:'ti-dots',     color:'#D97706' },
          { k:'confirmada',label:'Confirmadas',icon:'ti-check',    color:'#2563EB' },
          { k:'realizada', label:'Realizadas', icon:'ti-circle-check', color:'#16A34A' },
        ].map(f => (
          <button key={f.k} onClick={() => setFiltro(f.k)} style={{
            display:'flex', alignItems:'center', gap:'8px',
            background: filtro === f.k ? '#1A1A2E' : '#fff',
            color:       filtro === f.k ? '#fff' : '#374151',
            border:'1px solid ' + (filtro === f.k ? '#1A1A2E' : '#E5E7EB'),
            borderRadius:'10px', padding:'9px 16px', cursor:'pointer', fontWeight:500, fontSize:'13px',
            transition:'all .15s'
          }}>
            <i className={`ti ${f.icon}`} style={{ color: filtro === f.k ? '#fff' : f.color }}/>
            {f.label}
            <span style={{
              background: filtro === f.k ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
              color:       filtro === f.k ? '#fff' : '#374151',
              borderRadius:'20px', padding:'1px 8px', fontSize:'11px', fontWeight:600
            }}>{counts[f.k]}</span>
          </button>
        ))}
      </div>

      {/* Lista de citas */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'40px', color:'#9CA3AF' }}>Cargando agenda...</div>
      ) : filtradas.length === 0 ? (
        <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'40px', textAlign:'center', color:'#9CA3AF' }}>
          <i className="ti ti-calendar-off" style={{ fontSize:'36px', display:'block', marginBottom:'10px' }}/>
          No hay citas con ese filtro.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {filtradas.map(c => {
            const ec = ESTADO_CFG[c.estado] || ESTADO_CFG.pendiente
            const esFutura = new Date(c.fecha) >= hoy
            return (
              <div key={c.id} style={{
                background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px',
                padding:'16px 20px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap'
              }}>
                {/* Fecha */}
                <div style={{
                  background:'#F4F6F9', borderRadius:'10px', padding:'10px 14px',
                  textAlign:'center', minWidth:'70px', flexShrink:0
                }}>
                  <div style={{ fontSize:'22px', fontWeight:700, color:'#E85D04', lineHeight:1 }}>
                    {new Date(c.fecha).getDate()}
                  </div>
                  <div style={{ fontSize:'11px', color:'#6B7280', marginTop:'2px' }}>
                    {new Date(c.fecha).toLocaleDateString('es-PE', { month:'short' }).toUpperCase()}
                  </div>
                  <div style={{ fontSize:'11px', fontWeight:600, color:'#374151' }}>
                    {fmtHora(c.fecha)}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:'180px' }}>
                  <div style={{ fontWeight:600, fontSize:'14px' }}>
                    {c.estudiantes?.apellidos_y_nombres ?? 'Estudiante'}
                  </div>
                  <div style={{ fontSize:'12px', color:'#6B7280', marginTop:'2px' }}>
                    <i className="ti ti-id-badge" style={{ marginRight:'4px' }}/>
                    {c.estudiantes?.codigo} · Sección {c.estudiantes?.seccion}
                  </div>
                  <div style={{ fontSize:'12.5px', color:'#374151', marginTop:'6px' }}>
                    <i className="ti ti-file-text" style={{ color:'#9CA3AF', marginRight:'5px' }}/>
                    {c.motivo}
                  </div>
                  <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'4px' }}>
                    <i className="ti ti-map-pin" style={{ marginRight:'4px' }}/>
                    {c.lugar || '—'}
                  </div>
                </div>

                {/* Estado + acciones */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
                  <span style={{
                    background: ec.bg, color: ec.color, fontWeight:600,
                    fontSize:'11.5px', borderRadius:'20px', padding:'4px 12px'
                  }}>{ec.label}</span>
                  {esFutura && c.estado === 'pendiente' && (
                    <button
                      onClick={() => cambiarEstado(c.id, 'confirmada')}
                      style={{
                        border:'1px solid #2563EB', color:'#2563EB', background:'#EFF6FF',
                        borderRadius:'7px', padding:'5px 12px', fontSize:'12px', cursor:'pointer', fontWeight:500
                      }}
                    ><i className="ti ti-check" style={{ marginRight:'4px' }}/>Confirmar</button>
                  )}
                  {c.estado === 'confirmada' && esFutura && (
                    <button
                      onClick={() => cambiarEstado(c.id, 'realizada')}
                      style={{
                        border:'1px solid #16A34A', color:'#16A34A', background:'#F0FDF4',
                        borderRadius:'7px', padding:'5px 12px', fontSize:'12px', cursor:'pointer', fontWeight:500
                      }}
                    ><i className="ti ti-check-check" style={{ marginRight:'4px' }}/>Marcar realizada</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
