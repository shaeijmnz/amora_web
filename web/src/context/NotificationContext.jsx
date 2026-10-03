import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, getAdminToken } from '../lib/api'

const NotificationContext = createContext({ unread: 0, messageUnread: 0, refresh: () => {} })

const POLL_MS = 15000

export function NotificationProvider({ children }) {
  const [unread, setUnread] = useState(0)
  const [messageUnread, setMessageUnread] = useState(0)

  const refresh = useCallback(async () => {
    if (!getAdminToken()) {
      setUnread(0)
      setMessageUnread(0)
      return
    }
    try {
      const [notes, messages] = await Promise.all([
        api.unreadNotifications(),
        api.unreadMessages(),
      ])
      setUnread(notes.unread_count ?? 0)
      setMessageUnread(messages.unread_count ?? 0)
    } catch {
      // A failed poll should never interrupt the page the owner is on.
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, POLL_MS)
    // Catch up immediately when the owner comes back to the tab.
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  return (
    <NotificationContext.Provider value={{ unread, messageUnread, refresh }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
