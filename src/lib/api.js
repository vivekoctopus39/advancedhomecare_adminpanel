/**
 * API client for the AHC backend.
 * VITE_API_URL = backend origin (default http://localhost:5000).
 */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
export const WEBSITE_URL = (import.meta.env.VITE_WEBSITE_URL || 'http://localhost:5173').replace(/\/+$/, '')

const TOKEN_KEY = 'ahc_admin_token'

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* storage unavailable */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* storage unavailable */
    }
  },
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors || {}
  }
}

/** Image path from the API (/uploads/x.jpg) → full URL. */
export const assetUrl = (url) => (url && url.startsWith('/') ? `${API_URL}${url}` : url || '')

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {}
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`
  let payload
  if (form) payload = form
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload })
  } catch {
    throw new ApiError(
      `Cannot reach the server at ${API_URL}. Check that the backend is running and that this address (${window.location.origin}) is in CORS_ORIGINS in backend/.env.`,
      0,
    )
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && token) {
      tokenStore.clear()
      window.dispatchEvent(new Event('auth:logout'))
    }
    throw new ApiError(json.message || `Request failed (${res.status})`, res.status, json.errors)
  }
  return json
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, form) => request(path, { method: 'POST', form }),
}
