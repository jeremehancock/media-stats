import axios, { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

type Bandwidth = {
  total: number;
  lan: number;
  wan: number;
};

type Session = {
  TranscodeSession?: boolean;
  Session?: {
    bandwidth: string;
    location: string;
  };
};

type ResourceData = {
  sessions: {
    transcodes: number;
    streams: number;
    bandwidth: Bandwidth;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers['x-plex-token'] as string | undefined;
  const serverUrl = req.headers['x-plex-server-url'] as string | undefined;

  if (!token || !serverUrl) {
    return res
      .status(401)
      .json({ error: 'Unauthorized - Missing credentials' });
  }

  try {
    // Get comprehensive server statistics
    const [, sessionsResponse] = await Promise.all([
      axios.get(`${serverUrl}/status`, {
        headers: {
          'X-Plex-Token': token,
          Accept: 'application/json',
        },
      }),
      axios.get(`${serverUrl}/status/sessions`, {
        headers: {
          'X-Plex-Token': token,
          Accept: 'application/json',
        },
      }),
      // Add statistics endpoint for more detailed metrics
      axios.get(`${serverUrl}/statistics`, {
        headers: {
          'X-Plex-Token': token,
          Accept: 'application/json',
        },
      }),
    ]);

    const sessions: Session[] =
      sessionsResponse.data.MediaContainer?.Metadata || [];

    // Calculate session stats
    let totalBandwidth = 0;
    let lanBandwidth = 0;
    let wanBandwidth = 0;
    let transcodes = 0;

    sessions.forEach((session) => {
      if (session.TranscodeSession) {
        transcodes++;
      }

      const bandwidth = parseInt(session.Session?.bandwidth || '0', 10);
      totalBandwidth += bandwidth;

      if (session.Session?.location === 'lan') {
        lanBandwidth += bandwidth;
      } else {
        wanBandwidth += bandwidth;
      }
    });

    const resourceData: ResourceData = {
      sessions: {
        transcodes,
        streams: sessions.length,
        bandwidth: {
          total: totalBandwidth,
          lan: lanBandwidth,
          wan: wanBandwidth,
        },
      },
    };

    res.json(resourceData);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      'Error fetching resource data:',
      axiosError.response?.data || axiosError.message,
    );
    res.status(500).json({
      error: 'Failed to fetch resource data',
      details: axiosError.response?.data || axiosError.message,
    });
  }
}
