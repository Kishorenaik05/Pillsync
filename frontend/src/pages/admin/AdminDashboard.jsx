import { useState, useEffect } from 'react'
import api from '../../api/client'
import { MdPerson, MdCheckCircle, MdWarning, MdMedication, MdBarChart, MdGroups } from 'react-icons/md'

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/admin/dashboard')
            .then(res => setStats(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>

    const cards = [
        { title: 'Total Users', value: stats?.total_users || 0, icon: MdPerson, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { title: 'Patients', value: stats?.total_patients || 0, icon: MdGroups, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
        { title: 'Caregivers', value: stats?.total_caregivers || 0, icon: MdPerson, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        { title: 'Active Medicines', value: stats?.total_medicines || 0, icon: MdMedication, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
        { title: 'Today\'s Doses', value: stats?.today_reminders || 0, icon: MdBarChart, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { title: 'Completed Doses', value: stats?.completed_doses || 0, icon: MdCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { title: 'Missed Doses', value: stats?.missed_doses || 0, icon: MdWarning, color: stats?.missed_doses > 0 ? 'text-red-500' : 'text-slate-400', bg: stats?.missed_doses > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-100 dark:bg-slate-800' },
        { title: 'Adherence Rate', value: `${stats?.adherence || 0}%`, icon: MdCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    ]

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Platform overview and key metrics</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {cards.map(({ title, value, icon: Icon, color, bg }) => (
                    <div key={title} className="card flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
