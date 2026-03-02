import { getApiUrl } from '@/consts/api';
import { readAuthSession } from '@/lib/auth';

type RequestConfig = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  auth?: boolean;
};

type ApiErrorShape = {
  error?: unknown;
  message?: unknown;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseJsonSafe(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function parseApiError(status: number, payload: unknown) {
  const normalized =
    payload && typeof payload === 'object' ? (payload as ApiErrorShape) : {};
  const message =
    typeof normalized.message === 'string'
      ? normalized.message
      : typeof normalized.error === 'string'
        ? normalized.error
        : `Request failed (${status})`;

  return new ApiError(status, message);
}

export async function apiRequest<T>(path: string, config: RequestConfig = {}) {
  const { method = 'GET', body, auth = true } = config;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const session = readAuthSession();
    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }
  }

  const response = await fetch(getApiUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null as T;
  }

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw parseApiError(response.status, payload);
  }

  return payload as T;
}
