import { useState } from 'react'
import sodium from 'libsodium-wrappers'

export default function Home() {
  const [view, setView] = useState('home')

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
      <header style={{background:'#1a365d',padding:'20px',textAlign:'center'}}>
        <h1 style={{color:'white',margin:0,fontSize:'28px'}}>📦 Universal Send Capsule™</h1>
        <p style={{color:'#90cdf4',margin:'8px 0 0'}}>Send, receive and save anything. Simply.</p>
        <div style={{marginTop:'16px',display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={() => setView('create')} style={{background:'#3182ce',color:'white',border:'none',padding:'10px 24px',borderRadius:'8px',cursor:'pointer',fontSize:'16px'}}>Create Capsule</button>
          <button onClick={() => setView('open')} style={{background:'#2c7a7b',color:'white',border:'none',padding:'10px 24px',borderRadius:'8px',cursor:'pointer',fontSize:'16px'}}>Open Capsule</button>
          <a href="/pro" style={{background:'#d69e2e',color:'white',border:'none',padding:'10px 24px',borderRadius:'8px',cursor:'pointer',fontSize:'16px',textDecoration:'none'}}>⭐ Go Pro</a>
          <a href="/dashboard" style={{background:'#553c9a',color:'white',border:'none',padding:'10px 24px',borderRadius:'8px',cursor:'pointer',fontSize:'16px',textDecoration:'none'}}>Dashboard</a>
        </div>
      </header>
      <main style={{maxWidth:'600px',margin:'40px auto',padding:'0 20px'}}>
        {view === 'home' && <Home_Content />}
        {view === 'create' && <CreateCapsule />}
        {view === 'open' && <OpenCapsule />}
      </main>
    </div>
  )
}

function Home_Content() {
  return (
    <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
      <h2>Welcome to USC</h2>
      <p>Seal any file into a capsule and share it with anyone, anywhere. No account needed. No size limits.</p>
      <p>Your files are encrypted before they leave your device. Only the person with your link can open them.</p>
    </div>
  )
}

function CreateCapsule() {
  const [files, setFiles] = useState([])
  const [capsuleLink, setCapsuleLink] = useState('')
  const [unlockLink, setUnlockLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [unlockDate, setUnlockDate] = useState('')
  const [unlockTime, setUnlockTime] = useState('')
  const [isProVerified, setIsProVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')

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
      const filename = `capsule-${Date.now()}.enc`

      const { upload } = await import('@vercel/blob/client')
      const blobResult = await upload(filename, new Blob([combined], { type: 'application/octet-stream' }), {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })

      const url = blobResult.url
      const keyHex = sodium.to_hex(key)
      const proParam = senderEmail ? `&pro=${encodeURIComponent(senderEmail)}` : ''

      // Handle time lock — convert local time to UTC timestamp
      let lockParam = ''
      let unlockLinkGenerated = ''
      if (senderEmail && unlockDate && unlockTime) {
        const localDateTime = new Date(`${unlockDate}T${unlockTime}`)
        const utcTimestamp = localDateTime.getTime()
        lockParam = `&unlock=${utcTimestamp}`

        // Generate the early unlock link (no lock param)
        unlockLinkGenerated = `${window.location.origin}/open?url=${encodeURIComponent(url)}${proParam}#${keyHex}`
        setUnlockLink(unlockLinkGenerated)
      }

      const link = `${window.location.origin}/open?url=${encodeURIComponent(url)}${proParam}${lockParam}#${keyHex}`
      setProgress('')
      setCapsuleLink(link)
    } catch (err) {
      alert('Upload failed: ' + err.message)
      setProgress('')
    }

    setLoading(false)
  }

  return (
    <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
      <h2>Create a Capsule</h2>
      <p>Select one or more files to seal into your capsule.</p>

      <div style={{marginBottom:'16px'}}>
        <label style={{display:'block',fontWeight:'bold',marginBottom:'6px'}}>Your Email (Pro users only)</label>
        <input
          type="email"
          value={senderEmail}
          onChange={e => setSenderEmail(e.target.value)}
          placeholder="your@email.com"
          style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box'}}
        />
        <p style={{color:'#666',fontSize:'13px',marginTop:'4px'}}>Leave blank for standard capsule</p>
        {senderEmail && !isProVerified && (
          <div style={{marginTop:'8px'}}>
            <button onClick={verifyPro} disabled={verifying} style={{background:'#553c9a',color:'white',border:'none',padding:'8px 20px',borderRadius:'6px',cursor:'pointer',fontSize:'14px'}}>
              {verifying ? 'Verifying...' : '⭐ Verify Pro Access'}
            </button>
            {verifyError && <p style={{color:'red',fontSize:'13px',marginTop:'6px'}}>{verifyError}</p>}
          </div>
        )}
        {isProVerified && <p style={{color:'#38a169',fontSize:'13px',marginTop:'6px'}}>✅ Pro access verified!</p>}
      </div>

      {isProVerified && (



        <div style={{marginBottom:'16px',padding:'16px',background:'#f7fafc',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
          <label style={{display:'block',fontWeight:'bold',marginBottom:'6px'}}>⏰ Time Lock (optional)</label>
          <p style={{color:'#666',fontSize:'13px',marginTop:'0',marginBottom:'12px'}}>Set a date and time when your capsule will unlock. Leave blank for instant access.</p>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
            <div style={{flex:1}}>
              <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'4px'}}>Unlock Date</label>
              <input
                type="date"
                value={unlockDate}
                onChange={e => setUnlockDate(e.target.value)}
                style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box'}}
              />
            </div>
            <div style={{flex:1}}>
              <label style={{display:'block',fontSize:'13px',color:'#666',marginBottom:'4px'}}>Unlock Time (your local time)</label>
              <input
                type="time"
                value={unlockTime}
                onChange={e => setUnlockTime(e.target.value)}
                style={{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box'}}
              />
            </div>
          </div>
        </div>
      )}

      <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files))} />
      {files.length > 0 && <p>{files.length} file(s) — {(files.reduce((a,f) => a+f.size,0)/1024/1024).toFixed(2)}mb</p>}
      <br/><br/>
      <button onClick={createCapsule} disabled={loading} style={{background:'#3182ce',color:'white',border:'none',padding:'12px 28px',borderRadius:'8px',cursor:'pointer',fontSize:'16px'}}>
        {loading ? 'Creating...' : 'Create Capsule'}
      </button>
      {progress && <p style={{color:'#2b6cb0',marginTop:12}}>{progress}</p>}
      {capsuleLink && (
        <div style={{marginTop:'20px',padding:'16px',background:'#f0fff4',borderRadius:'8px'}}>
          <p>✅ Your capsule is ready!</p>
          <label style={{display:'block',fontWeight:'bold',marginBottom:'4px'}}>Send this link to your recipient:</label>
          <textarea readOnly value={capsuleLink} rows={4} style={{width:'100%',padding:'8px',borderRadius:'4px',border:'1px solid #ccc',boxSizing:'border-box'}}/>
          <button onClick={() => { navigator.clipboard.writeText(capsuleLink); alert('Link copied!') }} style={{marginTop:'8px',background:'#38a169',color:'white',border:'none',padding:'8px 20px',borderRadius:'6px',cursor:'pointer'}}>
            Copy Recipient Link
          </button>

          {unlockLink && (
            <div style={{marginTop:'16px',padding:'12px',background:'#fffbeb',borderRadius:'6px',border:'1px solid #f6e05e'}}>
              <p style={{fontWeight:'bold',margin:'0 0 4px',color:'#744210'}}>🔑 Your Early Unlock Link — Keep this private!</p>
              <p style={{fontSize:'13px',color:'#744210',margin:'0 0 8px'}}>Use this link to open the capsule early if needed.</p>
              <textarea readOnly value={unlockLink} rows={3} style={{width:'100%',padding:'8px',borderRadius:'4px',border:'1px solid #f6e05e',boxSizing:'border-box',fontSize:'12px'}}/>
              <button onClick={() => { navigator.clipboard.writeText(unlockLink); alert('Unlock link copied!') }} style={{marginTop:'8px',background:'#d69e2e',color:'white',border:'none',padding:'8px 20px',borderRadius:'6px',cursor:'pointer'}}>
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
  const [status, setStatus] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [pastedLink, setPastedLink] = useState('')

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

  async function openCapsule(url, keyHex) {
    try {
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
      setStatus('Capsule opened successfully!')
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

  return (
    <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
      <h2>Open a Capsule</h2>
      <div style={{marginBottom:'16px'}}>
        <label style={{display:'block',fontWeight:'bold',marginBottom:'6px'}}>Have a Capsule Link?</label>
        <input
          type="text"
          value={pastedLink}
          onChange={e => { setPastedLink(e.target.value); setError('') }}
          placeholder="Paste your capsule link here..."
          style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box'}}
        />
      </div>
      <button onClick={openFromPaste} style={{background:'#2c7a7b',color:'white',border:'none',padding:'12px 28px',borderRadius:'8px',cursor:'pointer',fontSize:'16px',width:'100%'}}>
        🔓 Unseal Capsule
      </button>
      {status && <p style={{color:'#2b6cb0',marginTop:12}}>{status}</p>}
      {error && <p style={{color:'red',marginTop:12}}>{error}</p>}
      {files.length > 0 && (
        <div style={{marginTop:'20px'}}>
          <p>Your capsule contains {files.length} file(s):</p>
          {files.map((file,i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px',background:'#f7fafc',borderRadius:'6px',marginBottom:'8px'}}>
              <span>{file.name}</span>
              <button onClick={() => downloadFile(file)} style={{background:'#3182ce',color:'white',border:'none',padding:'6px 16px',borderRadius:'6px',cursor:'pointer'}}>Download</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}