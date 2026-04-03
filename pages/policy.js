export default function Policy() {
  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
      <header style={{background:'#1a365d',padding:'20px',textAlign:'center'}}>
        <h1 style={{color:'white',margin:0,fontSize:'28px'}}>📦 Universal Send Capsule</h1>
        <p style={{color:'#90cdf4',margin:'8px 0 0'}}>Send, receive and save anything. Simply.</p>
      </header>
      <main style={{maxWidth:'700px',margin:'40px auto',padding:'0 20px'}}>
        <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
          <h2 style={{color:'#1a365d',marginTop:0}}>Subscription & Refund Policy</h2>

          <h3 style={{color:'#2d3748'}}>1. Subscription Management</h3>
          <p>USC Pro is a monthly subscription service priced at <strong>£10.00/month</strong>.</p>
          <ul>
            <li><strong>Self-Service:</strong> You can cancel your subscription at any time via the Stripe Billing Portal.</li>
            <li><strong>Effect of Cancellation:</strong> Upon cancellation, you will retain access to Pro features (Branding, Time-Lock, Notifications) until the end of your current billing cycle. No further charges will be made.</li>
          </ul>

          <h3 style={{color:'#2d3748'}}>2. Refund Policy</h3>
          <p>Because USC offers a Free Tier to allow users to test the core functionality (sending and receiving) before upgrading, we operate a limited refund policy:</p>
          <ul>
            <li><strong>Change of Mind:</strong> We do not offer refunds for "change of mind" once a billing cycle has begun.</li>
            <li><strong>Technical Issues:</strong> If a technical fault on our end prevents you from using a Pro feature (e.g., Branding failing to display or Time-Lock malfunction), please contact support within 48 hours of the issue. If we cannot resolve it, a pro-rated refund will be issued.</li>
            <li><strong>Accidental Renewals:</strong> We do not offer refunds for forgotten subscriptions. It is the user's responsibility to cancel before the next billing date.</li>
          </ul>

          <h3 style={{color:'#2d3748'}}>3. Account & Data</h3>
          <ul>
            <li><strong>Downgrading:</strong> If a subscription expires or is cancelled, any Active Capsules will remain available for download, but custom branding will revert to standard USC styling.</li>
            <li><strong>Chargebacks:</strong> Any fraudulent chargebacks will result in the immediate and permanent termination of the associated USC account and the deletion of all active capsules.</li>
          </ul>

          <div style={{marginTop:'32px',padding:'16px',background:'#f7fafc',borderRadius:'8px'}}>
            <p style={{margin:0,color:'#666',fontSize:'14px'}}>For support enquiries please contact us at <a href="mailto:support@universalsendcapsule.com" style={{color:'#3182ce'}}>support@universalsendcapsule.com</a></p>
          </div>

          <p style={{textAlign:'center',marginTop:'24px'}}>
            <a href="/" style={{color:'#3182ce'}}>← Back to USC</a>
          </p>
        </div>
      </main>
    </div>
  )
}