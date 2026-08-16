import { useEffect, useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { MdAlarm, MdAdd, MdCheck, MdClose, MdSnooze } from 'react-icons/md'

const PERIODS = ['morning', 'afternoon', 'evening', 'night']
const PERIOD_ICONS = { morning: '🌅', afternoon: '☀️', evening: '🌇', night: '🌙' }

export default function Reminders() {
    const [reminders, setReminders] = useState([])
    const [medicines, setMedicines] = useState([])
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState({ medicine_id: '', period: 'morning', date: new Date().toISOString().split('T')[0] })
    const [loading, setLoading] = useState(true)

    const load = async () => {
        try {
            const [r, m] = await Promise.all([api.get('/reminders/today'), api.get('/medicines/')])
            setReminders(r.data)
            setMedicines(m.data)
        } catch { }
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const create = async (e) => {
        e.preventDefault()
        try {
            await api.post('/reminders/', form)
            toast.success('Reminder created')
            setModal(false)
            load()
        } catch (err) { toast.error(err?.response?.data?.detail || 'Error') }
    }

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/reminders/${id}/status`, { status })
            toast.success(`Marked as ${status}`)
            load()
        } catch { toast.error('Failed to update') }
    }

    const grouped = PERIODS.reduce((acc, p) => {
        acc[p] = reminders.filter(r => r.period === p)
        return acc
    }, {})

    const todayLabel = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reminders</h1>
                    <p className="text-slate-500 text-sm mt-1">📅 Today — {todayLabel}</p>
                </div>
                <button onClick={() => setModal(true)} className="btn-primary"><MdAdd size={18} />Add Reminder</button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PERIODS.map(period => (
                        <div key={period} className="card">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">{PERIOD_ICONS[period]}</span>
                                <h2 className="font-semibold text-slate-900 dark:text-white capitalize">{period}</h2>
                                <span className="badge badge-blue ml-auto">{grouped[period].length}</span>
                            </div>
                            {grouped[period].length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-4">No reminders</p>
                            ) : (
                                <div className="space-y-3">
                                    {grouped[period].map(r => {
                                        const med = medicines.find(m => m.id === r.medicine_id)
                                        return (
                                            <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-dark-200 flex items-center gap-3">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm text-slate-900 dark:text-white">{med?.name || `Med #${r.medicine_id}`}</div>
                                                    <div className="text-xs text-slate-400">{r.reminder_time} · {r.date}</div>
                                                </div>
                                                <span className={`badge ${r.status === 'taken' ? 'badge-green' : r.status === 'missed' ? 'badge-red' : r.status === 'snoozed' ? 'badge-yellow' : 'badge-blue'}`}>
                                                    {r.status}
                                                </span>
                                                {r.status === 'pending' && (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => updateStatus(r.id, 'taken')} title="Mark taken"
                                                            className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                                                            <MdCheck size={14} />
                                                        </button>
                                                        <button onClick={() => updateStatus(r.id, 'snoozed')} title="Snooze"
                                                            className="p-1.5 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors">
                                                            <MdSnooze size={14} />
                                                        </button>
                                                        <button onClick={() => updateStatus(r.id, 'missed')} title="Mark missed"
                                                            className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
                                                            <MdClose size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-100 rounded-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-lg text-slate-900 dark:text-white">New Reminder</h2>
                            <button onClick={() => setModal(false)} className="text-slate-400"><MdClose size={22} /></button>
                        </div>
                        <form onSubmit={create} className="space-y-4">
                            <div>
                                <label className="label">Medicine *</label>
                                <select className="input" value={form.medicine_id} onChange={e => setForm({ ...form, medicine_id: e.target.value })} required>
                                    <option value="">Select medicine</option>
                                    {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Period *</label>
                                <select className="input" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                                    {PERIODS.map(p => <option key={p} value={p}>{PERIOD_ICONS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Date *</label>
                                <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                                <button type="submit" className="btn-primary flex-1 justify-center">Create Reminder</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
