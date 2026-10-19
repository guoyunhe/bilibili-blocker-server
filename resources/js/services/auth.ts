export type AuthUser = {
  id: number
  name: string
  email: string
  role: string
  emailVerifiedAt: string | null
}

type AuthResponse = {
  user: AuthUser
  token: string
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

const tokenKey = 'auth-token'

export function getAuthToken() {
  return localStorage.getItem(tokenKey)
}

export function clearAuthToken() {
  localStorage.removeItem(tokenKey)
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

export async function login(email: string, password: string) {
  const response = await request<AuthResponse>('login', { email, password })
  localStorage.setItem(tokenKey, response.token)
  return response.user
}

export async function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string
) {
  const response = await request<AuthResponse>('register', {
    name,
    email,
    password,
    passwordConfirmation,
  })
  localStorage.setItem(tokenKey, response.token)
  return response.user
}

export function verifyEmail(token: string) {
  return request<{ message: string; email: string }>('verify', { token }, '/api/email')
}

export function resendVerificationEmail() {
  return request<{ message: string }>('verify/send', {}, '/api/email')
}

export function getCurrentUser() {
  return request<AuthUser>('user')
}

export async function logout() {
  try {
    await request<void>('logout', {})
  } finally {
    clearAuthToken()
  }
}
