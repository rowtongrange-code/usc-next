import { useState } from 'react'
import sodium from 'libsodium-wrappers'

export default function Home() {
  const [view, setView] = useState('home')

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
      <header style={{background:'#1a365d',padding:'20px',textAlign:'center'}}>
        <h1 style={{color:'white',margin:0,fontSize:'28px'}}>📦 Universal Send Capsule</h1>
        <p style={{color:'#90cdf4',margin:'8px 0 0'}}>Send, receive and save anything. Simply.</p>
        <div style={{marginTop:'16px',display:'flex',gap:'12px',justifyContent:'center'}}>
          <button onClick={() => setView('create')} style={{background:'#3182ce',color:'white',border:'none',padding:'10px 24px',borderRadius:'8px',cursor:'pointer',fontSize:'16px'}}>Create Capsule</button>
          <button onClick={() => setView('open')} style={{background:'#2c7a7b',color:'white',border:'none',padding:'10px 24px',borderRadius:'8px',cursor:'pointer',fontSize:'16px'}}>Open Capsule</button>
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
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')

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

     const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-filename': filename,
          'Content-Type': 'application/octet-stream',
        },
        body: combined,
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Server error: ${errText}`)
      }

      const { url } = await response.json()
      const keyHex = sodium.to_hex(key)
      const link = `${window.location.origin}/open?url=${encodeURIComponent(url)}#${keyHex}`
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
          <textarea readOnly value={capsuleLink} rows={4} style={{width:'100%',padding:'8px',borderRadius:'4px',border:'1px solid #ccc'}}/>
          <button onClick={() => { navigator.clipboard.writeText(capsuleLink); alert('Link copied!') }} style={{marginTop:'8px',background:'#38a169',color:'white',border:'none',padding:'8px 20px',borderRadius:'6px',cursor:'pointer'}}>
            Copy Link
          </button>
        </div>
      )}
    </div>
  )
}

function OpenCapsule() {
  const [status, setStatus] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')

  async function openFromUrl() {
    const params = new URLSearchParams(window.location.search)
    const url = params.get('url')
    const keyHex = window.location.hash.slice(1)
    if (!url || !keyHex) return setError('No capsule link detected.')
    await openCapsule(url, keyHex)
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
      <p>Paste your capsule link in the browser address bar, or click below if you already have one.</p>
      <button onClick={openFromUrl} style={{background:'#2c7a7b',color:'white',border:'none',padding:'12px 28px',borderRadius:'8px',cursor:'pointer',fontSize:'16px'}}>Open Capsule from URL</button>
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
