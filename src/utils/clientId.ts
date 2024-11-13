import { v4 as uuidv4 } from 'uuid';
import { getStorageItem, setStorageItem } from '@/utils/localStorage';

export function getClientId() {
  if (typeof window === 'undefined') {
    return uuidv4();
  }

  let clientId = getStorageItem('plexClientId', null);

  if (!clientId) {
    clientId = uuidv4();
    setStorageItem('plexClientId', clientId);
  }

  return clientId;
}

export function resetClientId() {
  if (typeof window === 'undefined') {
    return;
  }

  const newClientId = uuidv4();
  localStorage.removeItem('plexData');
  setStorageItem('plexClientId', newClientId);
  return newClientId;
}
