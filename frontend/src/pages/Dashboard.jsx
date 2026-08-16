import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { MdMedication, MdAlarm, MdWarning, MdTrendingUp, MdLocalPharmacy, MdAdd } from 'react-icons/md'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
}

const PERIOD_COLORS = {
    morning: { bg: 'from-amber-400  to-orange-500', badge: 'period-morning' },
    afternoon: { bg: 'from-orange-400 to-red-500', badge: 'period-afternoon' },
    evening: { bg: 'from-violet-500 to-purple-600', badge: 'period-evening' },
    night: { bg: 'from-blue-600   to-indigo-700', badge: 'period-night' },
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, gradient, sublabel }) {
    return (
        <div className={`card-gradient bg-gradient-to-br ${gradient} p-5 flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <Icon size={24} className="text-white" />
            </div>
            <div>
                <div className="text-2xl font-extrabold text-white leading-tight">{value}</div>
                <div className="text-sm font-medium text-white/90">{label}</div>
                {sublabel && <div className="text-xs text-white/70 mt-0.5">{sublabel}</div>}
            </div>
        </div>
    )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({ today: 0, upcoming: 0, missed: 0, adherence: 0, refillAlerts: 0 })
    const [todayReminders, setTodayReminders] = useState([])
    const [medicines, setMedicines] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const [remToday, remMissed, remUpcoming, summary, refills, meds] = await Promise.all([
                    api.get('/reminders/today'),
                    api.get('/reminders/missed'),
                    api.get('/reminders/upcoming'),
                    api.get('/analytics/summary'),
                    api.get('/refills/'),
                    api.get('/medicines/'),
                ])
                const refillAlerts = refills.data.filter(r => r.needs_refill).length

                // Build medicine map for looking up names
                const medMap = {}
                meds.data.forEach(m => { medMap[m.id] = m })

                setStats({
                    today: remToday.data.length,
                    upcoming: remUpcoming.data.length,
                    missed: remMissed.data.length,
                    adherence: summary.data.adherence_percentage,
                    refillAlerts,
                })
                setTodayReminders(remToday.data.slice(0, 5).map(r => ({
                    ...r,
                    medicine_name: medMap[r.medicine_id]?.name || `Med #${r.medicine_id}`,
                    dosage: medMap[r.medicine_id]?.dosage || '',
                })))
                setMedicines(meds.data.slice(0, 5))
            } catch { }
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-6 fade-in">
            {/* Welcome banner */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-500 p-6 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-8 -translate-x-8 blur-2xl" />
                <div className="relative flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold">
                            {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-white/80 text-sm mt-1">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {stats.missed > 0 && (
                            <p className="text-amber-200 text-xs mt-2 font-medium">
                                ⚠️ You have {stats.missed} missed {stats.missed === 1 ? 'dose' : 'doses'} today
                            </p>
                        )}
                    </div>
                    <Link to="/app/medicines" className="flex-shrink-0 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-4 py-2 rounded-xl transition-all duration-200 text-sm">
                        <MdAdd size={18} />
                        Add Medicine
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon={MdMedication} label="Today's Doses" value={stats.today} gradient="from-emerald-500 to-teal-700" />
                <StatCard icon={MdAlarm} label="Upcoming" value={stats.upcoming} gradient="from-teal-500 to-cyan-700" sublabel="Next 7 days" />
                <StatCard icon={MdWarning} label="Missed" value={stats.missed} gradient="from-red-500 to-rose-700" />
                <StatCard icon={MdTrendingUp} label="Adherence" value={`${stats.adherence}%`} gradient="from-green-500 to-emerald-700" />
                <StatCard icon={MdLocalPharmacy} label="Refill Alerts" value={stats.refillAlerts} gradient="from-amber-500 to-orange-600" />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Add Medicine', to: '/app/medicines', emoji: '💊', color: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-100 dark:border-emerald-800' },
                    { label: 'View Reminders', to: '/app/reminders', emoji: '⏰', color: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-100 dark:border-teal-800' },
                    { label: 'Upload Prescription', to: '/app/ocr', emoji: '📄', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800' },
                    { label: 'View Analytics', to: '/app/analytics', emoji: '📊', color: 'from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 border-cyan-100 dark:border-cyan-800' },
                ].map(({ label, to, emoji, color }) => (
                    <Link key={label} to={to}
                        className={`bg-gradient-to-br ${color} border rounded-2xl p-5 hover:shadow-md transition-all duration-200 text-center cursor-pointer group hover:-translate-y-0.5`}
                    >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{emoji}</div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 transition-colors">{label}</div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's reminders */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <MdAlarm className="text-violet-500" size={20} /> Today's Reminders
                        </h2>
                        <Link to="/app/reminders" className="text-sm text-primary-600 hover:underline font-medium">View all →</Link>
                    </div>
                    {todayReminders.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">✅</div>
                            <p className="text-slate-400 text-sm">No reminders for today</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {todayReminders.map((r) => {
                                const pc = PERIOD_COLORS[r.period] || { badge: 'badge-blue' }
                                return (
                                    <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-200 hover:bg-slate-100 dark:hover:bg-dark-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${pc.bg || 'from-primary-400 to-violet-500'} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                                {r.medicine_name?.charAt(0) || '💊'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-white text-sm">{r.medicine_name}</div>
                                                <div className="text-xs text-slate-400">{r.dosage && `${r.dosage} · `}{r.reminder_time}</div>
                                            </div>
                                        </div>
                                        <span className={`badge ${r.status === 'taken' ? 'badge-green' : r.status === 'missed' ? 'badge-red' : 'badge-blue'}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* My medicines */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <MdMedication className="text-primary-500" size={20} /> My Medicines
                        </h2>
                        <Link to="/app/medicines" className="text-sm text-primary-600 hover:underline font-medium">Manage →</Link>
                    </div>
                    {medicines.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2 float">💊</div>
                            <p className="text-slate-400 text-sm">No medicines added yet</p>
                            <Link to="/app/medicines" className="btn-primary text-xs py-2 px-4 mt-3 inline-flex">
                                <MdAdd size={14} /> Add one now
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {medicines.map((m) => (
                                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-200 hover:bg-slate-100 dark:hover:bg-dark-300 transition-colors">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                        {m.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{m.name}</div>
                                        <div className="text-xs text-slate-400">{m.dosage} · {m.frequency}×/day</div>
                                    </div>
                                    <span className="badge badge-blue text-xs">{m.dosage}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
