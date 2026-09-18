import type { ApiResponse, Character, CreateCharacterInput } from '@grimoire/shared';

// DECISION: EXPO_PUBLIC_-prefixed env vars are inlined by Expo at build
// time and readable from client code (see Expo docs on environment
// variables) — that's the supported way to configure the API base URL
// per environment (simulator vs. a phone on the same LAN as the dev
// machine) without a native config plugin.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (response.status === 204) return undefined as T;

  const body = (await response.json()) as ApiResponse<T>;
  if (!body.success) throw new ApiError(body.error.message, body.error.code);
  return body.data;
};

export const charactersApi = {
  list: (): Promise<Character[]> => request<Character[]>('/characters'),

  create: (input: CreateCharacterInput): Promise<Character> =>
    request<Character>('/characters', { method: 'POST', body: JSON.stringify(input) }),

  getById: (id: string): Promise<Character> => request<Character>(`/characters/${id}`),

  delete: (id: string): Promise<void> => request<void>(`/characters/${id}`, { method: 'DELETE' }),
};
