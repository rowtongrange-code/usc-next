import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, sender_name, accent_colour, sender_message, notification_email, logo_url } = req.body

    const { error } = await supabase
      .from('pro_users')
      .upsert({ email, sender_name, accent_colour, sender_message, notification_email, logo_url },
        { onConflict: 'email' })

    if (error) throw error
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Save error:', error)
    return res.status(500).json({ error: error.message })
  }
}