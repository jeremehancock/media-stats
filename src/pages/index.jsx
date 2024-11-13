// src/pages/index.jsx
import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { getClientId } from '@/utils/clientId';
import { NowWatching } from '@/components/NowWatching';
import { StatsCard } from '@/components/StatsCard';
import { ServerSelectDialog } from '@/components/ServerSelectDialog';
import { lightTheme, darkTheme } from '@/lib/theme';
import {
  getStorageItem,
  setStorageItem,
  storageKeys,
} from '@/utils/localStorage';
import { usePlexSessions, usePlexStats } from '@/hooks/usePlex';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authCheckInterval, setAuthCheckInterval] = useState(null);
  const [showServerSelect, setShowServerSelect] = useState(false);
  const [availableServers, setAvailableServers] = useState([]);
  const [serverSelectLoading, setServerSelectLoading] = useState(false);
  const [tempAuthToken, setTempAuthToken] = useState(null);
  const [isAppBarVisible, setIsAppBarVisible] = useState(true);

  const {
    sessions,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = usePlexSessions();

  const { stats, isLoading: statsLoading, error: statsError } = usePlexStats();

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load theme preference
  useEffect(() => {
    if (isClient) {
      const savedTheme = getStorageItem('theme', 'light');
      setIsDark(savedTheme === 'dark');
    }
  }, [isClient]);

  // Auto-hide AppBar effect
  useEffect(() => {
    let hideTimeout;
    const isAuthenticated =
      isClient && !!getStorageItem(storageKeys.PLEX_DATA, null);

    if (isAuthenticated && isAppBarVisible) {
      hideTimeout = setTimeout(() => {
        setIsAppBarVisible(false);
      }, 3000);
    }

    return () => clearTimeout(hideTimeout);
  }, [isClient, isAppBarVisible]);

  const handleScreenClick = () => {
    if (!isAppBarVisible) {
      setIsAppBarVisible(true);
    }
  };

  // Save theme preference
  const handleThemeToggle = () => {
    setIsDark((prev) => {
      const newTheme = !prev;
      setStorageItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  const fetchServers = async (token, clientId) => {
    setServerSelectLoading(true);
    try {
      const response = await fetch('https://plex.tv/api/v2/resources', {
        headers: {
          Accept: 'application/json',
          'X-Plex-Token': token,
          'X-Plex-Client-Identifier': clientId,
        },
      });

      const data = await response.json();
      console.log('Server response:', data); // Debug log

      const servers = data
        .filter(
          (resource) =>
            resource.provides.includes('server') &&
            resource.presence &&
            resource.connections &&
            resource.connections.length > 0,
        )
        .map((server) => ({
          name: server.name,
          connection:
            server.connections.find(
              (conn) => conn.local && !conn.address.includes('172'),
            ) || server.connections[0],
        }));

      console.log('Processed servers:', servers); // Debug log
      setAvailableServers(servers);
      setShowServerSelect(true);
    } catch (error) {
      console.error('Error fetching servers:', error);
      setAuthError('Failed to fetch Plex servers. Please try again.');
    } finally {
      setServerSelectLoading(false);
    }
  };

  const handleServerSelect = (server) => {
    if (isClient) {
      setStorageItem('plexData', {
        token: tempAuthToken,
        serverUrl: `${server.connection.protocol}://${server.connection.address}:${server.connection.port}`,
      });
      window.location.reload();
    }
  };

  const handleAuth = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const clientId = getClientId();
      const response = await fetch('/api/plex/auth/initiate', {
        method: 'POST',
        headers: {
          'X-Plex-Client-Identifier': clientId,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate authentication');
      }

      const { pinId, code } = await response.json();
      const authUrl = `https://app.plex.tv/auth#?clientID=${clientId}&code=${code}&context[device][product]=Plex%20Stats`;
      const authWindow = window.open(
        authUrl,
        'PlexAuth',
        'width=800,height=600',
      );

      const interval = setInterval(async () => {
        try {
          const checkResponse = await fetch(
            `https://plex.tv/api/v2/pins/${pinId}`,
            {
              headers: {
                Accept: 'application/json',
                'X-Plex-Client-Identifier': clientId,
              },
            },
          );

          const data = await checkResponse.json();

          if (data.authToken) {
            clearInterval(interval);
            setTempAuthToken(data.authToken);
            await fetchServers(data.authToken, clientId);
            setIsAuthenticating(false);
            if (authWindow && !authWindow.closed) {
              authWindow.close();
            }
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
        }
      }, 2000);

      setAuthCheckInterval(interval);

      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          setIsAuthenticating(false);
          setAuthError('Authentication timed out. Please try again.');
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
        }
      }, 300000);
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError(
        error.message || 'Failed to authenticate with Plex. Please try again.',
      );
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    if (isClient) {
      localStorage.removeItem(storageKeys.PLEX_DATA);
      window.location.reload();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
      }
    };
  }, [authCheckInterval]);

  const theme = isDark ? darkTheme : lightTheme;
  const isAuthenticated =
    isClient && !!getStorageItem(storageKeys.PLEX_DATA, null);

  // Show nothing during SSR
  if (!isClient) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <Box minHeight="100vh" bgcolor="background.default">
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
                Media Stats
              </Typography>
              <IconButton onClick={handleThemeToggle} color="inherit">
                {isDark ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Toolbar>
          </AppBar>

          <Container maxWidth="sm" sx={{ pt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom>
                Welcome to Media Stats
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Connect your Plex account to view your media statistics.
              </Typography>
              {authError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {authError}
                </Alert>
              )}
              <Button
                variant="contained"
                size="large"
                onClick={handleAuth}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Connecting...</span>
                  </Box>
                ) : (
                  'Connect Plex Account'
                )}
              </Button>
            </Paper>
          </Container>

          <ServerSelectDialog
            open={showServerSelect}
            onClose={() => setShowServerSelect(false)}
            servers={availableServers}
            onSelect={handleServerSelect}
            isLoading={serverSelectLoading}
          />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        minHeight="100vh"
        bgcolor="background.default"
        onClick={handleScreenClick}
        sx={{ cursor: isAppBarVisible ? 'default' : 'pointer' }}
      >
        <AppBar
          position="fixed"
          elevation={1}
          sx={{
            transition: 'transform 0.3s ease-in-out',
            transform: isAppBarVisible ? 'translateY(0)' : 'translateY(-100%)',
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              Media Stats
            </Typography>
            <IconButton onClick={handleThemeToggle} color="inherit">
              {isDark ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <Button color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            transition: 'padding-top 0.3s ease-in-out',
            pt: isAppBarVisible ? 8 : 2,
            pb: 4,
            px: 2,
          }}
        >
          {(sessionsError || statsError) && (
            <Container sx={{ mb: 2 }}>
              {sessionsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Failed to fetch Plex sessions: {sessionsError.message}
                </Alert>
              )}
              {statsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Failed to fetch Media stats: {statsError.message}
                </Alert>
              )}
            </Container>
          )}

          <Container sx={{ mt: isAppBarVisible ? 2 : 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <NowWatching
                  sessions={sessions}
                  isLoading={sessionsLoading}
                  error={sessionsError}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <StatsCard
                  title="Movies"
                  value={stats?.movies ?? null}
                  color={theme.palette.primary.main}
                  isLoading={statsLoading}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatsCard
                  title="TV Shows"
                  value={stats?.shows ?? null}
                  color={theme.palette.primary.main}
                  isLoading={statsLoading}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatsCard
                  title="Albums"
                  value={stats?.music ?? null}
                  color="#eab308"
                  isLoading={statsLoading}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>

        <ServerSelectDialog
          open={showServerSelect}
          onClose={() => setShowServerSelect(false)}
          servers={availableServers}
          onSelect={handleServerSelect}
          isLoading={serverSelectLoading}
        />
      </Box>
    </ThemeProvider>
  );
}
