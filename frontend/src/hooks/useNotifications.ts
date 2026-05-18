import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "../api/axios"
import type { Notification } from "../components/NotificationPanel"

const POLL_INTERVAL_MS = 30_000

type UseNotificationsOptions = {
  refetchOn?: boolean
  pollIntervalMs?: number
}

type UseNotificationsResult = {
  notifications: Notification[]
  unreadCount: number
  markOneRead: (id: number) => void
  markAllRead: () => void
  refetch: () => Promise<void>
}

export function useNotifications(opts: UseNotificationsOptions = {}): UseNotificationsResult {
  const { refetchOn, pollIntervalMs = POLL_INTERVAL_MS } = opts
  const [notifications, setNotifications] = useState<Notification[]>([])
  const mountedRef = useRef(true)

  const refetch = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications")
      if (!mountedRef.current) return
      setNotifications(
        data.map((n: any) => ({
          id: n.id,
          type: n.notificationType,
          message: n.notificationContent,
          time: new Date(n.notificationTimestamp).toLocaleString(),
          read: n.readStatus === "read",
        }))
      )
    } catch (e) {
      console.error("[useNotifications] fetch failed:", e)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    refetch()
    return () => {
      mountedRef.current = false
    }
  }, [refetch])

  useEffect(() => {
    if (refetchOn) refetch()
  }, [refetchOn, refetch])

  useEffect(() => {
    const id = window.setInterval(refetch, pollIntervalMs)
    return () => window.clearInterval(id)
  }, [refetch, pollIntervalMs])

  useEffect(() => {
    const onFocus = () => refetch()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refetch])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markOneRead = useCallback((id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    api.patch(`/notifications/${id}`, { readStatus: "read" }).catch(console.error)
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      prev.filter((n) => !n.read).forEach((n) =>
        api.patch(`/notifications/${n.id}`, { readStatus: "read" }).catch(console.error)
      )
      return prev.map((n) => ({ ...n, read: true }))
    })
  }, [])

  return { notifications, unreadCount, markOneRead, markAllRead, refetch }
}
