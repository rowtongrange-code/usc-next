import { useState, useEffect } from 'react'
import sodium from 'libsodium-wrappers'

export default function OpenPage() {
  const [status, setStatus] = useState('Opening your capsule...')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [branding, setBranding] = useState(null)

  useEffect(() => {
    loadBrandingAndOpen()
  }, [])

  async function loadBrandingAndOpen() {
    try {
      const params = new URLSearchParams(window.location.search)
      const proEmail = params.get('pro')

      if (proEmail) {
        const res = await fetch(`/api/get-branding?email=${encodeURIComponent(proEmail)}`)
        if (res.ok) {
          const data = await res.json()
          setBranding(data)
        }
      }
    } catch(e) {
      // No branding, use default
    }
    await openCapsule()
  }

  async function openCapsule() {
    try {
      const params = new URLSearchParams(window.location.search)
      const url = params.get('url')
      const keyHex = window.location.hash.slice(1)
      if (!url || !keyHex) {
        setError('No capsule link detected.')
        setStatus('')
        return
      }

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

  const accentColour = branding?.accent_colour || '#1a365d'
  const brandName = branding?.brand_name || 'Universal Send Capsule'

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
      <header style={{background:accentColour,padding:'20px',textAlign:'center'}}>
        {branding?.logo_url && (
          <img src={branding.logo_url} alt="Logo" style={{height:'50px',marginBottom:'10px',display:'block',margin:'0 auto 10px'}} />
        )}
        {!branding && (
          <>
            <h1 style={{color:'white',margin:0,fontSize:'28px'}}>📦 Universal Send Capsule</h1>
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
            <p style={{marginTop:'32px',textAlign:'center',color:'#999',fontSize:'13px'}}>
              Delivered by {branding.logo_url ? <img src={branding.logo_url} alt="" style={{height:'16px',verticalAlign:'middle'}} /> : branding.email} · <a href="/" style={{color:'#999'}}>Powered by USC</a>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}