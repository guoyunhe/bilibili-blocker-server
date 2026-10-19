export type AuthUser = {
  id: number
  name: string
  email: string
  role: string
  emailVerifiedAt: string | null
}

export type AuthSession = {
  user: AuthUser
  token: string
}

export type PersistedAuthState = {
  token: string | null
  user: AuthUser | null
}

type ApiEnvelope<T> = {
  data: T
}

type ApiErrorBody = {
  message?: string
  errors?: Array<{ message?: string }>
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const authStorageKey = 'auth-state'
const legacyTokenKey = 'auth-token'

export function parseAuthState(serialized: string): PersistedAuthState {
  const auth: unknown = JSON.parse(serialized)
  if (typeof auth !== 'object' || auth === null || !('token' in auth) || !('user' in auth)) {
    throw new Error('Invalid persisted authentication state')
  }
  if (auth.token !== null && typeof auth.token !== 'string') {
    throw new Error('Invalid authentication token')
  }
  return { token: auth.token, user: auth.user as AuthUser | null }
}

export function getAuthToken() {
  const storedAuth = localStorage.getItem(authStorageKey)
  if (!storedAuth) return localStorage.getItem(legacyTokenKey)

  try {
    return parseAuthState(storedAuth).token
  } catch (reason) {
    console.error('Failed to read persisted authentication state', reason)
    return null
  }
}

async function request<T>(path: string, payload?: object, routePrefix = '/api/auth'): Promise<T> {
  const token = getAuthToken()
  const response = await fetch(`${routePrefix}/${path}`, {
    method: payload ? 'POST' : 'GET',
    headers: {
      Accept: 'application/json',
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  })
  const body = (await response.json()) as ApiEnvelope<T> | ApiErrorBody

  if (!response.ok) {
    const errorBody = body as ApiErrorBody
    throw new ApiError(
      errorBody.message ?? errorBody.errors?.[0]?.message ?? 'Request failed',
      response.status
    )
  }

  return (body as ApiEnvelope<T>).data
}

export function login(email: string, password: string) {
  return request<AuthSession>('login', { email, password })
}

export async function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string
) {
  return request<AuthSession>('register', {
    name,
    email,
    password,
    passwordConfirmation,
  })
}

export function verifyEmail(token: string) {
  return request<{ message: string }>('verify', { token }, '/api/email')
}

export function resendVerificationEmail() {
  return request<{ message: string }>('verify/send', {}, '/api/email')
}

export function getCurrentUser() {
  return request<AuthUser>('user')
}

export function logout() {
  return request<void>('logout', {})
}
