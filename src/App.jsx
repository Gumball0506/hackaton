import { useState } from 'react'
import Login         from './Login'
import Sidebar       from './Sidebar'
import Topbar        from './Topbar'
import Dashboard     from './Dashboard'
import MisEstudiantes from './MisEstudiantes'
import Alertas       from './Alertas'
import Perfil        from './Perfil'

const TITLES = {
  dashboard:    { title:'Panel general',   breadcrumb:'E-Tutor / Tutor / Panel' },
  estudiantes:  { title:'Mis Estudiantes', breadcrumb:'E-Tutor / Tutor / Mis Estudiantes' },
  alertas:      { title:'Alertas de Riesgo', breadcrumb:'E-Tutor / Tutor / Alertas' },
  perfil:       { title:'Perfil del Estudiante', breadcrumb:'E-Tutor / Tutor / Mis Estudiantes / Perfil' },
}

export default function App() {
  const [screen,    setScreen]    = useState('login')
  const [view,      setView]      = useState('dashboard')
  const [prevView,  setPrevView]  = useState('dashboard')
  const [estudiante, setEstudiante] = useState(null)

  function handleLogin() { setScreen('app') }
  function handleLogout() { setScreen('login') }

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

  if (screen === 'login') return <Login onLogin={handleLogin}/>

  const isPerfil = view === 'perfil'
  const meta = TITLES[view] || TITLES.dashboard

  return (
    <div style={{ display:'flex', minHeight:'100vh', width:'100%' }}>
      <Sidebar view={view} onNav={handleNav} onLogout={handleLogout}/>
      <main style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', background:'#F4F6F9' }}>
        <Topbar
          title={meta.title}
          breadcrumb={meta.breadcrumb}
          showBack={isPerfil}
          onBack={handleBack}
        />
        <div style={{ flex:1, overflowY:'auto' }}>
          {view === 'dashboard'   && <Dashboard     onVerEstudiante={handleVerEstudiante}/>}
          {view === 'estudiantes' && <MisEstudiantes onVerEstudiante={handleVerEstudiante}/>}
          {view === 'alertas'     && <Alertas        onVerEstudiante={handleVerEstudiante}/>}
          {view === 'perfil'      && estudiante && <Perfil estudiante={estudiante}/>}
        </div>
      </main>
    </div>
  )
}
