import { useState, useEffect } from 'react'
import api from '../../api/client'

export default function AdminAnalytics() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/admin/analytics')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Analytics</h1>
                <p className="text-slate-500 text-sm mt-1">Adherence and usage trends across all users</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div className="card text-center">
                    <div className="text-3xl font-bold text-emerald-600">{data?.overall_adherence ?? 0}%</div>
                    <div className="text-sm text-slate-500 mt-1">Overall Adherence</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl font-bold text-primary-600">{data?.total_doses_taken ?? 0}</div>
                    <div className="text-sm text-slate-500 mt-1">Total Doses Taken</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl font-bold text-red-500">{data?.total_doses_missed ?? 0}</div>
                    <div className="text-sm text-slate-500 mt-1">Total Doses Missed</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl font-bold text-blue-600">{data?.active_users ?? 0}</div>
                    <div className="text-sm text-slate-500 mt-1">Active Users</div>
                </div>
            </div>

            {/* Top adherent patients */}
            {data?.top_patients?.length > 0 && (
                <div className="card p-0 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">Top Adherent Patients</h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.top_patients.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-4 px-6 py-3">
                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-dark-200 flex items-center justify-center text-xs font-bold text-slate-500">#{i + 1}</div>
                                <div className="flex-1">
                                    <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                                    <div className="text-xs text-slate-400">{p.email}</div>
                                </div>
                                <div className="text-sm font-bold text-emerald-600">{p.adherence}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
