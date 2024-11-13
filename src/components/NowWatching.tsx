import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Alert,
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

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
};

type NowWatchingProps = {
  sessions: Session[];
  isLoading: boolean;
  error?: { message: string };
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
          Now Watching
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
          Now Watching
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
          Now Watching
        </Typography>
        <Typography color="text.secondary">No active sessions</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Now Watching
      </Typography>
      <Grid container spacing={2}>
        {sessions.map((session) => (
          <Grid item xs={12} md={6} key={session.id}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" gap={2}>
                <Box flexShrink={0}>
                  <img
                    src={
                      !session.thumbnail?.includes('undefined')
                        ? session.thumbnail
                        : session.grandparentThumbNail
                    }
                    alt={session.title}
                    style={{
                      width: 160,
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 4,
                    }}
                  />
                </Box>
                <Box flex={1} minWidth={0}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PlayArrow fontSize="small" color="success" />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {session.user}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {session.title}
                  </Typography>
                  {session.episode && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {session.episode}
                    </Typography>
                  )}
                  {!session.live ? (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(session.progress / session.duration) * 100}
                        sx={{ mb: 1 }}
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
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default NowWatching;
