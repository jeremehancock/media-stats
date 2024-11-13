// src/utils/plexAuth.js
import axios from 'axios';

export async function checkPlexAuth(pinId, clientId) {
  try {
    // First get the auth token
    const response = await axios({
      method: 'GET',
      url: `https://plex.tv/api/v2/pins/${pinId}`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      params: {
        'X-Plex-Client-Identifier': clientId,
        code: pinId,
      },
    });

    if (response.data.authToken) {
      // Get server information
      const resourcesResponse = await axios({
        method: 'GET',
        url: 'https://plex.tv/api/v2/resources',
        headers: {
          Accept: 'application/json',
          'X-Plex-Token': response.data.authToken,
          'X-Plex-Client-Identifier': clientId,
        },
      });

      // Filter for available servers
      const servers = resourcesResponse.data.filter(
        (resource) =>
          resource.provides.includes('server') &&
          resource.presence &&
          resource.connections &&
          resource.connections.length > 0,
      );

      if (!servers.length) {
        throw new Error('No available Plex servers found');
      }

      // For each server, try to find the best connection in this order:
      // 1. Local connection
      // 2. Remote direct connection
      // 3. Any available connection
      const server = servers[0]; // Using first server, modify if you have multiple
      let bestConnection;

      // Try to find a local connection first
      bestConnection = server.connections.find((conn) => conn.local);

      // If no local connection, try to find a direct remote connection
      if (!bestConnection) {
        bestConnection = server.connections.find((conn) => !conn.relay);
      }

      // If still no connection, use the first available
      if (!bestConnection && server.connections.length > 0) {
        bestConnection = server.connections[0];
      }

      if (!bestConnection) {
        throw new Error('No valid connection found for Plex server');
      }

      const serverUrl = `${bestConnection.protocol}://${bestConnection.address}:${bestConnection.port}`;

      return {
        token: response.data.authToken,
        serverUrl,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}
