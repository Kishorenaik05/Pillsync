import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/client'
import { MdArrowBack, MdMedication, MdCheck, MdClose, MdSnooze, MdLocalPharmacy } from 'react-icons/md'

const PERIOD_ICONS = { morning: '🌅', afternoon: '☀️', evening: '🌇', night: '🌙', pending: '⏰' }
const STATUS_CLASSES = {
    taken: 'badge-green', missed: 'badge-red', snoozed: 'badge-yellow', pending: 'badge-blue'
}

export default function CaregiverPatientDetail() {
    const { id } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/caregiver/patients/${id}`)
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    )

    if (!data) return <div className="p-6 text-red-500">Patient not found or access denied.</div>

    const { patient, medicines, today_reminders, adherence, refills } = data

    return (
        <div className="space-y-6 fade-in">
            {/* Back + Header */}
            <div className="flex items-center gap-4">
                <Link to="/caregiver/patients" className="p-2 rounded-xl bg-slate-100 dark:bg-dark-200 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                    <MdArrowBack size={20} />
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                        {patient.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{patient.name}</h1>
                        <p className="text-slate-500 text-sm">{patient.email} {patient.phone && `• ${patient.phone}`}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Today's Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Adherence + Medicine Count */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="card text-center">
                            <div className="text-3xl font-bold text-emerald-600">{adherence}%</div>
                            <div className="text-sm text-slate-500 mt-1">Adherence</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-3xl font-bold text-primary-600">{medicines.length}</div>
                            <div className="text-sm text-slate-500 mt-1">Medicines</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-3xl font-bold text-blue-600">{today_reminders.length}</div>
                            <div className="text-sm text-slate-500 mt-1">Today's Doses</div>
                        </div>
                    </div>

                    {/* Today's Reminders */}
                    <div className="card p-0 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Today's Schedule</h2>
                        </div>
                        {today_reminders.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">No reminders today.</div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {today_reminders.map(r => (
                                    <div key={r.id} className="flex items-center gap-4 px-6 py-3">
                                        <span className="text-xl">{PERIOD_ICONS[r.period] || '💊'}</span>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900 dark:text-white">{r.medicine_name}</div>
                                            <div className="text-xs text-slate-400">{r.dosage} · {r.reminder_time}</div>
                                        </div>
                                        <span className={`badge ${STATUS_CLASSES[r.status] || 'badge-blue'}`}>{r.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Medicine List */}
                    <div className="card p-0 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                                <MdMedication className="inline mr-2 text-primary-500" size={20} />
                                Current Medicines
                            </h2>
                        </div>
                        {medicines.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">No medicines added.</div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {medicines.map(m => (
                                    <div key={m.id} className="flex items-center gap-4 px-6 py-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                                            {m.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900 dark:text-white">{m.name}</div>
                                            <div className="text-xs text-slate-400">{m.dosage} · {m.frequency}×/day</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Refill Alerts */}
                <div className="space-y-4">
                    <div className="card">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                            <MdLocalPharmacy className="inline mr-2 text-orange-500" size={20} />
                            Refill Alerts
                        </h2>
                        {refills.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">All refills OK ✅</p>
                        ) : (
                            <div className="space-y-3">
                                {refills.map((r, i) => (
                                    <div key={i} className={`rounded-xl p-3 ${r.needs_refill ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'bg-slate-50 dark:bg-dark-200'}`}>
                                        <div className="font-semibold text-sm text-slate-900 dark:text-white">{r.medicine_name}</div>
                                        <div className="text-xs text-slate-500 mt-1">{r.remaining_stock} pills • ~{r.remaining_days} days left</div>
                                        {r.needs_refill && <div className="text-xs text-orange-600 font-semibold mt-1">⚠️ Refill needed</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
