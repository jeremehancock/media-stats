import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers['x-plex-token'];
  const serverUrl = req.headers['x-plex-server-url'];

  if (!token || !serverUrl) {
    return res
      .status(401)
      .json({ error: 'Unauthorized - Missing credentials' });
  }

  try {
    const response = await axios.get(`${serverUrl}/library/sections`, {
      headers: {
        'X-Plex-Token': token,
        Accept: 'application/json',
      },
    });

    const stats = {
      movies: 0,
      shows: 0,
      music: 0,
    };

    for (const section of response.data.MediaContainer.Directory) {
      const sectionId = section.key;

      // Fetch detailed information for the section
      const sectionInfoResponse = await axios.get(
        `${serverUrl}/library/sections/${sectionId}/all`,
        {
          headers: {
            'X-Plex-Token': token,
            Accept: 'application/json',
          },
        }
      );

      const sectionInfoResponseAlbums = await axios.get(
        `${serverUrl}/library/sections/${sectionId}/albums`,
        {
          headers: {
            'X-Plex-Token': token,
            Accept: 'application/json',
          },
        }
      );

      // Update the stats based on the section type
      if (section.type === 'movie') {
        stats.movies += sectionInfoResponse.data.MediaContainer.size;
      } else if (section.type === 'show') {
        stats.shows += sectionInfoResponse.data.MediaContainer.size;
      } else if (section.type === 'artist') {
        // Handle music sections more carefully, as they might contain albums and tracks
        stats.music += sectionInfoResponseAlbums.data.MediaContainer.size;
        // You might need to further iterate through albums or tracks if necessary
      }
    }

    res.json(stats);
  } catch (error) {
    console.error(
      'Error fetching stats:',
      error.response?.data || error.message
    );
    res.status(500).json({
      error: 'Failed to fetch stats',
      details: error.response?.data || error.message,
    });
  }
}
