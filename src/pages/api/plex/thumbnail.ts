import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { path, token, serverUrl } = req.query;

  if (!path || !token || !serverUrl) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await axios({
      method: 'GET',
      url: `${serverUrl}${path}?X-Plex-Token=${token}`,
      responseType: 'arraybuffer',
    });

    const contentType = response.headers['content-type'];

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    return res.send(response.data);
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    return res.status(500).json({ error: 'Failed to fetch thumbnail' });
  }
}
