import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const customers = await stripe.customers.list({ email, limit: 1 })

    if (customers.data.length === 0) {
      return res.status(200).json({ subscribed: false })
    }

    const customer = customers.data[0]
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    })

    const subscribed = subscriptions.data.length > 0
    return res.status(200).json({ subscribed })
  } catch (error) {
    console.error('Subscriber check error:', error)
    return res.status(500).json({ error: error.message })
  }
}