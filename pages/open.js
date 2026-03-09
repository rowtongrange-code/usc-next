import { useState, useEffect } from 'react'
import sodium from 'libsodium-wrappers'

export default function OpenPage() {
  const [status, setStatus] = useState('Opening your capsule...')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    openCapsule()
  }, [])

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
    <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
      <header style={{background:'#1a365d',padding:'20px',textAlign:'center'}}>
        <h1 style={{color:'white',margin:0,fontSize:'28px'}}>📦 Universal Send Capsule</h1>
        <p style={{color:'#90cdf4',margin:'8px 0 0'}}>Send, receive and save anything. Simply.</p>
      </header>
      <main style={{maxWidth:'600px',margin:'40px auto',padding:'0 20px'}}>
        <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
          <h2>Open Capsule</h2>
          {status && <p style={{color:'#2b6cb0'}}>{status}</p>}
          {error && <p style={{color:'red'}}>{error}</p>}
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
      </main>
    </div>
  )
}