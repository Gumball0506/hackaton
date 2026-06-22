import { useState } from 'react'
import Login          from './Login'
import Sidebar        from './Sidebar'
import Topbar         from './Topbar'
import Dashboard      from './Dashboard'
import MisEstudiantes from './MisEstudiantes'
import Alertas        from './Alertas'
import Perfil         from './Perfil'
import Rendimiento    from './Rendimiento'
import Agenda         from './Agenda'
import Reportes       from './Reportes'
import Configuracion  from './Configuracion'
import Chatbot        from './Chatbot'
import { getEstudiantes } from './lib/queries'

const TITLES = {
  dashboard:     { title:'Panel general',         breadcrumb:'E-Tutor / Tutor / Panel' },
  estudiantes:   { title:'Mis Estudiantes',       breadcrumb:'E-Tutor / Tutor / Mis Estudiantes' },
  alertas:       { title:'Alertas de Riesgo',     breadcrumb:'E-Tutor / Tutor / Alertas' },
  perfil:        { title:'Perfil del Estudiante', breadcrumb:'E-Tutor / Tutor / Mis Estudiantes / Perfil' },
  chatbot:       { title:'Asistente IA',           breadcrumb:'E-Tutor / Tutor / Asistente IA' },
  rendimiento:   { title:'Rendimiento Académico', breadcrumb:'E-Tutor / Tutor / Rendimiento' },
  agenda:        { title:'Agenda — Psicólogo',    breadcrumb:'E-Tutor / Tutor / Agenda' },
  reportes:      { title:'Reportes y Estadísticas',breadcrumb:'E-Tutor / Tutor / Reportes' },
  configuracion: { title:'Configuración',         breadcrumb:'E-Tutor / Tutor / Configuración' },
}

export default function App() {
  const [screen,     setScreen]     = useState('login')
  const [view,       setView]       = useState('dashboard')
  const [prevView,   setPrevView]   = useState('dashboard')
  const [estudiante, setEstudiante] = useState(null)
  const [tutor,       setTutor]       = useState(null)
  const [estudiantes, setEstudiantes] = useState([])
  const [loading,    setLoading]    = useState(false)

  async function cargarEstudiantes() {
    setLoading(true)
    try {
      const data = await getEstudiantes()
      setEstudiantes(data)
    } catch (err) {
      console.error('Error cargando estudiantes:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleLogin(user, tutorData) {
    setTutor(tutorData)
    setScreen('app')
    cargarEstudiantes()
  }

  async function handleLogout() {
    await import('./lib/supabase').then(m => m.supabase.auth.signOut())
    setScreen('login')
    setEstudiantes([])
    setTutor(null)
  }

  function handleNav(v) { setView(v); setEstudiante(null) }

  function handleVerEstudiante(e) {
    setPrevView(view)
    setEstudiante(e)
    setView('perfil')
  }

  function handleBack() {
    setView(prevView)
    setEstudiante(null)
  }

  function refreshEstudiantes() { cargarEstudiantes() }

  if (screen === 'login') return <Login onLogin={handleLogin}/>

  const isPerfil = view === 'perfil'
  const meta     = TITLES[view] || TITLES.dashboard

  return (
    <div style={{ display:'flex', minHeight:'100vh', width:'100%' }}>
      <Sidebar view={view} onNav={handleNav} onLogout={handleLogout} estudiantes={estudiantes}/>
      <main style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', background:'#F4F6F9' }}>
        <Topbar
          title={meta.title}
          breadcrumb={meta.breadcrumb}
          showBack={isPerfil}
          onBack={handleBack}
        />
        <div style={{ flex:1, overflowY:'auto' }}>
          {loading && (
            <div style={{
              position:'fixed', top:'56px', left:'220px', right:0, bottom:0,
              background:'rgba(244,246,249,0.8)', display:'flex', alignItems:'center',
              justifyContent:'center', zIndex:50, flexDirection:'column', gap:'12px'
            }}>
              <div style={{
                width:'40px', height:'40px', border:'3px solid #E5E7EB',
                borderTopColor:'#E85D04', borderRadius:'50%',
                animation:'spin 0.7s linear infinite'
              }}/>
              <span style={{ fontSize:'13px', color:'#6B7280' }}>Cargando datos...</span>
              <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
            </div>
          )}
          {view === 'dashboard'     && <Dashboard     estudiantes={estudiantes} onVerEstudiante={handleVerEstudiante} onRefresh={refreshEstudiantes}/>}
          {view === 'estudiantes'   && <MisEstudiantes estudiantes={estudiantes} onVerEstudiante={handleVerEstudiante}/>}
          {view === 'alertas'       && <Alertas        estudiantes={estudiantes} onVerEstudiante={handleVerEstudiante}/>}
          {view === 'rendimiento'   && <Rendimiento    estudiantes={estudiantes} onVerEstudiante={handleVerEstudiante}/>}
          {view === 'agenda'        && <Agenda         onVerEstudiante={handleVerEstudiante}/>}
          {view === 'reportes'      && <Reportes       estudiantes={estudiantes}/>}
          {view === 'configuracion' && <Configuracion/>}
          {view === 'chatbot'       && <Chatbot estudiantes={estudiantes} onVerEstudiante={handleVerEstudiante}/>}
          {view === 'perfil'        && estudiante && <Perfil estudiante={estudiante} onRefresh={refreshEstudiantes}/>}
        </div>
      </main>
    </div>
  )
}
