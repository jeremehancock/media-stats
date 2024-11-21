import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { PlayArrow, Transform } from '@mui/icons-material';

type Session = {
  id: string;
  thumbnail?: string;
  grandparentThumbNail?: string;
  live?: number;
  title: string;
  user: string;
  episode?: string;
  progress: number;
  duration: number;
  transcoding?: {
    isTranscoding: boolean;
    videoDecision?: string;
    audioDecision?: string;
    container?: string;
  };
};

type NowWatchingProps = {
  sessions: Session[];
  isLoading: boolean;
  error?: { message: string };
};

const getThumbnailUrl = (
  path: string | undefined,
  token: string,
  serverUrl: string,
) => {
  if (!path || path.includes('undefined')) return null;

  const params = new URLSearchParams({
    path,
    token,
    serverUrl,
  });
  return `/api/plex/thumbnail?${params.toString()}`;
};

export const NowWatching: React.FC<NowWatchingProps> = ({
  sessions,
  isLoading,
  error,
}) => {
  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Now Streaming
        </Typography>
        <Alert severity="error">
          Failed to load active sessions: {error.message}
        </Alert>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Now Streaming
        </Typography>
        <Box display="flex" justifyContent="center" p={4}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Paper>
    );
  }

  if (!sessions?.length) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Now Streaming
        </Typography>
        <Typography color="text.secondary">No active sessions</Typography>
      </Paper>
    );
  }

  // Get Plex data for thumbnail proxy
  let plexData;
  try {
    plexData = JSON.parse(localStorage.getItem('plexData') || '{}');
  } catch (e) {
    console.error('Error parsing plexData:', e);
    plexData = {};
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Now Streaming
      </Typography>
      <Grid container spacing={2}>
        {sessions.map((session) => {
          const thumbnailUrl =
            plexData.token &&
            plexData.serverUrl &&
            getThumbnailUrl(
              session.thumbnail,
              plexData.token,
              plexData.serverUrl,
            );

          return (
            <Grid item xs={12} md={6} key={session.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  position: 'relative',
                }}
              >
                <Box
                  display="flex"
                  gap={2}
                  sx={{
                    flexDirection: { xs: 'row', sm: 'row' },
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    flexShrink={0}
                    sx={{
                      width: { xs: 85, sm: 170 },
                      height: { xs: 120, sm: 250 },
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: 'action.hover',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={
                        thumbnailUrl
                          ? thumbnailUrl
                          : session.grandparentThumbNail
                      }
                      alt={session.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </Box>
                  <Box flex={1} minWidth={0} textAlign="left" width="100%">
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      justifyContent="flex-start"
                    >
                      <PlayArrow
                        fontSize="small"
                        color="success"
                        sx={{ animation: 'pulse 2s infinite' }}
                      />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {session.user}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {session.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {session.episode ? session.episode : 'Movie'}
                    </Typography>
                    {!session.live ? (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(session.progress / session.duration) * 100}
                          sx={{
                            mb: 1,
                            height: 4,
                            borderRadius: 2,
                            bgcolor: 'rgba(0,0,0,0.1)',
                            '.MuiLinearProgress-bar': {
                              borderRadius: 2,
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(session.progress)}min / {session.duration}
                          min
                        </Typography>
                      </Box>
                    ) : (
                      <Typography mt={1}>Live TV</Typography>
                    )}
                  </Box>
                </Box>
                {session.transcoding?.isTranscoding && (
                  <Tooltip title="Transcoding">
                    <Transform
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        color: 'warning.main',
                        fontSize: 20,
                      }}
                    />
                  </Tooltip>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default NowWatching;
