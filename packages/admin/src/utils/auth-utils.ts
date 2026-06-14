import Cookie from 'js-cookie';
import SSRCookie from 'cookie';
import {
  AUTH_CRED,
  EMAIL_VERIFIED,
  PERMISSIONS,
  STAFF,
  STORE_OWNER,
  SUPER_ADMIN,
  TOKEN,
} from './constants';

export const allowedRoles = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminAndOwnerOnly = [SUPER_ADMIN, STORE_OWNER];
export const adminOwnerAndStaffOnly = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminOnly = [SUPER_ADMIN];
export const ownerOnly = [STORE_OWNER];
export const ownerAndStaffOnly = [STORE_OWNER, STAFF];

export type AuthCredentials = {
  token?: string | null;
  permissions?: string[] | null;
  primary_permission?: string | null;
};

export function setAuthCredentials(
  token: string,
  permissions: any,
  primary_permission: string | null = null
) {
  Cookie.set(
    AUTH_CRED,
    JSON.stringify({ token, permissions, primary_permission })
  );
}
export function setEmailVerified(emailVerified: boolean) {
  Cookie.set(EMAIL_VERIFIED, JSON.stringify({ emailVerified }));
}
export function getEmailVerified(): {
  emailVerified: boolean;
} {
  const emailVerified = Cookie.get(EMAIL_VERIFIED);
  return emailVerified ? JSON.parse(emailVerified) : false;
}

export function getAuthCredentials(context?: any): {
  token: string | null;
  permissions: string[] | null;
  primary_permission?: string | null;
} {
  let authCred;
  if (context) {
    authCred = parseSSRCookie(context)[AUTH_CRED];
  } else {
    authCred = Cookie.get(AUTH_CRED);
  }
  if (authCred) {
    return JSON.parse(authCred);
  }
  return { token: null, permissions: null, primary_permission: null };
}

function readPrimaryPermissionFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return getAuthCredentials().primary_permission ?? null;
  } catch {
    return null;
  }
}

function resolveAuthInput(
  input?: string[] | AuthCredentials | null,
  explicitPrimaryPermission?: string | null
) {
  if (Array.isArray(input)) {
    return {
      permissions: input,
      primaryPermission:
        explicitPrimaryPermission ?? readPrimaryPermissionFromCookie(),
    };
  }

  return {
    permissions: input?.permissions ?? null,
    primaryPermission:
      explicitPrimaryPermission ??
      input?.primary_permission ??
      readPrimaryPermissionFromCookie(),
  };
}

export function parseSSRCookie(context: any) {
  return SSRCookie.parse(context.req.headers.cookie ?? '');
}

export function hasAccess(
  _allowedRoles: string[],
  _userPermissions: string[] | AuthCredentials | undefined | null,
  explicitPrimaryPermission?: string | null
) {
  const { permissions, primaryPermission } = resolveAuthInput(
    _userPermissions,
    explicitPrimaryPermission
  );

  if (primaryPermission) {
    return _allowedRoles.includes(primaryPermission);
  }

  if (permissions) {
    return Boolean(_allowedRoles?.find((aRole) => permissions.includes(aRole)));
  }
  return false;
}

export function isSuperAdmin(
  input?: string[] | AuthCredentials | null
): boolean {
  return hasAccess(adminOnly, input);
}

export function isStoreOwner(
  input?: string[] | AuthCredentials | null
): boolean {
  return !isSuperAdmin(input) && hasAccess(ownerOnly, input);
}

export function getPrimaryPermission(
  input?: string[] | AuthCredentials | null,
  explicitPrimaryPermission?: string | null
): string | null {
  const { permissions, primaryPermission } = resolveAuthInput(
    input,
    explicitPrimaryPermission
  );

  if (
    primaryPermission &&
    [SUPER_ADMIN, STORE_OWNER, STAFF].includes(primaryPermission)
  ) {
    return primaryPermission;
  }

  if (isSuperAdmin(permissions)) return SUPER_ADMIN;
  if (isStoreOwner(permissions)) return STORE_OWNER;
  if (hasAccess([STAFF], permissions)) return STAFF;
  return null;
}

export function isAuthenticated(_cookies: any) {
  return (
    !!_cookies[TOKEN] &&
    Array.isArray(_cookies[PERMISSIONS]) &&
    !!_cookies[PERMISSIONS].length
  );
}
