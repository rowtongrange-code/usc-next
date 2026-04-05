export default function ProSuccess() {
  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
      <header style={{background:'#1a365d',padding:'20px',textAlign:'center'}}>
        <h1 style={{color:'white',margin:0,fontSize:'28px'}}>📦 Universal Send Capsule™</h1>
        <p style={{color:'#90cdf4',margin:'8px 0 0'}}>Send, receive and save anything. Simply.</p>
      </header>
      <main style={{maxWidth:'600px',margin:'40px auto',padding:'0 20px'}}>
        <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',textAlign:'center'}}>
          <h2 style={{color:'#38a169'}}>🎉 Welcome to USC Pro!</h2>
          <p style={{fontSize:'18px',color:'#444',marginTop:'16px'}}>Your subscription is active. You can now customise your branded capsule experience.</p>
          <p style={{color:'#666',marginTop:'12px'}}>We'll be in touch shortly with your Pro account setup details.</p>
          <a href="/" style={{display:'inline-block',marginTop:'24px',background:'#3182ce',color:'white',padding:'12px 32px',borderRadius:'8px',textDecoration:'none',fontSize:'16px'}}>
            Back to USC
          </a>
        </div>
      </main>
    </div>
  )
}