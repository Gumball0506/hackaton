export default function Sidebar({ view, onNav, onLogout, estudiantes = [] }) {
  const totalEst  = estudiantes.length || null
  const totalAlertas = estudiantes.filter(e =>
    e.riesgo === 'ROJO' || e.riesgo === 'ROJO_FALTAS' || e.riesgo === 'AMBAR'
  ).length || null

  const NAV = [
    { key:'dashboard',  icon:'ti-layout-dashboard', label:'Panel general',     badge:null,          badgeBg:'' },
    { key:'estudiantes',icon:'ti-users',             label:'Mis estudiantes',   badge:totalEst,      badgeBg:'#E85D04' },
    { key:'alertas',    icon:'ti-alert-triangle',    label:'Alertas de riesgo', badge:totalAlertas,  badgeBg:'#DC2626' },
  ]
  return (
    <aside style={{
      width:'220px', flexShrink:0, background:'#1A1A2E', color:'#E8E8F0',
      height:'100vh', position:'sticky', top:0,
      display:'flex', flexDirection:'column', zIndex:30
    }}>
      {/* Logo */}
      <div style={{
        padding:'18px 18px 14px',
        borderBottom:'1px solid #2A2A45'
      }}>
        <div style={{ fontSize:'16px', fontWeight:600 }}>
          E-Tutor <span style={{ color:'#E85D04' }}>UNFV</span>
        </div>
        <div style={{ fontSize:'10px', color:'#555575', marginTop:'2px' }}>Sistema de Tutoría</div>
      </div>

      {/* Tutor */}
      <div style={{
        padding:'15px 16px', display:'flex', alignItems:'center', gap:'11px',
        borderBottom:'1px solid #2A2A45'
      }}>
        <div style={{
          width:'36px', height:'36px', borderRadius:'50%', background:'#E85D04',
          color:'#fff', fontWeight:600, fontSize:'13px',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
        }}>JM</div>
        <div style={{ minWidth:0 }}>
          <div style={{
            fontSize:'13px', fontWeight:500, color:'#E8E8F0',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
          }}>Mg. Jorge Mendoza</div>
          <div style={{ display:'flex', gap:'5px', marginTop:'4px' }}>
            <span style={{
              fontSize:'9.5px', fontWeight:600, background:'#E85D04',
              color:'#fff', borderRadius:'10px', padding:'2px 7px'
            }}>Tutor</span>
            <span style={{
              fontSize:'9.5px', fontWeight:600, background:'#252545',
              color:'#A0A0C0', borderRadius:'10px', padding:'2px 7px'
            }}>Docente</span>
          </div>
          <div style={{ fontSize:'11px', color:'#8888A8', marginTop:'4px' }}>Ing. de Sistemas</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px', flex:1 }}>
        {NAV.map(item => {
          const active = view === item.key
          return (
            <button
              key={item.key}
              onClick={() => onNav(item.key)}
              style={{
                display:'flex', alignItems:'center', gap:'11px',
                padding:'10px 12px', border:'none', borderRadius:'8px',
                cursor:'pointer', fontSize:'13px', textAlign:'left', width:'100%',
                background: active ? '#E85D04' : 'transparent',
                color: active ? '#fff' : '#A0A0C0',
                fontWeight: active ? 600 : 400,
                transition:'background .15s, color .15s'
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#252545' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <i className={`ti ${item.icon}`} style={{ width:'18px', textAlign:'center', flexShrink:0 }}/>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize:'10px', fontWeight:600,
                  background: item.badgeBg, color:'#fff',
                  minWidth:'19px', height:'19px', borderRadius:'10px',
                  display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'0 5px'
                }}>{item.badge}</span>
              )}
            </button>
          )
        })}

        <div style={{ height:'1px', background:'#2A2A45', margin:'8px 6px' }}/>

        <button
          onClick={onLogout}
          style={{
            display:'flex', alignItems:'center', gap:'11px',
            padding:'10px 12px', border:'none', borderRadius:'8px',
            cursor:'pointer', fontSize:'13px', textAlign:'left', width:'100%',
            background:'transparent', color:'#A0A0C0', transition:'background .15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#252545'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <i className="ti ti-logout" style={{ width:'18px', textAlign:'center' }}/>
          <span>Cerrar sesión</span>
        </button>
      </nav>

      {/* Footer */}
      <div style={{ padding:'13px 18px', borderTop:'1px solid #2A2A45' }}>
        <div style={{ fontSize:'10px', color:'#444468' }}>E-Tutor UNFV v1.0</div>
        <div style={{ fontSize:'10px', color:'#333355', marginTop:'2px' }}>Hackathon OCIDE 2026</div>
      </div>
    </aside>
  )
}
