import { adminOnly, getAuthCredentials, hasAccess } from './auth-utils';

export function loggedIn() {
  const auth = getAuthCredentials();
  const token = auth.token;
  if (!token) return false;
  if (!hasAccess(adminOnly, auth)) {
    return false;
  }
  return true;
}
