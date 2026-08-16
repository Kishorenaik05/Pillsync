import { useEffect, useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { MdNotifications, MdCheck, MdDelete, MdNotificationsOff } from 'react-icons/md'

const TYPE_COLORS = {
    reminder: 'badge-blue',
    refill: 'badge-yellow',
    missed: 'badge-red',
    system: 'badge-green',
}

const TYPE_ICONS = {
    reminder: '⏰',
    refill: '💊',
    missed: '⚠️',
    system: '🔔',
}

export default function Notifications() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    const load = async () => {
        try {
            const r = await api.get('/notifications/')
            setNotifications(r.data)
        } catch { }
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const markRead = async (id) => {
        await api.patch(`/notifications/${id}/read`)
        setNotifications(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n))
    }

    const markAllRead = async () => {
        await api.post('/notifications/mark-all-read')
        setNotifications(ns => ns.map(n => ({ ...n, is_read: true })))
        toast.success('All notifications marked as read')
    }

    const deleteNotif = async (id) => {
        await api.delete(`/notifications/${id}`)
        setNotifications(ns => ns.filter(n => n.id !== id))
    }

    const unread = notifications.filter(n => !n.is_read).length

    return (
        <div className="space-y-6 fade-in max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {unread > 0 ? `${unread} unread notification(s)` : 'All caught up!'}
                    </p>
                </div>
                {unread > 0 && (
                    <button onClick={markAllRead} className="btn-secondary text-sm">
                        <MdCheck size={16} />Mark All Read
                    </button>
                )}
            </div>

            {/* Enable/Disable row */}
            <div className="card flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <MdNotifications size={22} className="text-primary-600" />
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">Push Notifications</div>
                        <div className="text-xs text-slate-400">Receive in-app alerts for reminders and refills</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="btn-primary text-xs px-3 py-2">Enable</button>
                    <button className="btn-secondary text-xs px-3 py-2"><MdNotificationsOff size={14} />Disable</button>
                </div>
            </div>

            {/* Notification list */}
            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <MdNotifications size={48} className="mx-auto opacity-20 mb-3" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.map(n => (
                            <div key={n.id} className={`flex items-start gap-4 px-5 py-4 transition-colors ${!n.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'hover:bg-slate-50 dark:hover:bg-dark-200'}`}>
                                <div className="text-2xl">{TYPE_ICONS[n.type] || '🔔'}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{n.title}</span>
                                        <span className={`badge ${TYPE_COLORS[n.type] || 'badge-blue'}`}>{n.type}</span>
                                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                                    <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    {!n.is_read && (
                                        <button onClick={() => markRead(n.id)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-100 transition-colors">
                                            <MdCheck size={15} />
                                        </button>
                                    )}
                                    <button onClick={() => deleteNotif(n.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                                        <MdDelete size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
