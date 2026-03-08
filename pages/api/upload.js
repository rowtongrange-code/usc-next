import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    const jsonResponse = await handleUpload({
      body,
      request: {
        headers: {
          origin: req.headers.origin || `https://${req.headers.host}`,
        },
      },
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ['application/octet-stream'],
        maximumSizeInBytes: 500 * 1024 * 1024,
        tokenPayload: pathname,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Token error:', error);
    return res.status(500).json({ error: error.message });
  }
}