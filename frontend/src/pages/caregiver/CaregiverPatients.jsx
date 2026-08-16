import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { MdSearch, MdPerson } from 'react-icons/md'

export default function CaregiverPatients() {
    const [patients, setPatients] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/caregiver/patients')
            .then(res => setPatients(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Patients</h1>
                    <p className="text-slate-500 text-sm mt-1">View and manage your assigned patients</p>
                </div>
            </div>

            <div className="card py-4">
                <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        className="input pl-10"
                        placeholder="Search patients by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="card text-center py-12 text-slate-500">
                    <MdPerson size={64} className="mx-auto text-slate-300 mb-4" />
                    No patients found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(p => (
                        <Link to={`/caregiver/patients/${p.id}`} key={p.id} className="card hover:border-primary-500/50 hover:shadow-lg transition-all duration-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-sm">
                                    {p.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">{p.name}</div>
                                    <div className="text-sm text-slate-500 truncate max-w-[150px]">{p.email}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-dark-200">
                                    <div className="text-lg font-bold text-primary-600">{p.medicines_count}</div>
                                    <div className="text-xs text-slate-500">Medicines</div>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-dark-200">
                                    <div className="text-lg font-bold text-emerald-600">{p.adherence}%</div>
                                    <div className="text-xs text-slate-500">Adherence</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
