import { handleUpload } from '@vercel/blob/client';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ['application/octet-stream'],
      }),
      onUploadCompleted: async ({ blob }) => {
        // intentionally empty - no callback needed
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Token error:', error);
    return res.status(500).json({ error: error.message });
  }
}