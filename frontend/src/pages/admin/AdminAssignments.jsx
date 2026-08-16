import { useState, useEffect } from 'react'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { MdAdd, MdDelete, MdPersonAdd } from 'react-icons/md'

export default function AdminAssignments() {
    const [assignments, setAssignments] = useState([])
    const [caregivers, setCaregivers] = useState([])
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ caregiver_id: '', patient_id: '' })

    const load = () => {
        setLoading(true)
        Promise.all([
            api.get('/admin/assignments'),
            api.get('/admin/users', { params: { role: 'caregiver' } }),
            api.get('/admin/users', { params: { role: 'patient' } }),
        ]).then(([a, c, p]) => {
            setAssignments(a.data)
            setCaregivers(c.data)
            setPatients(p.data)
        }).catch(console.error).finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const create = async () => {
        if (!form.caregiver_id || !form.patient_id) { toast.error('Select both caregiver and patient'); return }
        try {
            await api.post('/admin/assignments', form)
            toast.success('Assignment created')
            setShowForm(false)
            setForm({ caregiver_id: '', patient_id: '' })
            load()
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Error creating assignment')
        }
    }

    const remove = async (id) => {
        if (!window.confirm('Delete this assignment?')) return
        try {
            await api.delete(`/admin/assignments/${id}`)
            toast.success('Assignment removed')
            load()
        } catch {
            toast.error('Error removing assignment')
        }
    }

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage caregiver-patient relationships</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    <MdPersonAdd size={18} /> Assign Caregiver
                </button>
            </div>

            {showForm && (
                <div className="card space-y-4">
                    <h2 className="font-bold text-slate-900 dark:text-white">New Assignment</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Caregiver</label>
                            <select className="input" value={form.caregiver_id} onChange={e => setForm(f => ({ ...f, caregiver_id: e.target.value }))}>
                                <option value="">Select caregiver...</option>
                                {caregivers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Patient</label>
                            <select className="input" value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}>
                                <option value="">Select patient...</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={create} className="btn-primary">Create Assignment</button>
                        <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                    </div>
                </div>
            )}

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-dark-200">
                            <tr>
                                {['Caregiver', 'Patient', 'Assigned On', ''].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-8 text-slate-400">Loading...</td></tr>
                            ) : assignments.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-8 text-slate-400">No assignments yet.</td></tr>
                            ) : assignments.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-dark-200 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900 dark:text-white">{a.caregiver_name}</div>
                                        <div className="text-xs text-slate-400">{a.caregiver_email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900 dark:text-white">{a.patient_name}</div>
                                        <div className="text-xs text-slate-400">{a.patient_email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => remove(a.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <MdDelete size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
