import { useState } from 'react'
import { supabase } from './lib/supabase'

const TUTOR_ID = '00000000-0000-0000-0000-000000000001'

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width:'42px', height:'24px', borderRadius:'12px', border:'none', cursor:'pointer',
      background: value ? '#E85D04' : '#D1D5DB', position:'relative', transition:'background .2s'
    }}>
      <span style={{
        position:'absolute', top:'3px', left: value ? '21px' : '3px',
        width:'18px', height:'18px', background:'#fff', borderRadius:'50%', transition:'left .2s'
      }}/>
    </button>
  )
}

function Card({ title, icon, children }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'22px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:600, fontSize:'15px', marginBottom:'18px' }}>
        <i className={`ti ${icon}`} style={{ color:'#E85D04' }}/>{title}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:'14px' }}>
      <label style={{ display:'block', fontSize:'12px', color:'#6B7280', fontWeight:500, marginBottom:'5px' }}>{label}</label>
      {children}
    </div>
  )
}

const INPUT = { width:'100%', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'9px 12px', fontSize:'13px', outline:'none' }

export default function Configuracion() {
  const [perfil, setPerfil] = useState({
    nombre:  'Mg. Jorge Mendoza Quispe',
    email:   'jorge.mendoza@unfv.edu.pe',
    codigo:  'DOC-2024-0847',
    escuela: 'Ingeniería Electrónica e Informática',
    cargo:   'Docente Tiempo Completo',
    telefono:'(01) 748-0888 Anexo 5021',
  })
  const [curso, setCurso] = useState({
    nombre:  'Base de Datos II',
    ciclo:   'V Ciclo',
    periodo: '2026-I',
    sesiones:'16',
    seccion: 'A y B',
    aula:    'Laboratorio de Informática 3 — Pab. C',
    horario: 'Lunes y Miércoles 10:00–12:00',
  })
  const [notif, setNotif] = useState({
    alertas_riesgo:   true,
    nuevas_citas:      true,
    mensajes_est:      true,
    reporte_semanal:   false,
    email_resumen:     true,
  })
  const [saved, setSaved]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState({ actual:'', nueva:'', confirmar:'' })
  const [pwMsg,  setPwMsg]  = useState('')

  async function guardar(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('tutores').update({
      nombre_completo: perfil.nombre,
      email: perfil.email,
      codigo: perfil.codigo,
    }).eq('id', TUTOR_ID)
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function cambiarPassword(e) {
    e.preventDefault()
    if (pwForm.nueva !== pwForm.confirmar) { setPwMsg('Las contraseñas no coinciden.'); return }
    if (pwForm.nueva.length < 8) { setPwMsg('Mínimo 8 caracteres.'); return }
    const { error } = await supabase.auth.updateUser({ password: pwForm.nueva })
    if (error) { setPwMsg('Error: ' + error.message); return }
    setPwMsg('Contraseña actualizada correctamente.')
    setPwForm({ actual:'', nueva:'', confirmar:'' })
    setTimeout(() => setPwMsg(''), 3000)
  }

  return (
    <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'20px', maxWidth:'900px' }}>
      {/* Perfil tutor */}
      <form onSubmit={guardar}>
        <Card title="Perfil del Tutor" icon="ti-user-circle">
          <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'20px', padding:'16px', background:'#F9FAFB', borderRadius:'10px' }}>
            <div style={{
              width:'64px', height:'64px', borderRadius:'50%', background:'#E85D04',
              color:'#fff', fontWeight:700, fontSize:'22px',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
            }}>JM</div>
            <div>
              <div style={{ fontWeight:600, fontSize:'15px' }}>{perfil.nombre}</div>
              <div style={{ fontSize:'13px', color:'#6B7280' }}>{perfil.email}</div>
              <div style={{ fontSize:'12px', color:'#9CA3AF', marginTop:'3px' }}>{perfil.cargo}</div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
            <Field label="Nombre completo">
              <input value={perfil.nombre} onChange={e => setPerfil(p => ({...p, nombre:e.target.value}))} style={INPUT}/>
            </Field>
            <Field label="Correo institucional">
              <input value={perfil.email} onChange={e => setPerfil(p => ({...p, email:e.target.value}))} style={INPUT}/>
            </Field>
            <Field label="Código docente">
              <input value={perfil.codigo} onChange={e => setPerfil(p => ({...p, codigo:e.target.value}))} style={INPUT}/>
            </Field>
            <Field label="Escuela / Facultad">
              <input value={perfil.escuela} onChange={e => setPerfil(p => ({...p, escuela:e.target.value}))} style={INPUT}/>
            </Field>
            <Field label="Cargo">
              <input value={perfil.cargo} onChange={e => setPerfil(p => ({...p, cargo:e.target.value}))} style={INPUT}/>
            </Field>
            <Field label="Teléfono / Interno">
              <input value={perfil.telefono} onChange={e => setPerfil(p => ({...p, telefono:e.target.value}))} style={INPUT}/>
            </Field>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'6px' }}>
            {saved && (
              <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#16A34A', fontSize:'13px', fontWeight:500 }}>
                <i className="ti ti-circle-check"/>Cambios guardados
              </div>
            )}
            <button type="submit" disabled={saving} style={{
              background:'#E85D04', color:'#fff', border:'none', borderRadius:'9px',
              padding:'10px 22px', fontWeight:600, fontSize:'13px', cursor:'pointer'
            }}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </Card>
      </form>

      {/* Información del curso */}
      <Card title="Información del Curso" icon="ti-book">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
          {[
            ['Curso',        curso.nombre,   'nombre'],
            ['Ciclo',        curso.ciclo,    'ciclo'],
            ['Período',      curso.periodo,  'periodo'],
            ['Secciones',    curso.seccion,  'seccion'],
            ['Total sesiones',curso.sesiones,'sesiones'],
            ['Aula',         curso.aula,     'aula'],
            ['Horario',      curso.horario,  'horario'],
          ].map(([label, val, key]) => (
            <Field key={key} label={label}>
              <input
                value={val}
                onChange={e => setCurso(p => ({...p, [key]:e.target.value}))}
                style={{ ...INPUT, background:'#F9FAFB', color:'#374151' }}
                readOnly={key === 'nombre' || key === 'ciclo'}
              />
            </Field>
          ))}
        </div>
      </Card>

      {/* Notificaciones */}
      <Card title="Preferencias de Notificaciones" icon="ti-bell">
        {[
          { k:'alertas_riesgo',  label:'Alertas de riesgo académico',    sub:'Aviso cuando un estudiante entra en zona de riesgo' },
          { k:'nuevas_citas',    label:'Nuevas citas de psicología',      sub:'Notificación al confirmar o registrar citas' },
          { k:'mensajes_est',    label:'Mensajes de estudiantes',         sub:'Aviso cuando un estudiante envía un mensaje' },
          { k:'reporte_semanal', label:'Reporte semanal automático',      sub:'Resumen de actividad cada semana' },
          { k:'email_resumen',   label:'Resumen por correo electrónico',  sub:'Envío a jorge.mendoza@unfv.edu.pe' },
        ].map(({ k, label, sub }) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #F3F4F6' }}>
            <div>
              <div style={{ fontSize:'13px', fontWeight:500 }}>{label}</div>
              <div style={{ fontSize:'12px', color:'#9CA3AF' }}>{sub}</div>
            </div>
            <Toggle value={notif[k]} onChange={v => setNotif(p => ({...p, [k]:v}))}/>
          </div>
        ))}
      </Card>

      {/* Cambiar contraseña */}
      <form onSubmit={cambiarPassword}>
        <Card title="Seguridad — Cambiar Contraseña" icon="ti-lock">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 16px' }}>
            <Field label="Contraseña actual">
              <input type="password" value={pwForm.actual} onChange={e => setPwForm(p => ({...p, actual:e.target.value}))} style={INPUT}/>
            </Field>
            <Field label="Nueva contraseña">
              <input type="password" value={pwForm.nueva} onChange={e => setPwForm(p => ({...p, nueva:e.target.value}))} style={INPUT}/>
            </Field>
            <Field label="Confirmar nueva">
              <input type="password" value={pwForm.confirmar} onChange={e => setPwForm(p => ({...p, confirmar:e.target.value}))} style={INPUT}/>
            </Field>
          </div>
          {pwMsg && (
            <div style={{ fontSize:'12.5px', color: pwMsg.includes('correcta') ? '#16A34A' : '#DC2626', marginBottom:'10px' }}>
              {pwMsg}
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button type="submit" style={{
              background:'#1A1A2E', color:'#fff', border:'none', borderRadius:'9px',
              padding:'10px 22px', fontWeight:600, fontSize:'13px', cursor:'pointer'
            }}>Actualizar contraseña</button>
          </div>
        </Card>
      </form>

      {/* Acerca de */}
      <Card title="Acerca de E-Tutor UNFV" icon="ti-info-circle">
        <div style={{ display:'flex', flexDirection:'column', gap:'8px', fontSize:'13px', color:'#6B7280' }}>
          {[
            ['Versión',         'E-Tutor UNFV v1.0'],
            ['Hackathon',       'OCIDE 2026 — Categoría: Innovación Educativa'],
            ['Universidad',     'Universidad Nacional Federico Villarreal'],
            ['Dependencia',     'VRINI — Vicerrectorado de Investigación e Innovación'],
            ['Tecnología',      'React 18 + Vite 6 + Supabase (PostgreSQL)'],
            ['Desarrolladores', 'Equipo E-Tutor · 2026'],
          ].map(([k, v]) => (
            <div key={k} style={{ display:'flex', gap:'16px', padding:'6px 0', borderBottom:'1px solid #F3F4F6' }}>
              <span style={{ minWidth:'130px', fontWeight:500, color:'#374151' }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
