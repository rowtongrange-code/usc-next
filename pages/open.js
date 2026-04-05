import { useState, useEffect } from 'react'
import sodium from 'libsodium-wrappers'

export default function OpenPage() {
  const [status, setStatus] = useState('Opening your capsule...')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [branding, setBranding] = useState(null)
  const [locked, setLocked] = useState(false)
  const [unlockTime, setUnlockTime] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [senderEmail, setSenderEmail] = useState('')

  useEffect(() => {
    loadBrandingAndCheck()
  }, [])

  useEffect(() => {
    if (!locked || !unlockTime) return
    const interval = setInterval(() => {
      const remaining = unlockTime - Date.now()
      if (remaining <= 0) {
        clearInterval(interval)
        setLocked(false)
        loadCapsule()
      } else {
        setTimeLeft(remaining)
      }
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
        if (res.ok) {
          const data = await res.json()
          setBranding(data)
        }
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
    } catch(e) {
      // continue
    }
    await loadCapsule()
  }

  async function loadCapsule() {
    try {
      const params = new URLSearchParams(window.location.search)
      const url = params.get('url')
      const keyHex = window.location.hash.slice(1)
      if (!url || !keyHex) {
        setError('No capsule link detected.')
        setStatus('')
        return
      }

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
        parsed.push({ name, type, data })
      }

      setFiles(parsed)
      setStatus('')

      const params2 = new URLSearchParams(window.location.search)
      const proEmail = params2.get('pro')
      if (proEmail) {
        const brandingRes = await fetch(`/api/get-branding?email=${encodeURIComponent(proEmail)}`)
        if (brandingRes.ok) {
          const brandingData = await brandingRes.json()
          if (brandingData?.notification_email) {
            fetch('/api/send-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notificationEmail: brandingData.notification_email, senderEmail: proEmail })
            })
          }
        }
      }
    } catch(e) {
      setError('Could not open capsule. The link may be invalid.')
      setStatus('')
    }
  }

  function downloadFile(file) {
    const blob = new Blob([file.data], { type: file.type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatTimeLeft(ms) {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return { hours, minutes, seconds }
  }

  const accentColour = branding?.accent_colour || '#1a365d'

  if (locked && timeLeft) {
    const { hours, minutes, seconds } = formatTimeLeft(timeLeft)
    const unlockDate = new Date(unlockTime).toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    const unlockTimeStr = new Date(unlockTime).toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' })

    return (
      <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
        <header style={{background:accentColour,padding:'20px',textAlign:'center',position:'relative'}}>
        {branding && (
          <div style={{position:'absolute',top:'12px',right:'12px',background:'linear-gradient(135deg, #d4a017, #f5c842)',borderRadius:'8px',padding:'4px 10px',display:'flex',alignItems:'center',gap:'4px'}}>
            <span style={{fontSize:'12px'}}>🛡️</span>
            <span style={{color:'white',fontWeight:'bold',fontSize:'11px',letterSpacing:'0.5px'}}>PRO</span>
          </div>
        )}
        {branding?.logo_url && (
          <img src={branding.logo_url} alt="Logo" style={{height:'50px',display:'block',margin:'0 auto 10px'}} />
        )}
        {!branding && (
          <>
            <h1 style={{color:'white',margin:0,fontSize:'28px'}}>📦 Universal Send Capsule™</h1>
            <p style={{color:'#90cdf4',margin:'8px 0 0'}}>Send, receive and save anything. Simply.</p>
          </>
        )}
      </header>
        <main style={{maxWidth:'600px',margin:'40px auto',padding:'0 20px'}}>
          <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',textAlign:'center'}}>
            <div style={{fontSize:'64px',marginBottom:'16px'}}>🔒</div>
            <h2 style={{color:accentColour,fontSize:'24px'}}>Your Project is Sealed & Ready!</h2>
            <p style={{color:'#666'}}>The work is finished and waiting for its official debut.</p>
            <p style={{color:'#666'}}>Access will be granted on <strong>{unlockDate}</strong> at <strong>{unlockTimeStr}</strong> your local time.</p>

            <div style={{display:'flex',gap:'16px',justifyContent:'center',margin:'32px 0'}}>
              {[
                { value: String(hours).padStart(2,'0'), label: 'HRS' },
                { value: String(minutes).padStart(2,'0'), label: 'MIN' },
                { value: String(seconds).padStart(2,'0'), label: 'SEC' },
              ].map(({ value, label }) => (
                <div key={label} style={{textAlign:'center'}}>
                  <div style={{background:'white',border:`2px solid ${accentColour}`,borderRadius:'8px',padding:'16px 20px',fontSize:'40px',fontWeight:'bold',color:accentColour,minWidth:'70px'}}>
                    {value}
                  </div>
                  <div style={{fontSize:'12px',color:'#999',marginTop:'6px',fontWeight:'bold'}}>{label}</div>
                </div>
              ))}
            </div>

            {branding?.sender_message && (
              <div style={{background:'#f7fafc',borderLeft:`4px solid ${accentColour}`,padding:'16px',borderRadius:'6px',marginBottom:'24px',textAlign:'left'}}>
                <p style={{margin:0,color:'#2d3748'}}>{branding.sender_message}</p>
              </div>
            )}

            {senderEmail && (
              <p style={{color:'#999',fontSize:'14px',marginTop:'24px'}}>
                Need it sooner? <a href={`mailto:${senderEmail}`} style={{color:accentColour}}>Contact {senderEmail} for an early release.</a>
              </p>
            )}

            {branding && (
              <p style={{marginTop:'32px',color:'#999',fontSize:'13px'}}>
                Delivered by {branding.email} · <a href="/" style={{color:'#999'}}>Powered by USC</a>
              </p>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
      <header style={{background:accentColour,padding:'20px',textAlign:'center',position:'relative'}}>
          {branding && (
            <div style={{position:'absolute',top:'12px',right:'12px',background:'linear-gradient(135deg, #d4a017, #f5c842)',borderRadius:'8px',padding:'4px 10px',display:'flex',alignItems:'center',gap:'4px'}}>
              <span style={{fontSize:'12px'}}>🛡️</span>
              <span style={{color:'white',fontWeight:'bold',fontSize:'11px',letterSpacing:'0.5px'}}>PRO</span>
            </div>
          )}
          {branding?.logo_url && (
            <img src={branding.logo_url} alt="Logo" style={{height:'50px',display:'block',margin:'0 auto 10px'}} />
          )}
          {!branding && (
            <>
              <h1 style={{color:'white',margin:0,fontSize:'28px'}}>📦 Universal Send Capsule™</h1>
              <p style={{color:'#90cdf4',margin:'8px 0 0'}}>Send, receive and save anything. Simply.</p>
            </>
          )}
        </header>
      <main style={{maxWidth:'600px',margin:'40px auto',padding:'0 20px'}}>
        <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
          {branding?.sender_message && (
            <div style={{background:'#f7fafc',borderLeft:`4px solid ${accentColour}`,padding:'16px',borderRadius:'6px',marginBottom:'24px'}}>
              <p style={{margin:0,fontSize:'16px',color:'#2d3748'}}>{branding.sender_message}</p>
            </div>
          )}
          <h2 style={{color:accentColour}}>Your Capsule</h2>
          {status && <p style={{color:'#2b6cb0'}}>{status}</p>}
          {error && <p style={{color:'red'}}>{error}</p>}
          {files.length > 0 && (
            <div style={{marginTop:'20px'}}>
              <p>Your capsule contains {files.length} file(s):</p>
              {files.map((file,i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px',background:'#f7fafc',borderRadius:'6px',marginBottom:'8px'}}>
                  <span>{file.name}</span>
                  <button onClick={() => downloadFile(file)} style={{background:accentColour,color:'white',border:'none',padding:'6px 16px',borderRadius:'6px',cursor:'pointer'}}>Download</button>
                </div>
              ))}
            </div>
          )}
         {branding && (
            <div style={{marginTop:'32px',textAlign:'center'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'#fffbeb',border:'1px solid #f6e05e',borderRadius:'8px',padding:'8px 16px',marginBottom:'8px'}}>
                <span style={{background:'linear-gradient(135deg, #d4a017, #f5c842)',borderRadius:'4px',padding:'2px 8px',color:'white',fontWeight:'bold',fontSize:'11px',letterSpacing:'0.5px'}}>PRO VERIFIED</span>
                <span style={{color:'#666',fontSize:'13px'}}>Delivered by {branding.email}</span>
              </div>
              <p style={{color:'#999',fontSize:'12px',margin:'4px 0 0'}}>
                <a href="/" style={{color:'#999'}}>Powered by USC</a> · © 2026 USC. Trademark Pending.
              </p>
            </div>
          )} 
        </div>
      </main>
    </div>
  )
}