import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { MdPerson, MdCheckCircle, MdWarning, MdMedication, MdLocalPharmacy } from 'react-icons/md'

export default function CaregiverDashboard() {
    const [stats, setStats] = useState(null)
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const [statsRes, patientsRes] = await Promise.all([
                    api.get('/caregiver/dashboard'),
                    api.get('/caregiver/patients')
                ])
                setStats(statsRes.data)
                setPatients(patientsRes.data.slice(0, 5)) // only show top 5 on dashboard
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
    }

    const StatCard = ({ title, value, icon: Icon, color, bg }) => (
        <div className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <div className="text-sm font-semibold text-slate-500 mb-1">{title}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Caregiver Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Overview of your assigned patients</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="My Patients" value={stats?.total_patients || 0} icon={MdPerson} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
                <StatCard title="Adherence Rate" value={`${stats?.adherence || 0}%`} icon={MdCheckCircle} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                <StatCard title="Missed Doses (Today)" value={stats?.missed_doses || 0} icon={MdWarning} color={stats?.missed_doses > 0 ? "text-red-500" : "text-slate-400"} bg={stats?.missed_doses > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-slate-100 dark:bg-slate-800"} />
                <StatCard title="Today's Doses" value={stats?.today_doses || 0} icon={MdCheckCircle} color="text-primary-600" bg="bg-primary-50 dark:bg-primary-900/20" />
                <StatCard title="Active Medicines" value={stats?.active_medicines || 0} icon={MdMedication} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/20" />
                <StatCard title="Refill Alerts" value={stats?.refill_alerts || 0} icon={MdLocalPharmacy} color={stats?.refill_alerts > 0 ? "text-orange-500" : "text-slate-400"} bg={stats?.refill_alerts > 0 ? "bg-orange-50 dark:bg-orange-900/20" : "bg-slate-100 dark:bg-slate-800"} />
            </div>

            {/* Recent Patients */}
            <div className="card p-0 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">Assigned Patients</h2>
                    <Link to="/caregiver/patients" className="text-sm font-medium text-primary-600 hover:underline">View All</Link>
                </div>
                {patients.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No patients assigned to you yet.</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {patients.map(p => (
                            <Link to={`/caregiver/patients/${p.id}`} key={p.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-dark-200 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {p.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                                    <div className="text-xs text-slate-500">{p.medicines_count} medicines • {p.today_doses} doses today</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{p.adherence}%</div>
                                    <div className="text-xs text-slate-400">Adherence</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
