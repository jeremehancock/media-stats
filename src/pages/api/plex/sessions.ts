import axios, { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

type SessionData = {
  id: string;
  user: string;
  title: string;
  type: string;
  progress: number;
  duration: number;
  thumbnail: string;
  grandparentThumbNail: string;
  live?: number;
  episode?: string;
  transcoding: {
    isTranscoding: boolean;
    videoDecision?: string;
    audioDecision?: string;
    container?: string;
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
    const response = await axios.get(`${serverUrl}/status/sessions`, {
      headers: {
        'X-Plex-Token': token,
        Accept: 'application/json',
      },
    });

    const sessions: SessionData[] =
      response.data.MediaContainer.Metadata?.map(
        (session: {
          grandparentTitle: string;
          ratingKey: string;
          User: { title: string };
          title: string;
          type: string;
          viewOffset: number;
          duration: number;
          thumb: string;
          grandparentThumb: string;
          live: number;
          parentIndex: number;
          index: number;
          Media: Array<{
            Part: Array<{
              Decision?: string;
              Stream?: Array<{
                streamType: number;
                decision?: string;
              }>;
            }>;
            Container?: string;
          }>;
        }): SessionData => {
          const media = session.Media?.[0];
          const part = media?.Part?.[0];
          const videoStream = part?.Stream?.find((s) => s.streamType === 1);
          const audioStream = part?.Stream?.find((s) => s.streamType === 2);

          return {
            id: session.ratingKey,
            user: session.User?.title || 'Unknown User',
            title:
              session.type === 'episode'
                ? session.grandparentTitle
                : session.title,
            type: session.type,
            progress: Math.floor(session.viewOffset / 1000 / 60),
            duration: Math.floor(session.duration / 1000 / 60),
            thumbnail: session.thumb,
            grandparentThumbNail: session.grandparentThumb,
            live: session.live,
            episode:
              session.type === 'episode'
                ? `S${session.parentIndex}E${session.index} - ${session.title}`
                : undefined,
            transcoding: {
              isTranscoding:
                part?.Decision === 'transcode' ||
                videoStream?.decision === 'transcode' ||
                audioStream?.decision === 'transcode',
              videoDecision: videoStream?.decision,
              audioDecision: audioStream?.decision,
              container: media?.Container,
            },
          };
        },
      ) || [];

    res.json(sessions);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      'Error fetching sessions:',
      axiosError.response?.data || axiosError.message,
    );
    res.status(500).json({
      error: 'Failed to fetch sessions',
      details: axiosError.response?.data || axiosError.message,
    });
  }
}
