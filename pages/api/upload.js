import { handleUpload } from '@vercel/blob/client';

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
        maximumSizeInBytes: 500 * 1024 * 1024,
        allowedOrigins: ['https://usc-next.vercel.app', 'https://universalsendcapsule.com'],
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
```

**Save with Ctrl+S.**

---

Then in the terminal:
```
git add .
git commit -m "fix: add allowed origins to blob token"
git push