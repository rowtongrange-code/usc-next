import { useState, useEffect } from 'react'
import sodium from 'libsodium-wrappers'

const USC_LOGO = "https://wmycyifiudnidhn0.public.blob.vercel-storage.com/logos/usc-pro-logo-1776889474418-w5APeQTGMpuAt9U0RcaVc9AC3QtBqb.png"

export default function OpenPage() {
  const [status, setStatus] = useState('Opening your capsule...')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [branding, setBranding] = useState(null)
  const [locked, setLocked] = useState(false)
  const [unlockTime, setUnlockTime] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [senderEmail, setSenderEmail] = useState('')

  useEffect(() => { loadBrandingAndCheck() }, [])

  useEffect(() => {
    if (!locked || !unlockTime) return
    const interval = setInterval(() => {
      const remaining = unlockTime - Date.now()
      if (remaining <= 0) { clearInterval(interval); setLocked(false); loadCapsule() }
      else setTimeLeft(remaining)
    }, 1000)
    return () => clearInterval(interval)
  }, [locked, unlockTime])

  async function loadBrandingAndCheck() {
    try {
      const params = new URLSearchParams(window.location.search)
      const proEmail = params.get('pro')
      const unlock = params.get('unlock')
      if (proEmail) {
        setSenderEmail(proEmail)
        const res = await fetch(`/api/get-branding?email=${encodeURIComponent(proEmail)}`)
        if (res.ok) setBranding(await res.json())
      }
      if (unlock) {
        const unlockTimestamp = parseInt(unlock)
        const remaining = unlockTimestamp - Date.now()
        if (remaining > 0) {
          setUnlockTime(unlockTimestamp)
          setTimeLeft(remaining)
          setLocked(true)
          setStatus('')
          return
        }
      }
    } catch(e) {}
    await loadCapsule()
  }

  async function loadCapsule() {
    try {
      const params = new URLSearchParams(window.location.search)
      const url = params.get('url')
      const keyHex = window.location.hash.slice(1)
      if (!url || !keyHex) { setError('No capsule link detected.'); setStatus(''); return }
      setStatus('Opening your capsule...')
      await sodium.ready
      const key = sodium.from_hex(keyHex)
      const response = await fetch(url)
      if (!response.ok) throw new Error('Could not fetch capsule')
      const buffer = await response.arrayBuffer()
      const combined = new Uint8Array(buffer)
      const nonce = combined.slice(0, sodium.crypto_secretbox_NONCEBYTES)
      const ciphertext = combined.slice(sodium.crypto_secretbox_NONCEBYTES)
      const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key)
      const parsed = []
      let offset = 0
      while (offset < decrypted.length) {
        const nameLen = new DataView(decrypted.buffer, decrypted.byteOffset + offset, 4).getUint32(0, true); offset += 4
        const name = new TextDecoder().decode(decrypted.slice(offset, offset + nameLen)); offset += nameLen
        const typeLen = new DataView(decrypted.buffer, decrypted.byteOffset + offset, 4).getUint32(0, true); offset += 4
        const type = new TextDecoder().decode(decrypted.slice(offset, offset + typeLen)); offset += typeLen
        const dataLen = Number(new DataView(decrypted.buffer, decrypted.byteOffset + offset, 8).getBigUint64(0, true)); offset += 8
        const data = decrypted.slice(offset, offset + dataLen); offset += dataLen
        let previewUrl = null
        if (type.startsWith('image/')) previewUrl = URL.createObjectURL(new Blob([data], { type }))
        parsed.push({ name, type, data, previewUrl })
      }
      setFiles(parsed)
      setStatus('')
      const params2 = new URLSearchParams(window.location.search)
      const proEmail = params2.get('pro')
      const recipientEmail = params2.get('recipient')
      if (proEmail) {
        const brandingRes = await fetch(`/api/get-branding?email=${encodeURIComponent(proEmail)}`)
        if (brandingRes.ok) {
          const brandingData = await brandingRes.json()
          if (brandingData?.notification_email) {
            fetch('/api/send-notification', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ notificationEmail: brandingData.notification_email, senderEmail: proEmail, recipientEmail }) })
          }
        }
      } else if (recipientEmail) {
        fetch('/api/send-notification', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ notificationEmail: recipientEmail, senderEmail: null, recipientEmail, freeNotification: true }) })
      }
    } catch(e) { setError('Could not open capsule. The link may be invalid.'); setStatus('') }
  }

  function downloadFile(file) {
    const blob = new Blob([file.data], { type: file.type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = file.name; a.click()
    URL.revokeObjectURL(url)
  }

  function formatTimeLeft(ms) {
    const totalSeconds = Math.floor(ms / 1000)
    return { hours: Math.floor(totalSeconds / 3600), minutes: Math.floor((totalSeconds % 3600) / 60), seconds: totalSeconds % 60 }
  }

  const accentColour = branding?.accent_colour || '#1a365d'

  // LOCKED VIEW
  if (locked && timeLeft) {
    const { hours, minutes, seconds } = formatTimeLeft(timeLeft)
    const unlockDate = new Date(unlockTime).toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    const unlockTimeStr = new Date(unlockTime).toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' })
    return (
      <div style={{minHeight:'100vh',background:'#0d1117',fontFamily:'system-ui,sans-serif'}}>
        <header style={{background:accentColour,padding:'20px',textAlign:'center',position:'relative'}}>
          {branding && (
            <div style={{position:'absolute',top:'12px',right:'12px',background:'linear-gradient(135deg,#d4a017,#f5c842)',borderRadius:'8px',padding:'4px 10px',display:'flex',alignItems:'center',gap:'4px'}}>
              <span style={{fontSize:'12px'}}>🛡️</span>
              <span style={{color:'white',fontWeight:'bold',fontSize:'11px',letterSpacing:'0.5px'}}>PRO</span>
            </div>
          )}
          {branding?.logo_url
            ? <img src={branding.logo_url} alt="Logo" style={{height:'50px',display:'block',margin:'0 auto 10px'}} />
            : <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
                <img src={USC_LOGO} alt="USC Logo" style={{height:'50px',width:'auto'}} />
                <h1 style={{color:'white',margin:0,fontSize:'24px'}}>Universal Send Capsule™</h1>
                <p style={{color:'#90cdf4',margin:0,fontSize:'14px'}}>Send your work. Control how it's received.</p>
              </div>
          }
        </header>
        <main style={{maxWidth:'600px',margin:'40px auto',padding:'0 20px'}}>
          <div style={{background:'#161b22',borderRadius:'12px',padding:'32px',border:'1px solid #21262d',textAlign:'center'}}>
            <div style={{fontSize:'64px',marginBottom:'16px'}}>🔒</div>
            <h2 style={{color:'white',fontSize:'24px'}}>Your Project is Sealed & Ready!</h2>
            <p style={{color:'#8b949e'}}>The work is finished and waiting for its official debut.</p>
            <p style={{color:'#8b949e'}}>Access will be granted on <strong style={{color:'white'}}>{unlockDate}</strong> at <strong style={{color:'white'}}>{unlockTimeStr}</strong> your local time.</p>
            <div style={{display:'flex',gap:'16px',justifyContent:'center',margin:'32px 0'}}>
              {[{ value: String(hours).padStart(2,'0'), label:'HRS' },{ value: String(minutes).padStart(2,'0'), label:'MIN' },{ value: String(seconds).padStart(2,'0'), label:'SEC' }].map(({ value, label }) => (
                <div key={label} style={{textAlign:'center'}}>
                  <div style={{background:'#0d1117',border:`2px solid ${accentColour}`,borderRadius:'8px',padding:'16px 20px',fontSize:'40px',fontWeight:'bold',color:accentColour,minWidth:'70px'}}>{value}</div>
                  <div style={{fontSize:'12px',color:'#8b949e',marginTop:'6px',fontWeight:'bold'}}>{label}</div>
                </div>
              ))}
            </div>
            {branding?.sender_message && (
              <div style={{background:'#0d1117',borderLeft:`4px solid ${accentColour}`,padding:'16px',borderRadius:'6px',marginBottom:'24px',textAlign:'left'}}>
                <p style={{margin:0,color:'#8b949e'}}>{branding.sender_message}</p>
              </div>
            )}
            <div style={{background:'#0f2a1a',border:'1px solid #166534',borderRadius:'8px',padding:'12px 16px',marginTop:'24px'}}>
              <p style={{margin:0,fontSize:'13px',color:'#4ade80'}}>💡 <strong>Don't lose access</strong> — bookmark this page or save the link. You can return anytime to check the countdown.</p>
            </div>
            {senderEmail && (
              <p style={{color:'#8b949e',fontSize:'14px',marginTop:'24px'}}>
                Need it sooner? <a href={`mailto:${senderEmail}`} style={{color:accentColour}}>Contact {senderEmail} for an early release.</a>
              </p>
            )}
            {branding && (
              <p style={{marginTop:'32px',color:'#8b949e',fontSize:'13px'}}>
                Delivered by {branding.sender_name || branding.email} · <a href="/" style={{color:'#8b949e'}}>Powered by USC</a> · © 2026 Universal Send Capsule™
              </p>
            )}
          </div>
        </main>
      </div>
    )
  }

  // UNLOCKED VIEW
  return (
    <div style={{minHeight:'100vh',background:'#0d1117',fontFamily:'system-ui,sans-serif'}}>
      <header style={{background:accentColour,padding:'20px',textAlign:'center',position:'relative'}}>
        {branding && (
          <div style={{position:'absolute',top:'12px',right:'12px',background:'linear-gradient(135deg,#d4a017,#f5c842)',borderRadius:'8px',padding:'4px 10px',display:'flex',alignItems:'center',gap:'4px'}}>
            <span style={{fontSize:'12px'}}>🛡️</span>
            <span style={{color:'white',fontWeight:'bold',fontSize:'11px',letterSpacing:'0.5px'}}>PRO</span>
          </div>
        )}
        {branding?.logo_url
          ? <img src={branding.logo_url} alt="Logo" style={{height:'50px',display:'block',margin:'0 auto 10px'}} />
          : <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
              <img src={USC_LOGO} alt="USC Logo" style={{height:'50px',width:'auto'}} />
              <h1 style={{color:'white',margin:0,fontSize:'24px'}}>Universal Send Capsule™</h1>
              <p style={{color:'#90cdf4',margin:0,fontSize:'14px'}}>Send your work. Control how it's received.</p>
            </div>
        }
      </header>
      <main style={{maxWidth:'600px',margin:'40px auto',padding:'0 20px'}}>
        <div style={{background:'#161b22',borderRadius:'12px',padding:'32px',border:'1px solid #21262d'}}>
          {branding?.sender_message && (
            <div style={{background:'#0d1117',borderLeft:`4px solid ${accentColour}`,padding:'16px',borderRadius:'6px',marginBottom:'24px'}}>
              <p style={{margin:0,fontSize:'16px',color:'#8b949e'}}>{branding.sender_message}</p>
            </div>
          )}
          <h2 style={{color:accentColour,marginTop:0}}>Your Capsule</h2>
          {status && <p style={{color:'#60a5fa'}}>{status}</p>}
          {error && <p style={{color:'#f87171'}}>{error}</p>}
          {files.length > 0 && (
            <div style={{marginTop:'20px'}}>
              <p style={{color:'#8b949e'}}>Your capsule contains {files.length} file(s):</p>
              {files.map((file,i) => (
                <div key={i} style={{marginBottom:'16px',background:'#0d1117',borderRadius:'8px',overflow:'hidden',border:'1px solid #21262d'}}>
                  {file.previewUrl && (
                    <div style={{position:'relative',overflow:'hidden',borderRadius:'8px 8px 0 0'}}>
                      <img src={file.previewUrl} alt={file.name} style={{width:'100%',maxHeight:'200px',objectFit:'cover',filter:'blur(12px)',transform:'scale(1.05)'}} />
                      <div style={{position:'absolute',bottom:'8px',left:'0',right:'0',textAlign:'center'}}>
                        <span style={{background:'rgba(0,0,0,0.7)',color:'white',padding:'4px 12px',borderRadius:'12px',fontSize:'12px'}}>🔒 Preview blurred for security</span>
                      </div>
                    </div>
                  )}
                  <div style={{padding:'10px 12px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                      <div style={{minWidth:0}}>
                        <span style={{fontWeight:'500',wordBreak:'break-all',color:'white'}}>
                          {new URLSearchParams(window.location.search).get('name') || file.name}
                        </span>
                        <span style={{color:'#8b949e',fontSize:'12px',marginLeft:'8px'}}>
                          {(file.data.length / 1024 / 1024).toFixed(2)}MB
                        </span>
                      </div>
                      <button onClick={() => downloadFile(file)} style={{background:accentColour,color:'white',border:'none',padding:'8px 20px',borderRadius:'6px',cursor:'pointer',flexShrink:0,width:'100%',marginTop:'8px',fontWeight:'bold'}}>
                        ⬇️ Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {branding && (
            <div style={{marginTop:'32px',textAlign:'center'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'#1a1500',border:'1px solid #854d0e',borderRadius:'8px',padding:'8px 16px',marginBottom:'8px'}}>
                <span style={{background:'linear-gradient(135deg,#d4a017,#f5c842)',borderRadius:'4px',padding:'2px 8px',color:'white',fontWeight:'bold',fontSize:'11px',letterSpacing:'0.5px'}}>PRO VERIFIED</span>
                <span style={{color:'#8b949e',fontSize:'13px'}}>Delivered by <strong style={{color:'white'}}>{branding.sender_name || branding.email}</strong> via Universal Send Capsule</span>
              </div>
              <p style={{color:'#8b949e',fontSize:'12px',margin:'4px 0 0'}}>
                <a href="/" style={{color:'#8b949e'}}>Powered by USC</a> · © 2026 Universal Send Capsule™
              </p>
            </div>
          )}
          {files.length > 0 && (
            <div style={{marginTop:'24px',padding:'16px',background:'#0f2a1a',borderRadius:'8px',textAlign:'center',border:'1px solid #166534'}}>
              <p style={{margin:'0 0 12px',fontSize:'16px',color:'white'}}>🚀 <strong>Want to send something like this?</strong></p>
              <a href="https://universalsendcapsule.com" style={{display:'inline-block',background:'#3b82f6',color:'white',padding:'12px 28px',borderRadius:'8px',textDecoration:'none',fontSize:'16px',fontWeight:'bold'}}>
                Create Your Own Capsule
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}