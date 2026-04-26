import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { notificationEmail, senderEmail, recipientEmail, freeNotification } = req.body

    if (!notificationEmail) {
      return res.status(400).json({ error: 'No notification email provided' })
    }

    if (freeNotification) {
      // Free tier — notify sender that recipient opened it
      await resend.emails.send({
        from: 'USC <notifications@universalsendcapsule.com>',
        to: notificationEmail,
        subject: '📦 Your capsule has been opened!',
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:20px">
            <h2 style="color:#1a365d">Your capsule was opened! 🎉</h2>
            <p>Someone just opened the capsule you sent via Universal Send Capsule.</p>
            ${recipientEmail ? `<p><strong>Opened by:</strong> ${recipientEmail}</p>` : ''}
            <p style="color:#666;font-size:14px;margin-top:32px">
              Sent via <a href="https://universalsendcapsule.com" style="color:#3182ce">Universal Send Capsule™</a>
            </p>
          </div>
        `
      })
    } else {
      // Pro tier — notify Pro user
      await resend.emails.send({
        from: 'USC <notifications@universalsendcapsule.com>',
        to: notificationEmail,
        subject: '📦 Your capsule has been opened!',
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:20px">
            <h2 style="color:#1a365d">Your capsule was opened! 🎉</h2>
            <p>Someone just opened the capsule you sent via Universal Send Capsule.</p>
            ${recipientEmail ? `<p><strong>Opened by:</strong> ${recipientEmail}</p>` : ''}
            <p style="color:#666;font-size:14px;margin-top:32px">
              Sent via <a href="https://universalsendcapsule.com" style="color:#3182ce">Universal Send Capsule™</a>
            </p>
          </div>
        `
      })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return res.status(500).json({ error: error.message })
  }
}