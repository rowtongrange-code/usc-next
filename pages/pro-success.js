const USC_LOGO = "https://wmycyifiudnidhn0.public.blob.vercel-storage.com/logos/usc-pro-logo-1776889474418-w5APeQTGMpuAt9U0RcaVc9AC3QtBqb.png"

export default function ProSuccess() {
  return (
    <div style={{minHeight:'100vh',background:'#0d1117',fontFamily:'system-ui,sans-serif'}}>
      <div style={{background:'#0d1117',borderBottom:'1px solid #21262d',padding:'16px 24px',display:'flex',alignItems:'center',gap:'12px'}}>
        <img src={USC_LOGO} alt="USC" style={{height:'36px',width:'auto'}} />
        <div>
          <h1 style={{color:'white',margin:0,fontSize:'20px'}}>Universal Send Capsule™</h1>
          <p style={{color:'#8b949e',margin:0,fontSize:'13px'}}>Welcome to Pro</p>
        </div>
      </div>
      <main style={{maxWidth:'560px',margin:'40px auto',padding:'0 20px'}}>
        <div style={{background:'#161b22',borderRadius:'16px',padding:'32px',border:'1px solid #21262d',textAlign:'center'}}>
          <div style={{fontSize:'64px',marginBottom:'16px'}}>🎉</div>
          <h2 style={{color:'#4ade80',fontSize:'28px',margin:'0 0 16px'}}>Welcome to USC Pro!</h2>
          <p style={{fontSize:'16px',color:'#8b949e',marginTop:'0'}}>Your subscription is active. You can now customise your branded capsule experience.</p>
          <div style={{background:'#0d1117',borderRadius:'12px',padding:'20px',margin:'24px 0',border:'1px solid #21262d',textAlign:'left'}}>
            <p style={{color:'white',fontWeight:'bold',margin:'0 0 12px'}}>What's next:</p>
            {['Set up your branding in the Dashboard','Upload your logo and choose your accent colour','Save your most-used files to My Shelf','Send your first branded capsule'].map((item, i) => (
              <p key={i} style={{color:'#8b949e',margin:'8px 0',fontSize:'14px'}}>→ {item}</p>
            ))}
          </div>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/dashboard" style={{display:'inline-block',background:'#553c9a',color:'white',padding:'12px 24px',borderRadius:'8px',textDecoration:'none',fontSize:'15px',fontWeight:'bold'}}>
              ⚙️ Go to Dashboard
            </a>
            <a href="/" style={{display:'inline-block',background:'#161b22',color:'white',padding:'12px 24px',borderRadius:'8px',textDecoration:'none',fontSize:'15px',border:'1px solid #21262d'}}>
              ← Back to USC
            </a>
          </div>
          <p style={{color:'#8b949e',fontSize:'12px',marginTop:'24px'}}>© 2026 Universal Send Capsule™</p>
        </div>
      </main>
    </div>
  )
}