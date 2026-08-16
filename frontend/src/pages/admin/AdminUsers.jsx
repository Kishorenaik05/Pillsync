import { useState, useEffect } from 'react'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { MdSearch, MdEdit, MdCheck, MdClose } from 'react-icons/md'

const ROLE_BADGE = { admin: 'badge-red', caregiver: 'badge-purple', patient: 'badge-blue' }

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})

    const load = () => {
        setLoading(true)
        api.get('/admin/users', { params: { search, role: roleFilter || undefined } })
            .then(res => setUsers(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [search, roleFilter])

    const startEdit = (u) => {
        setEditingId(u.id)
        setEditForm({ name: u.name, role: u.role, is_active: u.is_active })
    }

    const saveEdit = async (id) => {
        try {
            await api.put(`/admin/users/${id}`, editForm)
            toast.success('User updated')
            setEditingId(null)
            load()
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Error updating user')
        }
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
                <p className="text-slate-500 text-sm mt-1">View and manage all platform users</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input className="input pl-10" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="input sm:w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="patient">Patient</option>
                    <option value="caregiver">Caregiver</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-dark-200">
                            <tr>
                                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No users found.</td></tr>
                            ) : users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-dark-200 transition-colors">
                                    <td className="px-4 py-3">
                                        {editingId === u.id ? (
                                            <input className="input py-1 text-sm" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                                        ) : (
                                            <span className="font-semibold text-slate-900 dark:text-white">{u.name}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                                    <td className="px-4 py-3">
                                        {editingId === u.id ? (
                                            <select className="input py-1 text-sm" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                                                <option value="patient">Patient</option>
                                                <option value="caregiver">Caregiver</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        ) : (
                                            <span className={`badge ${ROLE_BADGE[u.role] || 'badge-blue'}`}>{u.role}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingId === u.id ? (
                                            <button onClick={() => setEditForm(f => ({ ...f, is_active: !f.is_active }))}
                                                className={`badge ${editForm.is_active ? 'badge-green' : 'badge-red'} cursor-pointer`}>
                                                {editForm.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        ) : (
                                            <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                                    <td className="px-4 py-3">
                                        {editingId === u.id ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => saveEdit(u.id)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"><MdCheck size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><MdClose size={16} /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEdit(u)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><MdEdit size={16} /></button>
                                        )}
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
