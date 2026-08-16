import { useEffect, useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { MdEdit, MdRefresh, MdWarning, MdCheck } from 'react-icons/md'

export default function Refills() {
    const [refills, setRefills] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ remaining_stock: '', daily_dosage: '', alert_threshold: 7 })

    const load = async () => {
        try {
            const r = await api.get('/refills/')
            setRefills(r.data)
        } catch { }
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const openEdit = (r) => {
        setEditing(r.medicine_id)
        setForm({ remaining_stock: r.remaining_stock, daily_dosage: r.daily_dosage, alert_threshold: r.alert_threshold })
    }

    const save = async (e) => {
        e.preventDefault()
        try {
            await api.put(`/refills/${editing}`, form)
            toast.success('Refill updated')
            setEditing(null)
            load()
        } catch { toast.error('Failed to update') }
    }

    const urgentRefills = refills.filter(r => r.needs_refill)

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Refill Tracker</h1>
                <p className="text-slate-500 text-sm mt-1">Monitor medicine stock levels and get refill predictions</p>
            </div>

            {urgentRefills.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                    <MdWarning size={22} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="font-semibold text-amber-800 dark:text-amber-300">Refill Alerts</div>
                        <div className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                            {urgentRefills.length} medicine(s) need to be refilled soon: {urgentRefills.map(r => r.medicine_name).join(', ')}
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
            ) : refills.length === 0 ? (
                <div className="card text-center py-16 text-slate-400">
                    <div className="text-4xl mb-3">💊</div>
                    <p>Add medicines first to track refills</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {refills.map(r => (
                        <div key={r.id} className={`card ${r.needs_refill ? 'border-amber-300 dark:border-amber-700' : ''}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{r.medicine_name}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">{r.daily_dosage} dose(s) per day</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {r.needs_refill ? (
                                        <span className="badge badge-yellow"><MdWarning size={12} className="mr-0.5" />Refill Soon</span>
                                    ) : (
                                        <span className="badge badge-green"><MdCheck size={12} className="mr-0.5" />OK</span>
                                    )}
                                </div>
                            </div>

                            {/* Stock bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Remaining Stock</span>
                                    <span className="font-medium">{r.remaining_stock} units</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${r.remaining_days <= r.alert_threshold ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(100, (r.remaining_stock / (r.daily_dosage * 30)) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-200">
                                    <div className="text-slate-400 text-xs">Days Remaining</div>
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">{r.remaining_days}</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-200">
                                    <div className="text-slate-400 text-xs">Refill Date</div>
                                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{r.refill_date}</div>
                                </div>
                            </div>

                            <button onClick={() => openEdit(r)} className="btn-secondary w-full justify-center text-sm">
                                <MdEdit size={16} /> Update Stock
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-100 rounded-2xl w-full max-w-md p-6">
                        <h2 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Update Refill Details</h2>
                        <form onSubmit={save} className="space-y-4">
                            <div>
                                <label className="label">Remaining Stock (units)</label>
                                <input type="number" className="input" value={form.remaining_stock} onChange={e => setForm({ ...form, remaining_stock: e.target.value })} min="0" required />
                            </div>
                            <div>
                                <label className="label">Daily Dosage (units/day)</label>
                                <input type="number" className="input" value={form.daily_dosage} onChange={e => setForm({ ...form, daily_dosage: e.target.value })} min="0.1" step="0.5" required />
                            </div>
                            <div>
                                <label className="label">Alert Threshold (days before empty)</label>
                                <input type="number" className="input" value={form.alert_threshold} onChange={e => setForm({ ...form, alert_threshold: e.target.value })} min="1" />
                            </div>
                            <div className="text-xs text-slate-400 bg-slate-50 dark:bg-dark-200 rounded-xl p-3">
                                Formula: <code className="text-primary-600">remaining_days = remaining_stock / daily_dosage</code>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setEditing(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                                <button type="submit" className="btn-primary flex-1 justify-center"><MdRefresh size={16} />Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
