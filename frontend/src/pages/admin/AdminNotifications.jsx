import { useState, useEffect } from 'react'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { MdEmail, MdCheckCircle, MdWarning } from 'react-icons/md'

export default function AdminNotifications() {
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        api.get('/admin/notifications/config')
            .then(res => setConfig(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const save = async () => {
        setSaving(true)
        try {
            await api.put('/admin/notifications/config', config)
            toast.success('Config saved')
        } catch {
            toast.error('Failed to save')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>

    return (
        <div className="space-y-6 fade-in max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notification Config</h1>
                <p className="text-slate-500 text-sm mt-1">Email system status and settings</p>
            </div>

            <div className="card space-y-5">
                <div className="flex items-center gap-3">
                    <MdEmail size={24} className="text-primary-500" />
                    <div>
                        <div className="font-semibold text-slate-900 dark:text-white">Email Service</div>
                        <div className="text-sm text-slate-500">{config?.smtp_host}:{config?.smtp_port}</div>
                    </div>
                    <span className={`badge ml-auto ${config?.email_enabled ? 'badge-green' : 'badge-red'}`}>
                        {config?.email_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">Enable Email Notifications</div>
                        <div className="text-sm text-slate-500">Send reminder emails 5 minutes before scheduled dose</div>
                    </div>
                    <button
                        onClick={() => setConfig(c => ({ ...c, email_enabled: !c?.email_enabled }))}
                        className={`toggle ${config?.email_enabled ? 'bg-primary-600' : 'bg-slate-200'}`}
                    >
                        <span className={`toggle-thumb ${config?.email_enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">Scheduler Status</div>
                        <div className="text-sm text-slate-500">Background reminder check scheduler</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <MdCheckCircle size={18} />
                        Running
                    </div>
                </div>

                <button onClick={save} disabled={saving} className="btn-primary">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Configuration'}
                </button>
            </div>
        </div>
    )
}
