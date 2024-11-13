export const storageKeys = {
    PLEX_CLIENT_ID: 'plexClientId',
    PLEX_DATA: 'plexData',
    THEME: 'theme'
  };
  
  export const getStorageItem = (key: string, defaultValue: string | null) => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };
  
  export const setStorageItem = (key: string, value: string) => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  };