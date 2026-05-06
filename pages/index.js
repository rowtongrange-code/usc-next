import { useState, useEffect } from 'react'
import sodium from 'libsodium-wrappers'

const USC_LOGO = "https://wmycyifiudnidhn0.public.blob.vercel-storage.com/logos/usc-pro-logo-1776889474418-w5APeQTGMpuAt9U0RcaVc9AC3QtBqb.png"

function Sidebar({ view, setView }) {
  return (
    <div style={{
      width:'80px',
      minHeight:'100vh',
      background:'#0d1117',
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      paddingTop:'20px',
      gap:'8px',
      borderRight:'1px solid #21262d',
      position:'fixed',
      left:0,
      top:0,
      zIndex:100
    }}>
      <img src={USC_LOGO} alt="USC" style={{width:'40px',height:'40px',marginBottom:'16px'}} />
      
      {[
        { id:'home', icon:'🏠', label:'Home' },
        { id:'create', icon:'📤', label:'Create' },
        { id:'open', icon:'📨', label:'Open' },
        { id:'shelf', label:'Shelf', icon:'📂', pro:true },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => item.id === 'shelf' ? window.location.href='/shelf' : setView(item.id)}
          style={{
            background: view === item.id ? '#1f2937' : 'transparent',
            border:'none',
            borderRadius:'12px',
            padding:'10px',
            cursor:'pointer',
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            gap:'4px',
            width:'64px',
            transition:'background 0.2s'
          }}
        >
          <span style={{fontSize:'22px'}}>{item.icon}</span>
          <span style={{color: view === item.id ? '#a78bfa' : '#8b949e',fontSize:'10px',fontWeight:'500'}}>{item.label}</span>
          {item.pro && <span style={{background:'#553c9a',color:'white',fontSize:'8px',padding:'1px 4px',borderRadius:'4px'}}>PRO</span>}
        </button>
      ))}

      <div style={{flex:1}} />

      <a href="/pro" style={{
        background:'transparent',
        border:'none',
        borderRadius:'12px',
        padding:'10px',
        cursor:'pointer',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        gap:'4px',
        width:'64px',
        textDecoration:'none',
        marginBottom:'8px'
      }}>
        <span style={{fontSize:'22px'}}>⭐</span>
        <span style={{color:'#d69e2e',fontSize:'10px',fontWeight:'500'}}>Go Pro</span>
      </a>

      <a href="/dashboard" style={{
        background:'transparent',
        border:'none',
        borderRadius:'12px',
        padding:'10px',
        cursor:'pointer',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        gap:'4px',
        width:'64px',
        textDecoration:'none',
        marginBottom:'20px'
      }}>
        <span style={{fontSize:'22px'}}>⚙️</span>
        <span style={{color:'#8b949e',fontSize:'10px',fontWeight:'500'}}>Settings</span>
      </a>
    </div>
  )
}

export default function Home() {
  const [view, setView] = useState('home')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('from_shelf') === 'true') {
      setView('create')
    }
  }, [])

  return (
    <div style={{minHeight:'100vh',background:'#0d1117',fontFamily:'system-ui,sans-serif',display:'flex'}}>
      <Sidebar view={view} setView={setView} />
      <div style={{marginLeft:'80px',flex:1,minHeight:'100vh'}}>
        {view === 'home' && <HomeContent setView={setView} />}
        {view === 'create' && <CreateCapsule />}
        {view === 'open' && <OpenCapsule />}
      </div>
    </div>
  )
}

