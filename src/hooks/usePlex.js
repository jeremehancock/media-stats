import useSWR from 'swr';
import { getStorageItem } from '@/utils/localStorage';

const fetcher = async (url) => {
  try {
    if (typeof window === 'undefined') return null;

    const plexData = getStorageItem('plexData', null);
    if (!plexData) {
      return null;
    }

    const response = await fetch(url, {
      headers: {
        'X-Plex-Token': plexData.token,
        'X-Plex-Server-URL': plexData.serverUrl,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export function usePlexSessions() {
  const { data, error, mutate } = useSWR(
    () => {
      return typeof window !== 'undefined' && getStorageItem('plexData', null)
        ? '/api/plex/sessions'
        : null;
    },
    fetcher,
    {
      refreshInterval: 30000,
      shouldRetryOnError: false,
      revalidateOnFocus: true,
    },
  );

  return {
    sessions: data || [],
    isLoading:
      !error &&
      !data &&
      typeof window !== 'undefined' &&
      !!getStorageItem('plexData', null),
    error,
    mutate,
  };
}

export function usePlexStats() {
  const { data, error, mutate } = useSWR(
    () => {
      return typeof window !== 'undefined' && getStorageItem('plexData', null)
        ? '/api/plex/stats'
        : null;
    },
    fetcher,
    {
      refreshInterval: 300000,
      shouldRetryOnError: false,
      revalidateOnFocus: true,
    },
  );

  return {
    stats: data,
    isLoading:
      !error &&
      !data &&
      typeof window !== 'undefined' &&
      !!getStorageItem('plexData', null),
    error,
    mutate,
  };
}

export function usePlexResources() {
  const shouldFetch =
    typeof window !== 'undefined' && !!localStorage.getItem('plexData');

  const { data, error, mutate } = useSWR(
    shouldFetch ? '/api/plex/resources' : null,
    async (url) => {
      try {
        const plexData = JSON.parse(localStorage.getItem('plexData') || '{}');
        if (!plexData.token || !plexData.serverUrl) {
          throw new Error('Missing Plex credentials');
        }

        const response = await fetch(url, {
          headers: {
            'X-Plex-Token': plexData.token,
            'X-Plex-Server-URL': plexData.serverUrl,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        return response.json();
      } catch (error) {
        console.error('Resource fetch error:', error);
        throw error;
      }
    },
    {
      refreshInterval: 2000,
      revalidateOnFocus: true,
      shouldRetryOnError: false,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    },
  );

  return {
    resources: data,
    isLoading: shouldFetch && !error && !data,
    error: error,
    mutate,
  };
}
