import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate a client identifier if not provided
    const clientId =
      req.headers['x-plex-client-identifier'] ||
      Math.random().toString(36).substring(2, 15);

    const response = await axios.post('https://plex.tv/api/v2/pins', null, {
      params: {
        'X-Plex-Client-Identifier': clientId,
        'X-Plex-Product': 'Media Stats',
        'X-Plex-Version': '1.0',
        strong: true,
      },
      headers: {
        Accept: 'application/json',
      },
    });

    const { id, code } = response.data;

    res.json({
      pinId: id,
      code,
      clientId,
    });
  } catch (error) {
    console.error('Plex auth error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to initiate Plex authentication',
      details: error.response?.data || error.message,
    });
  }
}
