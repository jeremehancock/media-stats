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
    }
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
    }
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
