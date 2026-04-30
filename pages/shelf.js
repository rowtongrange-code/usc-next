import { useState, useEffect } from 'react'

const USC_LOGO = "https://wmycyifiudnidhn0.public.blob.vercel-storage.com/logos/usc-pro-logo-1776889474418-w5APeQTGMpuAt9U0RcaVc9AC3QtBqb.png"

export default function ShelfPage() {
  const [email, setEmail] = useState('')
  const [checking, setChecking] = useState(false)
  const [verified, setVerified] = useState(false)
  const [notSubscribed, setNotSubscribed] = useState(false)
  const [error, setError] = useState('')
  const [assets, setAssets] = useState([])
  const [uploading, setUploading] = useState(false)
  const [assetName, setAssetName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [saved, setSaved] = useState('')

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
        loadShelf()
      } else {
        setNotSubscribed(true)
      }
    } catch (err) {
      setError('Could not verify: ' + err.message)
    }
    setChecking(false)
  }

  async function loadShelf() {
    try {
      const response = await fetch(`/api/get-shelf?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        setAssets(data.assets || [])
      }
    } catch (err) {
      // Empty shelf
    }
  }

  async function addAsset() {
    if (!selectedFile) return setError('Please select a file')
    if (!assetName.trim()) return setError('Please give this asset a name')
    if (assets.length >= 10) return setError('Your shelf is full — maximum 10 assets')
    setUploading(true)
    setError('')

    try {
      const { upload } = await import('@vercel/blob/client')
      const blobResult = await upload(`shelf/${email}-${Date.now()}.${selectedFile.name.split('.').pop()}`, selectedFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })

      const newAsset = { name: assetName.trim(), url: blobResult.url, type: selectedFile.type, size: selectedFile.size }
      const updatedAssets = [...assets, newAsset]

      await fetch('/api/save-shelf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, assets: updatedAssets })
      })

      setAssets(updatedAssets)
      setAssetName('')
      setSelectedFile(null)
      setSaved('Asset added to your shelf!')
      setTimeout(() => setSaved(''), 3000)
    } catch (err) {
      setError('Could not add asset: ' + err.message)
    }
    setUploading(false)
  }

  async function deleteAsset(index) {
    const updatedAssets = assets.filter((_, i) => i !== index)
    await fetch('/api/save-shelf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, assets: updatedAssets })
    })
    setAssets(updatedAssets)
  }

  async function capsuleAsset(asset) {
    try {
      setSaved('Loading asset...')
      const response = await fetch(asset.url)
      const blob = await response.blob()
      const file = new File([blob], asset.name, { type: asset.type || blob.type })
      
      // Store in sessionStorage for index.js to pick up
      const reader = new FileReader()
      reader.onload = (e) => {
        sessionStorage.setItem('shelf_file_data', e.target.result)
        sessionStorage.setItem('shelf_file_name', asset.name)
        sessionStorage.setItem('shelf_file_type', asset.type || blob.type)
        window.location.href = '/?from_shelf=true'
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Could not load asset: ' + err.message)
      setSaved('')
    }
  }

  if (!verified) {
    return (
      <div style={{minHeight:'100vh',background:'#f0f4f8',fontFamily:'system-ui,sans-serif'}}>
        <header style={{background:'#1a365d',padding:'20px',textAlign:'center'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px'}}>
            <img src={USC_LOGO} alt="USC Logo" style={{height:'70px',width:'auto'}} />
            <div>
              <h1 style={{color:'white',margin:0,fontSize:'28px'}}>Universal Send Capsule™</h1>
              <p style={{color:'#90cdf4',margin:'4px 0 0'}}>My Shelf</p>
            </div>
          </div>
        </header>
        <main style={{maxWidth:'500px',margin:'40px auto',padding:'0 20px'}}>
          <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
            <h2 style={{color:'#1a365d',marginTop:0}}>Access My Shelf</h2>
            <p style={{color:'#666'}}>Your shelf is a Pro feature. Enter your email to access it.</p>

            {notSubscribed && (
              <div style={{background:'#fff5f5',border:'1px solid #feb2b2',borderRadius:'8px',padding:'16px',marginBottom:'20px'}}>
                <p style={{color:'#c53030',margin:0}}>No active Pro subscription found.</p>
                <a href="/pro" style={{color:'#3182ce',display:'block',marginTop:'8px'}}>Upgrade to USC Pro →</a>
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
              style={{background:'#553c9a',color:'white',border:'none',padding:'14px 32px',borderRadius:'8px',cursor:'pointer',fontSize:'16px',width:'100%'}}
            >
              {checking ? 'Checking...' : '📂 Access My Shelf'}
            </button>

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
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px'}}>
          <img src={USC_LOGO} alt="USC Logo" style={{height:'70px',width:'auto'}} />
          <div>
            <h1 style={{color:'white',margin:0,fontSize:'28px'}}>Universal Send Capsule™</h1>
            <p style={{color:'#90cdf4',margin:'4px 0 0'}}>My Shelf</p>
          </div>
        </div>
      </header>
      <main style={{maxWidth:'600px',margin:'40px auto',padding:'0 20px'}}>

        {/* Add Asset */}
        <div style={{background:'white',borderRadius:'12px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',marginBottom:'20px'}}>
          <h3 style={{color:'#1a365d',marginTop:0}}>Add to Shelf ({assets.length}/10)</h3>
          <div style={{marginBottom:'12px'}}>
            <input
              type="text"
              value={assetName}
              onChange={e => setAssetName(e.target.value)}
              placeholder="Asset name (e.g. Logo, Price List)"
              style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box'}}
            />
          </div>
          <div style={{marginBottom:'12px'}}>
            <input
              type="file"
              onChange={e => setSelectedFile(e.target.files[0])}
              style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #ccc',fontSize:'16px',boxSizing:'border-box',background:'white'}}
            />
          </div>
          {error && <p style={{color:'red',fontSize:'14px'}}>{error}</p>}
          {saved && <p style={{color:'#38a169',fontSize:'14px'}}>{saved}</p>}
          <button
            onClick={addAsset}
            disabled={uploading}
            style={{background:'#1a365d',color:'white',border:'none',padding:'12px 24px',borderRadius:'8px',cursor:'pointer',fontSize:'16px',width:'100%'}}
          >
            {uploading ? 'Adding...' : '+ Add to Shelf'}
          </button>
        </div>

        {/* Shelf Assets */}
        <div style={{background:'white',borderRadius:'12px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
          <h3 style={{color:'#1a365d',marginTop:0}}>Your Shelf</h3>
          {assets.length === 0 ? (
            <div style={{textAlign:'center',padding:'32px 0',color:'#999'}}>
              <div style={{fontSize:'48px',marginBottom:'12px'}}>📂</div>
              <p style={{margin:0}}>Your shelf is empty. Add your most-used files for one-tap capsule delivery.</p>
            </div>
          ) : (
            <div>
              {assets.map((asset, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',background:'#f7fafc',borderRadius:'8px',marginBottom:'10px',gap:'8px'}}>
                  <div style={{minWidth:0,flex:1}}>
                    <p style={{margin:0,fontWeight:'bold',color:'#1a365d'}}>{asset.name}</p>
                    <p style={{margin:0,fontSize:'12px',color:'#999'}}>{(asset.size / 1024 / 1024).toFixed(2)}MB</p>
                  </div>
                  <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                    <button
                      onClick={() => capsuleAsset(asset)}
                      style={{background:'#3182ce',color:'white',border:'none',padding:'8px 14px',borderRadius:'6px',cursor:'pointer',fontSize:'13px',fontWeight:'bold'}}
                    >
                      📦 Capsule
                    </button>
                    <button
                      onClick={() => deleteAsset(i)}
                      style={{background:'#fff',color:'#e53e3e',border:'1px solid #e53e3e',padding:'8px 14px',borderRadius:'6px',cursor:'pointer',fontSize:'13px'}}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p style={{textAlign:'center',marginTop:'20px'}}>
          <a href="/" style={{color:'#666',fontSize:'14px'}}>← Back to USC</a>
        </p>
      </main>
    </div>
  )
}