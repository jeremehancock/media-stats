import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';

export const ServerSelectDialog = ({
  open,
  onClose,
  servers = [],
  onSelect,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Connection</DialogTitle>
      <DialogContent>
        {servers.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No available Plex servers found
          </Typography>
        ) : (
          <List>
            {servers.map((server, index) => (
              <ListItem
                key={index}
                button
                onClick={() => onSelect(server)}
                divider
              >
                <ListItemText
                  primary={server.name}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {`${server.connection.protocol}://${server.connection.address}:${server.connection.port}`}
                      </Typography>{' '}
                      --{' '}
                      <Typography
                        component="span"
                        variant="body2"
                        color={
                          server.connection.local
                            ? 'success.main'
                            : 'text.secondary'
                        }
                      >
                        {server.connection.local
                          ? 'Local Connection'
                          : 'Remote Connection'}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
