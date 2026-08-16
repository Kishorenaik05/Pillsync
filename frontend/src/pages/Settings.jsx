import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { MdDarkMode, MdLightMode, MdLanguage, MdSecurity, MdNotifications, MdNotificationsOff, MdCheckCircle, MdWarning, MdEmail } from 'react-icons/md'

export default function Settings() {
    const { darkMode, toggleDarkMode } = useAuth()
    // Read browser permission status directly — no extra hook instance (scheduling is done in Layout)
    const [browserPermission, setBrowserPermission] = useState(() => Notification?.permission ?? 'default')
    const [testEmailLoading, setTestEmailLoading] = useState(false)
    const [remindersEnabled, setRemindersEnabled] = useState(
        () => localStorage.getItem('reminderNotifications') !== 'false'
    )
    const [settings, setSettings] = useState({
        language: 'en',
        notifications_enabled: true,
        email_notifications: true,
        sms_notifications: false,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const r = await api.get('/profile/')
                setSettings({
                    language: r.data.language || 'en',
                    notifications_enabled: r.data.notifications_enabled ?? true,
                    email_notifications: r.data.email_notifications ?? true,
                    sms_notifications: r.data.sms_notifications ?? false,
                })
            } catch { }
            setLoading(false)
        }
        load()
    }, [])

    const save = async (updated) => {
        const next = { ...settings, ...updated }
        setSettings(next)
        try {
            await api.put('/profile/settings', next)
            toast.success('Settings updated')
        } catch {
            toast.error('Failed to save settings')
        }
    }

    const sendTestEmail = async () => {
        setTestEmailLoading(true)
        try {
            await api.post('/notifications/test-email')
            toast.success('Test email sent! Check your inbox 📬')
        } catch (err) {
            const detail = err?.response?.data?.detail
            if (err?.response?.status === 404) {
                toast.error('SMTP not configured — add your Gmail credentials to .env')
            } else {
                toast.error(detail || 'Failed to send test email')
            }
        } finally {
            setTestEmailLoading(false)
        }
    }

    const handleReminderToggle = async () => {
        if (!remindersEnabled) {
            // Turning ON
            if (Notification?.permission !== 'granted') {
                const result = await Notification.requestPermission()
                setBrowserPermission(result)
                if (result !== 'granted') {
                    toast.error('Please allow notifications in your browser settings')
                    return
                }
            }
            localStorage.setItem('reminderNotifications', 'true')
            setRemindersEnabled(true)
            toast.success('Medicine reminder notifications enabled! 🔔')
        } else {
            // Turning OFF
            localStorage.setItem('reminderNotifications', 'false')
            setRemindersEnabled(false)
            toast('Reminder notifications paused', { icon: '🔕' })
        }
    }

    const getPermissionBadge = () => {
        if (browserPermission === 'granted') return <span className="badge badge-green flex items-center gap-1"><MdCheckCircle size={12} /> Allowed</span>
        if (browserPermission === 'denied') return <span className="badge badge-red  flex items-center gap-1"><MdWarning size={12} /> Blocked</span>
        return <span className="badge badge-yellow">Not yet asked</span>
    }

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-6 fade-in max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Configure your app preferences and notification settings</p>
            </div>

            {/* ── Dark Mode ── */}
            <div className="card flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-sm">
                        {darkMode ? <MdLightMode size={22} className="text-white" /> : <MdDarkMode size={22} className="text-white" />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {darkMode ? 'Switch to light theme' : 'Toggle dark aesthetic theme'}
                            {' '}· Saved automatically
                        </p>
                    </div>
                </div>
                <button
                    onClick={toggleDarkMode}
                    className={`toggle ${darkMode ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                    <span className={`toggle-thumb ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            {/* ── Medicine Reminders (TOP PRIORITY) ── */}
            <div className="card border-2 border-primary-200 dark:border-primary-800 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-sm flex-shrink-0">
                            {remindersEnabled && browserPermission === 'granted'
                                ? <MdNotifications size={22} className="text-white" />
                                : <MdNotificationsOff size={22} className="text-white" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Medicine Reminder Notifications</h3>
                                <span className="badge badge-purple text-[10px]">★ Priority</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Get a browser notification <strong>2 minutes before</strong> each scheduled medicine time
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="text-xs text-slate-500">Browser permission:</span>
                                {getPermissionBadge()}
                                {Notification?.permission === 'denied' && (
                                    <span className="text-xs text-red-500">Enable in browser site settings to use this feature</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0 mt-1">
                        <button
                            onClick={handleReminderToggle}
                            className={`toggle ${remindersEnabled && browserPermission === 'granted' ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`toggle-thumb ${remindersEnabled && browserPermission === 'granted' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <button
                            onClick={sendTestEmail}
                            disabled={testEmailLoading}
                            title="Send a test email to your registered address"
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {testEmailLoading
                                ? <span className="w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                                : <MdEmail size={14} />}
                            Test Email
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Language ── */}
            <div className="card flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center shadow-sm">
                        <MdLanguage size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Language</h3>
                        <p className="text-xs text-slate-400">Choose your preferred localization</p>
                    </div>
                </div>
                <select
                    value={settings.language}
                    onChange={e => save({ language: e.target.value })}
                    className="input w-36 py-1.5 px-3 text-sm"
                >
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="hi">🇮🇳 हिन्दी</option>
                </select>
            </div>

            {/* ── Other Notifications ── */}
            <div className="card space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                        <MdNotifications size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">System Notifications</h3>
                        <p className="text-xs text-slate-400">Manage emails and SMS alerts</p>
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2 space-y-4">
                    {[
                        { key: 'notifications_enabled', title: 'App Notifications', desc: 'Global toggle for all system alerts' },
                        { key: 'email_notifications', title: 'Email Notifications', desc: 'Daily summaries delivered to your inbox' },
                        { key: 'sms_notifications', title: 'SMS Notifications', desc: 'Emergency alerts sent to your phone' },
                    ].map(({ key, title, desc }) => (
                        <div key={key} className="flex items-center justify-between pt-4 first:pt-0">
                            <div>
                                <h4 className="font-medium text-sm text-slate-900 dark:text-white">{title}</h4>
                                <p className="text-xs text-slate-400">{desc}</p>
                            </div>
                            <button
                                onClick={() => save({ [key]: !settings[key] })}
                                className={`toggle ${settings[key] ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <span className={`toggle-thumb ${settings[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Privacy ── */}
            <div className="card flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                        <MdSecurity size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Privacy & Security</h3>
                        <p className="text-xs text-slate-400">Your health data is encrypted and secure</p>
                    </div>
                </div>
                <button className="btn-secondary text-xs py-2 px-3">View Policy</button>
            </div>
        </div>
    )
}
