import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function ProPage() {
  async function handleSubscribe() {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const { sessionId } = await response.json()
      const stripe = await stripePromise
      await stripe.redirectToCheckout({ sessionId })
    } catch (err) {
      alert('Something went wrong: ' + err.message)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
      <header style={{background:'#1a365d',padding:'20px',textAlign:'center'}}>
        <h1 style={{color:'white',margin:0,fontSize:'28px'}}>📦 Universal Send Capsule</h1>
        <p style={{color:'#90cdf4',margin:'8px 0 0'}}>Send, receive and save anything. Simply.</p>
      </header>
      <main style={{maxWidth:'600px',margin:'40px auto',padding:'0 20px'}}>
        <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',textAlign:'center'}}>
          <h2 style={{fontSize:'28px',color:'#1a365d'}}>USC Pro</h2>
          <p style={{fontSize:'48px',fontWeight:'bold',color:'#3182ce',margin:'16px 0'}}>£10<span style={{fontSize:'18px',color:'#666'}}>/month</span></p>
          <div style={{textAlign:'left',margin:'24px 0'}}>
            <p style={{padding:'12px 0',borderBottom:'1px solid #eee'}}>✅ Your logo on every capsule</p>
            <p style={{padding:'12px 0',borderBottom:'1px solid #eee'}}>✅ Custom accent colour</p>
            <p style={{padding:'12px 0',borderBottom:'1px solid #eee'}}>✅ Custom sender message</p>
            <p style={{padding:'12px 0',borderBottom:'1px solid #eee'}}>✅ Remove USC branding</p>
            <p style={{padding:'12px 0',borderBottom:'1px solid #eee'}}>✅ "Delivered by Your Brand" footer</p>
            <p style={{padding:'12px 0'}}>✅ Open notification email</p>
          </div>
          <button onClick={handleSubscribe} style={{background:'#3182ce',color:'white',border:'none',padding:'16px 48px',borderRadius:'8px',cursor:'pointer',fontSize:'18px',width:'100%'}}>
            Subscribe for £10/month
          </button>
          <p style={{color:'#666',marginTop:'16px',fontSize:'14px'}}>Cancel anytime. No hidden fees.</p>
        </div>
      </main>
    </div>
  )
}