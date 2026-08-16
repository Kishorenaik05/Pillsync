import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import {
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { MdFileDownload } from 'react-icons/md'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = ['#2563eb', '#dc2626', '#10b981', '#f59e0b']

export default function Analytics() {
    const { user } = useAuth()
    const [summary, setSummary] = useState({ total_doses: 0, taken: 0, missed: 0, adherence_percentage: 0 })
    const [daily, setDaily] = useState([])
    const [weekly, setWeekly] = useState([])
    const [monthly, setMonthly] = useState([])
    const [tab, setTab] = useState('daily')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const [s, d, w, m] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/daily'),
                    api.get('/analytics/weekly'),
                    api.get('/analytics/monthly'),
                ])
                setSummary(s.data)
                setDaily(d.data)
                setWeekly(w.data)
                setMonthly(m.data)
            } catch { }
            setLoading(false)
        }
        load()
    }, [])

    const exportCSV = () => window.open('/api/analytics/export/csv', '_blank')

    const exportPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(18)
        doc.text('PillSync – Adherence Report', 14, 20)
        doc.setFontSize(11)
        doc.text(`Patient: ${user?.name}`, 14, 32)
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40)
        autoTable(doc, {
            startY: 50,
            head: [['Metric', 'Value']],
            body: [
                ['Total Doses', summary.total_doses],
                ['Doses Taken', summary.taken],
                ['Doses Missed', summary.missed],
                ['Adherence', `${summary.adherence_percentage}%`],
            ],
        })
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Date', 'Taken', 'Missed']],
            body: daily.map(d => [d.date, d.taken, d.missed]),
        })
        doc.save('pillsync_report.pdf')
    }

    const chartData = tab === 'daily' ? daily : tab === 'weekly' ? weekly : monthly
    const xKey = tab === 'daily' ? 'date' : tab === 'weekly' ? 'week' : 'month'

    const pieData = [
        { name: 'Taken', value: summary.taken },
        { name: 'Missed', value: summary.missed },
    ]

    if (loading) return (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
    )

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1">Track your medication adherence over time</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={exportCSV} className="btn-secondary text-sm"><MdFileDownload size={18} />Export CSV</button>
                    <button onClick={exportPDF} className="btn-primary text-sm"><MdFileDownload size={18} />Export PDF</button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Doses', value: summary.total_doses, color: 'text-primary-600' },
                    { label: 'Taken', value: summary.taken, color: 'text-emerald-600' },
                    { label: 'Missed', value: summary.missed, color: 'text-red-500' },
                    { label: 'Adherence', value: `${summary.adherence_percentage}%`, color: 'text-violet-600' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="card text-center">
                        <div className={`text-3xl font-bold ${color}`}>{value}</div>
                        <div className="text-sm text-slate-500 mt-1">{label}</div>
                    </div>
                ))}
            </div>

            {/* Pie + Tab charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie chart */}
                <div className="card">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Overall Adherence</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {pieData.map((_, i) => <Cell key={i} fill={['#2563eb', '#dc2626'][i]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar/Line */}
                <div className="card lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-slate-900 dark:text-white">Adherence Trend</h2>
                        <div className="flex gap-1 bg-slate-100 dark:bg-dark-200 rounded-xl p-1">
                            {['daily', 'weekly', 'monthly'].map(t => (
                                <button key={t} onClick={() => setTab(t)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-white dark:bg-dark-100 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="taken" fill="#2563eb" radius={[4, 4, 0, 0]} name="Taken" />
                            <Bar dataKey="missed" fill="#dc2626" radius={[4, 4, 0, 0]} name="Missed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Line chart */}
            <div className="card">
                <h2 className="font-semibold text-slate-900 dark:text-white mb-4">7-Day Adherence Line</h2>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="taken" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Taken" />
                        <Line type="monotone" dataKey="missed" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} name="Missed" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
