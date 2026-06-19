import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from '@framework/utils/get-token';

let echoInstance: Echo<'pusher'> | null = null;
let echoToken: string | null = null;

export const getEcho = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = getToken();

  if (!token) {
    if (echoInstance) {
      echoInstance.disconnect();
      echoInstance = null;
      echoToken = null;
    }
    return null;
  }

  if (echoInstance && echoToken === token) {
    return echoInstance;
  }

  if (echoInstance) {
    echoInstance.disconnect();
  }

  window.Pusher = Pusher;
  echoToken = token;
  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'samara-key',
    wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || window.location.hostname,
    wsPort: Number(process.env.NEXT_PUBLIC_PUSHER_PORT || 6001),
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    cluster: 'mt1',
    authEndpoint: `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
};
