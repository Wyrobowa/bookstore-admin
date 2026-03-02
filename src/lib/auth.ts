export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  status_id: number | null;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

const AUTH_STORAGE_KEY = 'tharaday_admin_auth_session';
const AUTH_CHANGED_EVENT = 'tharaday-admin:auth-changed';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function readAuthSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const session = JSON.parse(rawValue) as AuthSession;
    if (typeof session.token !== 'string' || !session.user) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function emitAuthChangedEvent() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function writeAuthSession(session: AuthSession) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  emitAuthChangedEvent();
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  emitAuthChangedEvent();
}

export const authChangedEventName = AUTH_CHANGED_EVENT;
export const authStorageKey = AUTH_STORAGE_KEY;