function HomeContent({ setView }) {
  return (
    <div style={{padding:'32px 24px',maxWidth:'900px',margin:'0 auto'}}>
      {/* Hero */}
      <div style={{marginBottom:'32px'}}>
        <h1 style={{color:'white',fontSize:'32px',fontWeight:'700',margin:'0 0 8px'}}>
          Universal Send Capsule™
        </h1>
        <p style={{color:'#8b949e',fontSize:'16px',margin:0}}>
          Send your work. Control how it's received.
        </p>
      </div>

      {/* Action Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'16px',marginBottom:'24px'}}>
        {[
          { icon:'📤', title:'Create Capsule', desc:'Seal your files in a secure encrypted capsule', color:'#3b82f6', action:() => setView('create') },
          { icon:'📨', title:'Open Capsule', desc:'Open a capsule using a link', color:'#10b981', action:() => setView('open') },
          { icon:'⚙️', title:'Dashboard', desc:'Manage your Pro branding settings', color:'#8b5cf6', action:() => window.location.href='/dashboard' },
        ].map((card) => (
          <button
            key={card.title}
            onClick={card.action}
            style={{
              background:'#161b22',
              border:'1px solid #21262d',
              borderRadius:'16px',
              padding:'24px',
              cursor:'pointer',
              textAlign:'left',
              transition:'border-color 0.2s',
              width:'100%'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#21262d'}
          >
            <div style={{
              width:'48px',height:'48px',borderRadius:'12px',
              background:`${card.color}22`,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:'24px',marginBottom:'16px'
            }}>
              {card.icon}
            </div>
            <h3 style={{color:'white',margin:'0 0 8px',fontSize:'18px'}}>{card.title}</h3>
            <p style={{color:'#8b949e',margin:0,fontSize:'14px'}}>{card.desc}</p>
          </button>
        ))}
      </div>

      {/* My Shelf Banner */}
      <div style={{
        background:'linear-gradient(135deg,#1e1b4b,#2d1b69)',
        border:'1px solid #4c1d95',
        borderRadius:'16px',
        padding:'20px 24px',
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        marginBottom:'24px',
        cursor:'pointer'
      }}
        onClick={() => window.location.href='/shelf'}
      >
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <span style={{fontSize:'36px'}}>📂</span>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
              <span style={{color:'white',fontWeight:'bold',fontSize:'18px'}}>My Shelf</span>
              <span style={{background:'#553c9a',color:'white',fontSize:'11px',fontWeight:'bold',padding:'2px 8px',borderRadius:'12px'}}>PRO</span>
            </div>
            <p style={{color:'#a78bfa',margin:0,fontSize:'14px'}}>Save your most-used files for one-tap delivery.</p>
          </div>
        </div>
        <span style={{color:'#a78bfa',fontSize:'24px'}}>›</span>
      </div>

      {/* Feature Strip */}
      <div style={{
        background:'#161b22',
        border:'1px solid #21262d',
        borderRadius:'16px',
        padding:'24px',
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
        gap:'20px'
      }}>
        {[
          { icon:'🔒', title:'Private by design', desc:'Encrypted before it leaves your device' },
          { icon:'🔗', title:'Share with anyone', desc:'No account needed to open' },
          { icon:'♾️', title:'No size limits', desc:'Send anything, any size' },
          { icon:'⏰', title:'You\'re in control', desc:'Time lock, branding and more' },
        ].map(f => (
          <div key={f.title}>
            <div style={{fontSize:'24px',marginBottom:'8px'}}>{f.icon}</div>
            <h4 style={{color:'white',margin:'0 0 4px',fontSize:'14px'}}>{f.title}</h4>
            <p style={{color:'#8b949e',margin:0,fontSize:'12px'}}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CreateCapsule() {
  const [files, setFiles] = useState([])
  const [capsuleLink, setCapsuleLink] = useState('')
  const [capsuleName, setCapsuleName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [unlockLink, setUnlockLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [unlockDate, setUnlockDate] = useState('')
  const [unlockTime, setUnlockTime] = useState('')
  const [isProVerified, setIsProVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [shelfLoaded, setShelfLoaded] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('from_shelf') === 'true') {
      const fileData = sessionStorage.getItem('shelf_file_data')
      const fileName = sessionStorage.getItem('shelf_file_name')
      const fileType = sessionStorage.getItem('shelf_file_type')
      if (fileData && fileName) {
        fetch(fileData)
          .then(r => r.blob())
          .then(blob => {
            const file = new File([blob], fileName, { type: fileType })
            setFiles([file])
            setCapsuleName(fileName.replace(/\.[^/.]+$/, ''))
            setShelfLoaded(true)
            sessionStorage.removeItem('shelf_file_data')
            sessionStorage.removeItem('shelf_file_name')
            sessionStorage.removeItem('shelf_file_type')
          })
      }
    }
  }, [])

  async function verifyPro() {
    if (!senderEmail) return setVerifyError('Please enter your email first')
    setVerifying(true)
    setVerifyError('')
    try {
      const response = await fetch('/api/check-subscriber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: senderEmail })
      })
      const data = await response.json()
      if (data.subscribed) {
        setIsProVerified(true)
      } else {
        setVerifyError('No active Pro subscription found for this email.')
      }
    } catch (err) {
      setVerifyError('Could not verify. Please try again.')
    }
    setVerifying(false)
  }

  async function createCapsule() {
    if (files.length === 0) return alert('Please select at least one file')
    setLoading(true)
    setProgress('Preparing your files...')

    try {
      await sodium.ready
      const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES)
      const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
      setProgress('Encrypting your capsule...')

      const fileBuffers = []
      let totalSize = 0
      for (const file of files) {
        const nameBytes = new TextEncoder().encode(file.name)
        const typeBytes = new TextEncoder().encode(file.type)
        const dataBytes = new Uint8Array(await file.arrayBuffer())
        const nameLen = new Uint32Array([nameBytes.length])
        const typeLen = new Uint32Array([typeBytes.length])
        const dataLen = new BigUint64Array([BigInt(dataBytes.length)])
        fileBuffers.push({ nameLen, nameBytes, typeLen, typeBytes, dataLen, dataBytes })
        totalSize += 4 + nameBytes.length + 4 + typeBytes.length + 8 + dataBytes.length
      }

      const payload = new Uint8Array(totalSize)
      let offset = 0
      for (const f of fileBuffers) {
        payload.set(new Uint8Array(f.nameLen.buffer), offset); offset += 4
        payload.set(f.nameBytes, offset); offset += f.nameBytes.length
        payload.set(new Uint8Array(f.typeLen.buffer), offset); offset += 4
        payload.set(f.typeBytes, offset); offset += f.typeBytes.length
        payload.set(new Uint8Array(f.dataLen.buffer), offset); offset += 8
        payload.set(f.dataBytes, offset); offset += f.dataBytes.length
      }

      const encrypted = sodium.crypto_secretbox_easy(payload, nonce, key)
      const combined = new Uint8Array(nonce.length + encrypted.length)
      combined.set(nonce)
      combined.set(encrypted, nonce.length)

      setProgress('Uploading your capsule...')
      const safeName = capsuleName
        ? capsuleName.replace(/[^a-zA-Z0-9_-]/g, '_')
        : (files.length === 1 ? files[0].name.replace(/\.[^/.]+$/, '') : `${files.length}_files`)
      const filename = `${safeName}.enc`

      const { upload } = await import('@vercel/blob/client')
      const blobResult = await upload(filename, new Blob([combined], { type: 'application/octet-stream' }), {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })

      const url = blobResult.url
      const keyHex = sodium.to_hex(key)
      const proParam = senderEmail ? `&pro=${encodeURIComponent(senderEmail)}` : ''

      let lockParam = ''
      let unlockLinkGenerated = ''
      if (senderEmail && unlockDate && unlockTime) {
        const localDateTime = new Date(`${unlockDate}T${unlockTime}`)
        const utcTimestamp = localDateTime.getTime()
        lockParam = `&unlock=${utcTimestamp}`
        unlockLinkGenerated = `${window.location.origin}/open?url=${encodeURIComponent(url)}${proParam}#${keyHex}`
        setUnlockLink(unlockLinkGenerated)
      }

      const nameParam = capsuleName ? `&name=${encodeURIComponent(capsuleName)}` : ''
      const recipientParam = recipientEmail ? `&recipient=${encodeURIComponent(recipientEmail)}` : ''
      const link = `${window.location.origin}/open?url=${encodeURIComponent(url)}${proParam}${lockParam}${nameParam}${recipientParam}#${keyHex}`
      setProgress('')
      setCapsuleLink(link)
    } catch (err) {
      alert('Upload failed: ' + err.message)
      setProgress('')
    }
    setLoading(false)
  }

  const inputStyle = {
    width:'100%',padding:'10px',borderRadius:'8px',
    border:'1px solid #30363d',fontSize:'16px',
    boxSizing:'border-box',background:'#0d1117',
    color:'white'
  }

  return (
    <div style={{padding:'32px 24px',maxWidth:'700px',margin:'0 auto'}}>
      <h2 style={{color:'white',marginTop:0}}>Create a Capsule</h2>

      {shelfLoaded && (
        <div style={{marginBottom:'16px',padding:'12px',background:'#0f2a1a',borderRadius:'8px',border:'1px solid #166534'}}>
          <p style={{margin:0,color:'#4ade80',fontSize:'14px'}}>📂 <strong>Shelf asset loaded:</strong> {capsuleName} — {(files.reduce((a,f) => a+f.size,0)/1024/1024).toFixed(2)}MB</p>
        </div>
      )}

      <div style={{marginBottom:'16px'}}>
        <label style={{display:'block',color:'#8b949e',marginBottom:'6px',fontSize:'14px'}}>Your Email (Pro users only)</label>
        <input type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
        <p style={{color:'#8b949e',fontSize:'13px',marginTop:'4px'}}>Leave blank for standard capsule</p>
        {senderEmail && !isProVerified && (
          <button onClick={verifyPro} disabled={verifying} style={{background:'#553c9a',color:'white',border:'none',padding:'8px 20px',borderRadius:'6px',cursor:'pointer',fontSize:'14px',marginTop:'8px'}}>
            {verifying ? 'Verifying...' : '⭐ Verify Pro Access'}
          </button>
        )}
        {verifyError && <p style={{color:'#f87171',fontSize:'13px',marginTop:'6px'}}>{verifyError}</p>}
        {isProVerified && <p style={{color:'#4ade80',fontSize:'13px',marginTop:'6px'}}>✅ Pro access verified!</p>}
      </div>

      {isProVerified && (
        <div style={{marginBottom:'16px',padding:'16px',background:'#161b22',borderRadius:'8px',border:'1px solid #30363d'}}>
          <label style={{display:'block',color:'white',fontWeight:'bold',marginBottom:'6px'}}>⏰ Time Lock (optional)</label>
          <p style={{color:'#8b949e',fontSize:'13px',marginTop:'0',marginBottom:'12px'}}>Set a date and time when your capsule will unlock.</p>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
            <div style={{flex:1}}>
              <label style={{display:'block',fontSize:'13px',color:'#8b949e',marginBottom:'4px'}}>Unlock Date</label>
              <input type="date" value={unlockDate} onChange={e => setUnlockDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{flex:1}}>
              <label style={{display:'block',fontSize:'13px',color:'#8b949e',marginBottom:'4px'}}>Unlock Time</label>
              <input type="time" value={unlockTime} onChange={e => setUnlockTime(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>
      )}

      <div style={{marginBottom:'16px'}}>
        <label style={{display:'block',color:'#8b949e',marginBottom:'6px',fontSize:'14px'}}>Capsule Name (optional)</label>
        <input type="text" value={capsuleName} onChange={e => setCapsuleName(e.target.value)} placeholder="e.g. Brand_Assets_Final" style={inputStyle} />
        <p style={{color:'#8b949e',fontSize:'13px',marginTop:'4px'}}>This is what your recipient will see as the download name</p>
      </div>

      <div style={{marginBottom:'16px'}}>
        <label style={{display:'block',color:'#8b949e',marginBottom:'6px',fontSize:'14px'}}>Recipient's Email (optional)</label>
        <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="client@example.com" style={inputStyle} />
        <p style={{color:'#8b949e',fontSize:'13px',marginTop:'4px'}}>We'll notify you when they open it</p>
      </div>

      {!shelfLoaded && (
        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block',color:'#8b949e',marginBottom:'6px',fontSize:'14px'}}>Select Files</label>
          <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files))}
            style={{...inputStyle, padding:'8px'}} />
          {files.length > 0 && <p style={{color:'#8b949e',fontSize:'13px',marginTop:'4px'}}>{files.length} file(s) — {(files.reduce((a,f) => a+f.size,0)/1024/1024).toFixed(2)}MB</p>}
        </div>
      )}

      <button onClick={createCapsule} disabled={loading} style={{background:'#3b82f6',color:'white',border:'none',padding:'14px 28px',borderRadius:'8px',cursor:'pointer',fontSize:'16px',width:'100%',fontWeight:'bold'}}>
        {loading ? progress || 'Creating...' : '📦 Create Capsule'}
      </button>

      {capsuleLink && (
        <div style={{marginTop:'20px',padding:'16px',background:'#0f2a1a',borderRadius:'8px',border:'1px solid #166534'}}>
          <p style={{color:'#4ade80',margin:'0 0 8px'}}>✅ Your capsule is ready!</p>
          <label style={{display:'block',color:'#8b949e',fontWeight:'bold',marginBottom:'4px',fontSize:'14px'}}>Send this link to your recipient:</label>
          <textarea readOnly value={capsuleLink} rows={4} style={{...inputStyle,resize:'none'}}/>
          <button onClick={() => { navigator.clipboard.writeText(capsuleLink); alert('Link copied!') }}
            style={{marginTop:'8px',background:'#166534',color:'white',border:'none',padding:'8px 20px',borderRadius:'6px',cursor:'pointer'}}>
            Copy Recipient Link
          </button>
          {unlockLink && (
            <div style={{marginTop:'16px',padding:'12px',background:'#1a1500',borderRadius:'6px',border:'1px solid #854d0e'}}>
              <p style={{fontWeight:'bold',margin:'0 0 4px',color:'#fbbf24'}}>🔑 Your Early Unlock Link — Keep this private!</p>
              <textarea readOnly value={unlockLink} rows={3} style={{...inputStyle,fontSize:'12px',marginTop:'8px',resize:'none'}}/>
              <button onClick={() => { navigator.clipboard.writeText(unlockLink); alert('Unlock link copied!') }}
                style={{marginTop:'8px',background:'#854d0e',color:'white',border:'none',padding:'8px 20px',borderRadius:'6px',cursor:'pointer'}}>
                Copy Unlock Link
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function OpenCapsule() {
  const [pastedLink, setPastedLink] = useState('')
  const [error, setError] = useState('')

  async function openFromPaste() {
    if (!pastedLink) return setError('Please paste your capsule link first')
    try {
      const urlObj = new URL(pastedLink)
      const capsuleUrl = urlObj.searchParams.get('url')
      const keyHex = urlObj.hash.slice(1)
      if (!capsuleUrl || !keyHex) return setError('This does not look like a valid capsule link')
      window.location.href = pastedLink
    } catch(e) {
      setError('This does not look like a valid capsule link')
    }
  }

  const inputStyle = {
    width:'100%',padding:'10px',borderRadius:'8px',
    border:'1px solid #30363d',fontSize:'16px',
    boxSizing:'border-box',background:'#0d1117',
    color:'white'
  }

  return (
    <div style={{padding:'32px 24px',maxWidth:'700px',margin:'0 auto'}}>
      <h2 style={{color:'white',marginTop:0}}>Open a Capsule</h2>
      <div style={{background:'#161b22',border:'1px solid #21262d',borderRadius:'16px',padding:'24px'}}>
        <label style={{display:'block',color:'#8b949e',marginBottom:'6px',fontSize:'14px'}}>Have a Capsule Link?</label>
        <input type="text" value={pastedLink} onChange={e => { setPastedLink(e.target.value); setError('') }}
          placeholder="Paste your capsule link here..."
          style={inputStyle} />
        {error && <p style={{color:'#f87171',marginTop:'8px',fontSize:'14px'}}>{error}</p>}
        <button onClick={openFromPaste}
          style={{background:'#10b981',color:'white',border:'none',padding:'12px 28px',borderRadius:'8px',cursor:'pointer',fontSize:'16px',width:'100%',marginTop:'16px',fontWeight:'bold'}}>
          🔓 Unseal Capsule
        </button>
      </div>
    </div>
  )
}