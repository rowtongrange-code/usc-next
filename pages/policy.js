const USC_LOGO = "https://wmycyifiudnidhn0.public.blob.vercel-storage.com/logos/usc-pro-logo-1776889474418-w5APeQTGMpuAt9U0RcaVc9AC3QtBqb.png"

export default function Policy() {
  return (
    <div style={{minHeight:'100vh',background:'#0d1117',fontFamily:'system-ui,sans-serif'}}>
      <div style={{background:'#0d1117',borderBottom:'1px solid #21262d',padding:'16px 24px',display:'flex',alignItems:'center',gap:'12px'}}>
        <img src={USC_LOGO} alt="USC" style={{height:'36px',width:'auto'}} />
        <div>
          <h1 style={{color:'white',margin:0,fontSize:'20px'}}>Universal Send Capsule™</h1>
          <p style={{color:'#8b949e',margin:0,fontSize:'13px'}}>Subscription & Refund Policy</p>
        </div>
        <a href="/" style={{marginLeft:'auto',color:'#8b949e',fontSize:'13px',textDecoration:'none'}}>← Back</a>
      </div>
      <main style={{maxWidth:'700px',margin:'40px auto',padding:'0 20px'}}>
        <div style={{background:'#161b22',borderRadius:'12px',padding:'32px',border:'1px solid #21262d'}}>
          <h2 style={{color:'white',marginTop:0}}>Subscription & Refund Policy</h2>

          <h3 style={{color:'#a78bfa'}}>1. Subscription Management</h3>
          <p style={{color:'#8b949e'}}>USC Pro is a monthly subscription service priced at <strong style={{color:'white'}}>£10.00/month</strong>.</p>
          <ul style={{color:'#8b949e',lineHeight:'1.8'}}>
            <li><strong style={{color:'white'}}>Self-Service:</strong> You can cancel your subscription at any time via the Stripe Billing Portal.</li>
            <li><strong style={{color:'white'}}>Effect of Cancellation:</strong> Upon cancellation, you will retain access to Pro features until the end of your current billing cycle. No further charges will be made.</li>
          </ul>

          <h3 style={{color:'#a78bfa'}}>2. Refund Policy</h3>
          <p style={{color:'#8b949e'}}>Because USC offers a Free Tier to allow users to test the core functionality before upgrading, we operate a limited refund policy:</p>
          <ul style={{color:'#8b949e',lineHeight:'1.8'}}>
            <li><strong style={{color:'white'}}>Change of Mind:</strong> We do not offer refunds for "change of mind" once a billing cycle has begun.</li>
            <li><strong style={{color:'white'}}>Technical Issues:</strong> If a technical fault on our end prevents you from using a Pro feature, please contact support within 48 hours. If we cannot resolve it, a pro-rated refund will be issued.</li>
            <li><strong style={{color:'white'}}>Accidental Renewals:</strong> We do not offer refunds for forgotten subscriptions. It is the user's responsibility to cancel before the next billing date.</li>
          </ul>

          <h3 style={{color:'#a78bfa'}}>3. Account & Data</h3>
          <ul style={{color:'#8b949e',lineHeight:'1.8'}}>
            <li><strong style={{color:'white'}}>Downgrading:</strong> If a subscription expires or is cancelled, Active Capsules will remain available for download, but custom branding will revert to standard USC styling.</li>
            <li><strong style={{color:'white'}}>Chargebacks:</strong> Any fraudulent chargebacks will result in the immediate and permanent termination of the associated USC account and the deletion of all active capsules.</li>
          </ul>

          <div style={{marginTop:'32px',padding:'16px',background:'#0d1117',borderRadius:'8px',border:'1px solid #21262d'}}>
            <p style={{margin:'0 0 12px',color:'#8b949e',fontSize:'14px'}}>To manage or cancel your subscription, visit the self-service portal:</p>
            <a href="https://billing.stripe.com/p/login/cNieV7e3I0XA51rbGw5gc00" target="_blank"
              style={{display:'inline-block',background:'#553c9a',color:'white',padding:'10px 24px',borderRadius:'8px',textDecoration:'none',fontSize:'14px',fontWeight:'bold'}}>
              Manage My Subscription
            </a>
          </div>

          <p style={{textAlign:'center',color:'#8b949e',fontSize:'12px',marginTop:'24px'}}>© 2026 Universal Send Capsule™</p>
        </div>
      </main>
    </div>
  )
}