import { useState } from 'react'

export default function Dashboard() {
  const [email, setEmail] = useState('')
  const [checking, setChecking] = useState(false)
  const [verified, setVerified] = useState(false)
  const [notSubscribed, setNotSubscribed] = useState(false)
  const [accentColour, setAccentColour] = useState('#3182ce')
  const [senderMessage, setSenderMessage] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [senderName, setSenderName] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function checkSubscription() {
    if (!email) return setError('Please enter your email address')
    setChecking(true)
    setError('')

    try {
      const response = await fetch('/api/check-subscriber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()

      if (data.subscribed) {
        setVerified(true)
        loadSettings()
      } else {
        setNotSubscribed(true)
      }
    } catch (err) {
      setError('Could not verify subscription: ' + err.message)
    }

    setChecking(false)
  }

  async function loadSettings() {
    try {
      const response = await fetch(`/api/get-branding?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        setAccentColour(data.accent_colour || '#3182ce')
        setSenderMessage(data.sender_message || '')
        setNotificationEmail(data.notification_email || '')
        setLogoUrl(data.logo_url || '')
        if (data.logo_url) setLogoPreview(data.logo_url)
        setSenderName(data.sender_name || '')
      }
    } catch (err) {
      // No existing settings
    }
  }

  async function handleLogoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please select an image file')
    if (file.size > 2 * 1024 * 1024) return setError('Logo must be under 2MB')

    setLogoFile(file)
    setError('')

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function uploadLogo() {
    if (!logoFile) return logoUrl
    setUploadingLogo(true)

    try {
      const { upload } = await import('@vercel/blob/client')
      const blobResult = await upload(`logos/${email}-logo-${Date.now()}.${logoFile.name.split('.').pop()}`, logoFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })
      setLogoUrl(blobResult.url)
      setUploadingLogo(false)
      return blobResult.url
    } catch (err) {
      setError('Could not upload logo: ' + err.message)
      setUploadingLogo(false)
      return logoUrl
    }
  }

  async function saveSettings() {
    setSaving(true)
    setError('')

    try {
      let finalLogoUrl = logoUrl
      if (logoFile) {
        finalLogoUrl = await uploadLogo()
      }

      const response = await fetch('/api/save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          sender_name: senderName,
          accent_colour: accentColour,
          sender_message: senderMessage,
          notification_email: notificationEmail,
          logo_url: finalLogoUrl,
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setSaved(true)
      setLogoFile(null)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Could not save settings: ' + err.message)
    }

    setSaving(false)
  }

  if (!verified) {
    return (
      <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
        <header style={{background:'#1a365d',padding:'20px',textAlign:'center'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px'}}>
  <img src="https://wmycyifiudnidhn0.public.blob.vercel-storage.com/logos/rowtongrange%40gmail.com-logo-1776552137100-RiYzCziPTlO6tsiFyHD1oZyCm81Ih9.png" alt="USC Logo" style={{height:'45px',width:'auto'}} />
  <div>
    <h1 style={{color:'white',margin:0,fontSize:'28px'}}>Universal Send Capsule™</h1>
    <p style={{color:'#90cdf4',margin:'4px 0 0'}}>Pro Dashboard</p>
  </div>
</div>
        </header>
        <main style={{maxWidth:'500px',margin:'40px auto',padding:'0 20px'}}>
          <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
            <h2 style={{color:'#1a365d',marginTop:0}}>Access Your Dashboard</h2>
            <p style={{color:'#666'}}>Enter your email to access your Pro branding settings.</p>

            {notSubscribed && (
              <div style={{background:'#fff5f5',border:'1px solid #feb2b2',borderRadius:'8px',padding:'16px',marginBottom:'20px'}}>
                <p style={{color:'#c53030',margin:0}}>No active subscription found for this email.</p>
                <a href="/pro" style={{color:'#3182ce',display:'block',marginTop:'8px'}}>Subscribe to USC Pro →</a>
              </div>
            )}

            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontWeight:'bold',marginBottom:'6px'}}>Your Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setNotSubscribed(false) }}
                placeholder="you@example.com"
                style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box'}}
              />
            </div>

            {error && <p style={{color:'red',marginBottom:'16px'}}>{error}</p>}

            <button
              onClick={checkSubscription}
              disabled={checking}
              style={{background:'#3182ce',color:'white',border:'none',padding:'14px 32px',borderRadius:'8px',cursor:'pointer',fontSize:'16px',width:'100%'}}
            >
              {checking ? 'Checking...' : 'Access Dashboard'}
            </button>

            <div style={{marginTop:'24px',padding:'16px',background:'#f7fafc',borderRadius:'8px',textAlign:'center'}}>
              <p style={{margin:'0 0 12px',color:'#666',fontSize:'14px'}}>Need to cancel or update your subscription?</p>
              <a href="https://billing.stripe.com/p/login/cNieV7e3I0XA51rbGw5gc00" target="_blank" style={{display:'inline-block',background:'#e53e3e',color:'white',padding:'10px 24px',borderRadius:'8px',textDecoration:'none',fontSize:'14px'}}>
                Manage My Subscription
              </a>
            </div>
            <p style={{textAlign:'center',marginTop:'16px'}}>
              <a href="/" style={{color:'#666',fontSize:'14px'}}>← Back to USC</a>
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
      <header style={{background:'#1a365d',padding:'20px',textAlign:'center'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px'}}>
  <img src="https://wmycyifiudnidhn0.public.blob.vercel-storage.com/logos/rowtongrange%40gmail.com-logo-1776552137100-RiYzCziPTlO6tsiFyHD1oZyCm81Ih9.png" alt="USC Logo" style={{height:'45px',width:'auto'}} />
  <div>
    <h1 style={{color:'white',margin:0,fontSize:'28px'}}>Universal Send Capsule™</h1>
    <p style={{color:'#90cdf4',margin:'4px 0 0'}}>Pro Dashboard</p>
  </div>
</div>
      </header>
      <main style={{maxWidth:'600px',margin:'40px auto',padding:'0 20px'}}>
        <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
          <h2 style={{color:'#1a365d',marginTop:0}}>Your Branding Settings</h2>
          <p style={{color:'#666'}}>Customise how your capsules appear to recipients.</p>
<div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontWeight:'bold',marginBottom:'6px'}}>Your Name</label>
            <input
              type="text"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              placeholder="e.g. Matthew"
              style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box'}}
            />
            <p style={{color:'#666',fontSize:'13px',marginTop:'4px'}}>This is how you'll appear to recipients</p>
          </div>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',fontWeight:'bold',marginBottom:'6px'}}>Your Logo</label>
            {logoPreview && (
              <div style={{marginBottom:'12px',padding:'12px',background:'#f7fafc',borderRadius:'8px',textAlign:'center'}}>
                <img src={logoPreview} alt="Logo preview" style={{maxHeight:'60px',maxWidth:'200px',objectFit:'contain'}} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box',background:'white'}}
            />
            <p style={{color:'#666',fontSize:'13px',marginTop:'4px'}}>Upload your logo — JPG, PNG or SVG under 2MB</p>
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
            disabled={saving || uploadingLogo}
            style={{background:'#3182ce',color:'white',border:'none',padding:'14px 32px',borderRadius:'8px',cursor:'pointer',fontSize:'16px',width:'100%'}}
          >
            {uploadingLogo ? 'Uploading logo...' : saving ? 'Saving...' : 'Save Branding Settings'}
          </button>

          <p style={{textAlign:'center',marginTop:'16px'}}>
            <a href="/" style={{color:'#666',fontSize:'14px'}}>← Back to USC</a>
          </p>
        </div>
      </main>
    </div>
  )
}