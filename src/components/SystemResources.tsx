import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { NetworkCheck, Stream, Transform } from '@mui/icons-material';

type ResourceData = {
  sessions: {
    transcodes: number;
    streams: number;
    bandwidth: {
      total: number;
      lan: number;
      wan: number;
    };
  };
};

type ResourcesProps = {
  resources: ResourceData | null;
  isLoading: boolean;
  error?: Error | null;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatBandwidth = (bytesPerSecond: number) => {
  return `${formatBytes(bytesPerSecond)}/s`;
};

export const SystemResources: React.FC<ResourcesProps> = ({
  resources,
  isLoading,
  error,
}) => {
  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Session Resources
        </Typography>
        <Alert severity="warning">
          Resource monitoring is currently unavailable
        </Alert>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Session Resources
        </Typography>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!resources) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Resources
        </Typography>
        <Typography color="text.secondary">
          No resource data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Session Resources
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {/* Active Streams */}
        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Stream color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                Active Streams
              </Typography>
            </Box>
            <Typography variant="h4" color="text.primary">
              {resources.sessions.streams}
            </Typography>
          </Paper>
        </Grid>

        {/* Transcodes */}
        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Transform color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                Active Transcodes
              </Typography>
            </Box>
            <Typography variant="h4" color="text.primary">
              {resources.sessions.transcodes}
            </Typography>
          </Paper>
        </Grid>

        {/* Bandwidth */}
        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <NetworkCheck color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                Bandwidth Usage
              </Typography>
            </Box>
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.primary">
                  Total: {formatBandwidth(resources.sessions.bandwidth.total)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.primary">
                  LAN: {formatBandwidth(resources.sessions.bandwidth.lan)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.primary">
                  WAN: {formatBandwidth(resources.sessions.bandwidth.wan)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SystemResources;
