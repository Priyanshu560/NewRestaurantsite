import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const clientRef  = useRef(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!isAuthenticated) return

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${import.meta.env.VITE_API_URL || '/api'}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        // Personal queue for this user
        client.subscribe(`/user/queue/notifications`, (msg) => {
          const payload = JSON.parse(msg.body)
          setNotifications(prev => [payload, ...prev].slice(0, 20))
          if (payload.type === 'NEW_BOOKING') {
            toast.success(`Booking ${payload.reference} confirmed!`)
          }
        })
      },
      onStompError: () => {},
    })

    client.activate()
    clientRef.current = client

    return () => client.deactivate()
  }, [isAuthenticated])

  const clearNotifications = () => setNotifications([])

  return (
    <NotificationContext.Provider value={{ notifications, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
