import { useState } from 'react'

const INSTITUTIONAL_REGEX = /^[a-zA-Z0-9._%+-]+@(unfv\.edu\.pe|correo\.unfv\.edu\.pe)$/

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [pass, setPass]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!INSTITUTIONAL_REGEX.test(email)) {
      setError('Ingresa un correo institucional UNFV válido (@unfv.edu.pe)')
      return
    }
    if (!pass) {
      setError('Ingresa tu contraseña')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin() }, 1200)
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', width:'100%' }}>
      {/* Columna izquierda */}
      <div style={{
        flex:1, background:'#1A1A2E', color:'#fff',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'56px 60px', position:'relative', overflow:'hidden'
      }}>
        {/* glow decoration */}
        <div style={{
          position:'absolute', top:'-80px', left:'-80px',
          width:'320px', height:'320px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(232,93,4,0.15) 0%, transparent 70%)',
          pointerEvents:'none'
        }}/>
        <div style={{ maxWidth:'420px', position:'relative', zIndex:1 }}>
          <svg width="60" height="60" viewBox="0 0 64 64" fill="none"
            stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M32 8 L56 20 L8 20 Z"/>
            <line x1="12" y1="20" x2="12" y2="46"/>
            <line x1="22" y1="20" x2="22" y2="46"/>
            <line x1="32" y1="20" x2="32" y2="46"/>
            <line x1="42" y1="20" x2="42" y2="46"/>
            <line x1="52" y1="20" x2="52" y2="46"/>
            <line x1="8"  y1="46" x2="56" y2="46"/>
            <line x1="4"  y1="54" x2="60" y2="54"/>
          </svg>
          <div style={{ fontSize:'30px', fontWeight:600, letterSpacing:'-.4px', marginTop:'26px' }}>
            E-Tutor <span style={{ color:'#E85D04' }}>UNFV</span>
          </div>
          <div style={{ fontSize:'14px', color:'#8888A8', marginTop:'6px' }}>
            Sistema de Tutoría Académica Inteligente
          </div>
          <div style={{ height:'1px', background:'#333355', margin:'30px 0 26px' }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[
              { icon:'ti-chart-line',     color:'#E85D04', text:'Seguimiento académico en tiempo real' },
              { icon:'ti-alert-triangle', color:'#D97706', text:'Detección temprana de riesgo' },
              { icon:'ti-route',          color:'#16A34A', text:'Rutas de aprendizaje personalizadas' },
            ].map(f => (
              <div key={f.text} style={{
                display:'inline-flex', alignItems:'center', gap:'10px',
                background:'#252545', color:'#A0A0C0', borderRadius:'20px',
                padding:'9px 15px', fontSize:'12.5px', width:'max-content', maxWidth:'100%',
                animation:'fadeSlideIn 0.5s ease both'
              }}>
                <i className={`ti ${f.icon}`} style={{ color:f.color }}/>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <div style={{
          position:'absolute', bottom:'28px', left:'60px',
          fontSize:'11px', color:'#555575'
        }}>
          Universidad Nacional Federico Villarreal · VRINI · OCIDE
        </div>
      </div>

      {/* Columna derecha */}
      <div style={{
        flex:1, background:'#F4F6F9',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'40px 24px'
      }}>
        <div style={{ width:'100%', maxWidth:'360px', animation:'fadeUp 0.4s ease both' }}>
          <div style={{
            fontSize:'13px', fontWeight:600, letterSpacing:'.08em',
            textTransform:'uppercase', color:'#E85D04'
          }}>Bienvenido</div>
          <div style={{ fontSize:'22px', fontWeight:600, marginTop:'8px' }}>
            Inicia sesión en tu cuenta
          </div>
          <div style={{ fontSize:'13px', color:'#6B7280', marginTop:'5px' }}>
            Accede con tus credenciales institucionales UNFV
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop:'28px' }}>
            {/* Email */}
            <div style={{ marginBottom:'16px' }}>
              <label style={{
                display:'block', fontSize:'12.5px', fontWeight:500,
                color:'#374151', marginBottom:'6px'
              }}>Correo institucional</label>
              <div style={{ position:'relative' }}>
                <i className="ti ti-mail" style={{
                  position:'absolute', left:'13px', top:'50%',
                  transform:'translateY(-50%)', color:'#9CA3AF', fontSize:'16px'
                }}/>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="usuario@unfv.edu.pe"
                  style={{
                    width:'100%', height:'44px', border:'1px solid #E5E7EB',
                    borderRadius:'10px', padding:'0 13px 0 38px',
                    fontSize:'14px', background:'#fff',
                    transition:'border-color .2s'
                  }}
                />
              </div>
              <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'4px' }}>
                Solo correos @unfv.edu.pe o @correo.unfv.edu.pe
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:'20px' }}>
              <label style={{
                display:'block', fontSize:'12.5px', fontWeight:500,
                color:'#374151', marginBottom:'6px'
              }}>Contraseña</label>
              <div style={{ position:'relative' }}>
                <i className="ti ti-lock" style={{
                  position:'absolute', left:'13px', top:'50%',
                  transform:'translateY(-50%)', color:'#9CA3AF', fontSize:'16px'
                }}/>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={e => { setPass(e.target.value); setError('') }}
                  placeholder="••••••••"
                  style={{
                    width:'100%', height:'44px', border:'1px solid #E5E7EB',
                    borderRadius:'10px', padding:'0 42px 0 38px',
                    fontSize:'14px', background:'#fff'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position:'absolute', right:'6px', top:'6px',
                    width:'32px', height:'32px', border:'none',
                    background:'transparent', color:'#9CA3AF',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'
                  }}
                >
                  <i className={`ti ${showPass ? 'ti-eye-off' : 'ti-eye'}`}/>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background:'#FEF2F2', border:'1px solid #FECACA',
                color:'#991B1B', fontSize:'12.5px', padding:'10px 13px',
                borderRadius:'8px', marginBottom:'16px',
                display:'flex', alignItems:'center', gap:'8px'
              }}>
                <i className="ti ti-alert-circle"/>
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width:'100%', height:'44px',
                background: loading ? '#F09060' : '#E85D04',
                color:'#fff', border:'none', borderRadius:'10px',
                fontSize:'15px', fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                transition:'background .2s, transform .1s',
                transform: loading ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width:'16px', height:'16px', border:'2px solid rgba(255,255,255,0.4)',
                    borderTopColor:'#fff', borderRadius:'50%',
                    animation:'spin 0.7s linear infinite', display:'inline-block'
                  }}/>
                  Ingresando...
                </>
              ) : (
                <>
                  <i className="ti ti-login"/>
                  Ingresar
                </>
              )}
            </button>
          </form>

          {/* Demo card */}
          <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'24px', marginBottom:'8px' }}>
            Modo demo — ingresando como:
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:'11px',
            background:'#fff', border:'1px solid #E5E7EB',
            borderRadius:'10px', padding:'11px 13px'
          }}>
            <div style={{
              width:'38px', height:'38px', borderRadius:'50%',
              background:'#E85D04', color:'#fff', fontWeight:600,
              fontSize:'13px', display:'flex', alignItems:'center',
              justifyContent:'center', flexShrink:0
            }}>JM</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'13px', fontWeight:600 }}>Mg. Jorge Mendoza Quispe</div>
              <div style={{ fontSize:'11.5px', color:'#6B7280' }}>Tutor · Fac. Ingeniería de Sistemas</div>
            </div>
            <span style={{
              fontSize:'9.5px', fontWeight:600, background:'#FFF0E8',
              color:'#C44D00', borderRadius:'20px', padding:'4px 9px', whiteSpace:'nowrap'
            }}>TUTOR</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateX(-12px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
