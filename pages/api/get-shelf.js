import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.query
    if (!email) return res.status(400).json({ error: 'Email required' })

    const { data, error } = await supabase
      .from('pro_users')
      .select('shelf_assets')
      .eq('email', email)
      .single()

    if (error || !data) return res.status(200).json({ assets: [] })

    return res.status(200).json({ assets: data.shelf_assets || [] })
  } catch (error) {
    console.error('Get shelf error:', error)
    return res.status(500).json({ error: error.message })
  }
}