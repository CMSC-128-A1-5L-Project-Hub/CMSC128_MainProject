import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// Redirect to landing page on 401 (not logged in) or 403 (wrong role)
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