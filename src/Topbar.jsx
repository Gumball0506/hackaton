export default function Topbar({ title, breadcrumb, showBack, onBack }) {
  return (
    <div style={{
      background:'#fff', borderBottom:'1px solid #E5E7EB',
      height:'56px', display:'flex', alignItems:'center',
      justifyContent:'space-between', padding:'0 24px', gap:'16px',
      position:'sticky', top:0, zIndex:20
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:'14px', minWidth:0 }}>
        {showBack && (
          <button
            onClick={onBack}
            style={{
              display:'inline-flex', alignItems:'center', gap:'6px',
              border:'1px solid #E85D04', color:'#E85D04', background:'#fff',
              borderRadius:'8px', padding:'7px 12px', fontSize:'12.5px',
              fontWeight:600, cursor:'pointer', whiteSpace:'nowrap',
              transition:'background .15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background='#FFF0E8' }}
            onMouseLeave={e => { e.currentTarget.style.background='#fff' }}
          >
            <i className="ti ti-arrow-left"/>Volver al dashboard
          </button>
        )}
        <div style={{ minWidth:0 }}>
          <div style={{
            fontSize:'18px', fontWeight:600,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
          }}>{title}</div>
          <div style={{
            fontSize:'12px', color:'#9CA3AF',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
          }}>{breadcrumb}</div>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
        <div style={{
          position:'relative', display:'flex', alignItems:'center',
          background:'#F4F6F9', border:'1px solid #E5E7EB', borderRadius:'8px',
          height:'36px', padding:'0 12px', gap:'8px', width:'240px', maxWidth:'28vw'
        }}>
          <i className="ti ti-search" style={{ color:'#9CA3AF' }}/>
          <input
            placeholder="Buscar estudiante..."
            style={{
              border:'none', background:'transparent', outline:'none',
              fontSize:'13px', width:'100%'
            }}
          />
        </div>
        <button style={{
          position:'relative', border:'1px solid #E5E7EB', background:'#fff',
          width:'36px', height:'36px', borderRadius:'8px',
          cursor:'pointer', color:'#374151',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <i className="ti ti-bell"/>
          <span style={{
            position:'absolute', top:'-5px', right:'-5px',
            background:'#DC2626', color:'#fff', fontSize:'9px', fontWeight:600,
            width:'16px', height:'16px', borderRadius:'8px',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>3</span>
        </button>
        <div style={{
          width:'32px', height:'32px', borderRadius:'50%', background:'#E85D04',
          color:'#fff', fontWeight:600, fontSize:'12px',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>JM</div>
      </div>
    </div>
  )
}
