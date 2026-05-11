// src/context/NotificationsContext.jsx
import { createContext, useContext, useState } from 'react';

const NotificationsContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: "done",     label: "Morning vitamins logged",    time: "7:30 AM",  icon: "✅",  read: true  },
  { id: 2, type: "done",     label: "Hydration check-in complete",time: "9:00 AM",  icon: "💧",  read: true  },
  { id: 3, type: "upcoming", label: "Midday meal tracker",        time: "12:00 PM", icon: "🍽️",  read: false },
  { id: 4, type: "upcoming", label: "Prenatal stretch reminder",  time: "2:00 PM",  icon: "🧘‍♀️", read: false },
  { id: 5, type: "upcoming", label: "Evening mood log",           time: "6:00 PM",  icon: "🌙",  read: false },
];

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const addNotification = (notif) =>
    setNotifications(prev => [...prev, { ...notif, id: Date.now(), read: false }]);

  const markDone = (id) =>
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, type: "done", read: true } : n)
    );

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, addNotification, markDone }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);