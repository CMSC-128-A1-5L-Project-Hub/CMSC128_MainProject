import axios from 'axios'

export function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL
  if (import.meta.env.PROD && raw && /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(raw)) {
    return '/api'
  }
  return raw ?? '/api'
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)
