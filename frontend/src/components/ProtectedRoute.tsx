import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { api } from "../api/axios"

interface Props {
  children: React.ReactNode
}

/**
 * Wraps a route so it is only accessible to authenticated users.
 * Calls GET /me to verify the session — if the server returns 401,
 * the axios interceptor fires, but we also handle it here to avoid
 * a flash of the protected page before the redirect happens.
 */
export default function ProtectedRoute({ children }: Props) {
  const [status, setStatus] = useState<"loading" | "ok" | "unauth">("loading")

  useEffect(() => {
    api.get("/me")
      .then(() => setStatus("ok"))
      .catch(() => setStatus("unauth"))
  }, [])

  if (status === "loading") return null   // blank while checking — no flash
  if (status === "unauth") return <Navigate to="/" replace />
  return <>{children}</>
}
