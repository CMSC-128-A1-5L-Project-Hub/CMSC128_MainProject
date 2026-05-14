import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { api } from '../../api/axios'
import UbleLoader from './LoadingPage'

export default function DevLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const role = searchParams.get('role') ?? 'student'

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        await api.get('/dev/login', { params: { role } })
        if (!cancelled) navigate('/auth/success', { replace: true })
      } catch (err) {
        if (cancelled) return
        const axiosErr = err as AxiosError<string>
        const body = axiosErr.response?.data
        setError(typeof body === 'string' && body ? body : 'Dev login failed.')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [role, navigate])

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h2>Dev login failed</h2>
        <p>{error}</p>
        <p>Requested role: <code>{role}</code></p>
      </div>
    )
  }

  return <UbleLoader />
}
