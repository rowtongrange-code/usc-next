import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [email, setEmail] = useState('')
  const [accentColour, setAccentColour] = useState('#3182ce')
  const [senderMessage, setSenderMessage] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function saveSettings() {
    if (!email) return setError('Please enter your email address')
    setSaving(true)
    setError('')

    try {
      const { error } = await supabase
        .from('pro_users')
        .upsert({
          email,
          accent_colour: accentColour,
          sender_message: senderMessage,
          notification_email: notificationEmail,
          logo_url: logoUrl,
        }, { onConflict: 'email' })

      if (error) throw error
      setSaved(true)
    } catch (err) {
      setError('Could not save settings: ' + err.message)
    }

    setSaving(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
      <header style={{background:'#1a365d',padding:'20px',textAlign:'center'}}>
        <h1 style={{color:'white',margin:0,fontSize:'28px'}}>📦 Universal Send Capsule</h1>
        <p style={{color:'#90cdf4',margin:'8px 0 0'}}>Pro Dashboard</p>
      </header>
      <main style={{maxWidth:'600px',margin:'40px auto',padding:'0 20px'}}>
        <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
          <h2 style={{color:'#1a365d',marginTop:0}}>Your Branding Settings</h2>
          <p style={{color:'#666'}}>Customise how your capsules appear to recipients.</p>

          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontWeight:'bold',marginBottom:'6px'}}>Your Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box'}}
            />
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontWeight:'bold',marginBottom:'6px'}}>Logo URL</label>
            <input
              type="text"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://yoursite.com/logo.png"
              style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box'}}
            />
            <p style={{color:'#666',fontSize:'13px',marginTop:'4px'}}>Paste a link to your logo image</p>
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontWeight:'bold',marginBottom:'6px'}}>Accent Colour</label>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <input
                type="color"
                value={accentColour}
                onChange={e => setAccentColour(e.target.value)}
                style={{width:'60px',height:'40px',borderRadius:'6px',border:'1px solid #ccc',cursor:'pointer'}}
              />
              <span style={{color:'#666'}}>{accentColour}</span>
            </div>
          </div>

          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontWeight:'bold',marginBottom:'6px'}}>Sender Message</label>
            <textarea
              value={senderMessage}
              onChange={e => setSenderMessage(e.target.value)}
              placeholder="e.g. Here are your project files. Let me know if you have any questions!"
              rows={3}
              style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box'}}
            />
          </div>

          <div style={{marginBottom:'28px'}}>
            <label style={{display:'block',fontWeight:'bold',marginBottom:'6px'}}>Open Notification Email</label>
            <input
              type="email"
              value={notificationEmail}
              onChange={e => setNotificationEmail(e.target.value)}
              placeholder="notify@example.com"
              style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box'}}
            />
            <p style={{color:'#666',fontSize:'13px',marginTop:'4px'}}>We'll email you when your capsule is opened</p>
          </div>

          {error && <p style={{color:'red',marginBottom:'16px'}}>{error}</p>}
          {saved && <p style={{color:'#38a169',marginBottom:'16px'}}>✅ Settings saved successfully!</p>}

          <button
            onClick={saveSettings}
            disabled={saving}
            style={{background:'#3182ce',color:'white',border:'none',padding:'14px 32px',borderRadius:'8px',cursor:'pointer',fontSize:'16px',width:'100%'}}
          >
            {saving ? 'Saving...' : 'Save Branding Settings'}
          </button>
        </div>
      </main>
    </div>
  )
}