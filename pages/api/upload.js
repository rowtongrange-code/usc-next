import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pathname } = req.body || {};
    const filename = pathname || `capsule-${Date.now()}.enc`;

    const clientToken = await generateClientTokenFromReadWriteToken({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      pathname: filename,
      onUploadCompleted: {
        callbackUrl: `https://usc-next.vercel.app/api/upload-complete`,
      },
    });

    return res.status(200).json({ clientToken });
  } catch (error) {
    console.error('Token error:', error);
    return res.status(500).json({ error: error.message });
  }
}