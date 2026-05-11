import { loadStripe } from '@stripe/stripe-js'

const USC_LOGO = "https://wmycyifiudnidhn0.public.blob.vercel-storage.com/logos/usc-pro-logo-1776889474418-w5APeQTGMpuAt9U0RcaVc9AC3QtBqb.png"
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function ProPage() {
  async function handleSubscribe() {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      alert('Something went wrong: ' + err.message)
    }
  }

  const features = [
    '⭐ Your logo on every capsule',
    '🎨 Custom accent colour',
    '✉️ Custom sender message',
    '🚫 Remove USC branding',
    '📦 "Delivered by Your Brand" footer',
    '🔔 Open notification email',
    '🔒 Time Locked Capsules — seal & reveal on your schedule',
    '📂 My Shelf — one-tap capsule delivery',
  ]

  return (
    <div style={{minHeight:'100vh',background:'#0d1117',fontFamily:'system-ui,sans-serif'}}>
      <div style={{background:'#0d1117',borderBottom:'1px solid #21262d',padding:'16px 24px',display:'flex',alignItems:'center',gap:'12px'}}>
        <img src={USC_LOGO} alt="USC" style={{height:'36px',width:'auto'}} />
        <div>
          <h1 style={{color:'white',margin:0,fontSize:'20px'}}>Universal Send Capsule™</h1>
          <p style={{color:'#8b949e',margin:0,fontSize:'13px'}}>Go Pro</p>
        </div>
        <a href="/" style={{marginLeft:'auto',color:'#8b949e',fontSize:'13px',textDecoration:'none'}}>← Back</a>
      </div>

      <main style={{maxWidth:'560px',margin:'40px auto',padding:'0 20px'}}>
        <div style={{background:'#161b22',borderRadius:'16px',padding:'32px',border:'1px solid #21262d',textAlign:'center'}}>
          
          <div style={{marginBottom:'24px'}}>
            <h2 style={{color:'white',fontSize:'28px',margin:'0 0 8px'}}>USC Pro</h2>
            <p style={{color:'#8b949e',margin:0,fontSize:'16px'}}>Everything you need to deliver work professionally</p>
          </div>

          <div style={{background:'#0d1117',borderRadius:'12px',padding:'20px',marginBottom:'24px',border:'1px solid #21262d'}}>
            <span style={{color:'white',fontSize:'52px',fontWeight:'700'}}>£10</span>
            <span style={{color:'#8b949e',fontSize:'18px'}}>/month</span>
          </div>

          <div style={{textAlign:'left',marginBottom:'24px'}}>
            {features.map((f, i) => (
              <div key={i} style={{padding:'12px 0',borderBottom: i < features.length - 1 ? '1px solid #21262d' : 'none',color:'white',fontSize:'15px'}}>
                {f}
              </div>
            ))}
          </div>

          <button onClick={handleSubscribe}
            style={{background:'linear-gradient(135deg,#553c9a,#3b82f6)',color:'white',border:'none',padding:'16px 48px',borderRadius:'10px',cursor:'pointer',fontSize:'18px',width:'100%',fontWeight:'bold',marginBottom:'16px'}}>
            Subscribe for £10/month
          </button>

          <p style={{color:'#8b949e',fontSize:'14px',margin:'0 0 8px'}}>Cancel anytime. No hidden fees.</p>
          <a href="/policy" style={{color:'#a78bfa',fontSize:'13px'}}>View Subscription & Refund Policy</a>
          <p style={{color:'#8b949e',fontSize:'12px',marginTop:'16px'}}>© 2026 Universal Send Capsule™</p>
        </div>
      </main>
    </div>
  )
}