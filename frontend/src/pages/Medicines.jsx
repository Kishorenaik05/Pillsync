import { useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFileDownload, MdClose, MdAccessTime } from 'react-icons/md'

// ── Helpers ──────────────────────────────────────────────────────────────────

const getPeriod = (timeStr) => {
    if (!timeStr) return null
    const [h] = timeStr.split(':').map(Number)
    if (h >= 5 && h < 12) return { label: 'Morning', emoji: '🌅', cls: 'period-morning' }
    if (h >= 12 && h < 17) return { label: 'Afternoon', emoji: '☀️', cls: 'period-afternoon' }
    if (h >= 17 && h < 20) return { label: 'Evening', emoji: '🌆', cls: 'period-evening' }
    return { label: 'Night', emoji: '🌙', cls: 'period-night' }
}

/** Extract times array from instructions field  e.g. "[08:00,20:00] After food" */
const parseTimes = (instructions) => {
    if (!instructions) return []
    const m = instructions.match(/^\[([^\]]*)\]/)
    if (!m || !m[1].trim()) return []
    return m[1].split(',').map(t => t.trim()).filter(Boolean)
}

/** Get the plain instruction text (after the time prefix) */
const parseInstructions = (instructions) => {
    if (!instructions) return ''
    return instructions.replace(/^\[[^\]]*\]\s*/, '')
}

/** Build back the instructions field from times array + plain text */
const buildInstructions = (times, text) => {
    const prefix = times.length > 0 ? `[${times.join(',')}] ` : ''
    return prefix + (text || '')
}

const FREQ_OPTIONS = [1, 2, 3, 4, 5, 6]

const EMPTY = {
    name: '', dosage: '', quantity: '', frequency: 1,
    start_date: '', end_date: '', plainInstructions: '',
    times: ['08:00'],
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Medicines() {
    const [medicines, setMedicines] = useState([])
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editing, setEditing] = useState(null)
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        try {
            const r = await api.get('/medicines/', { params: { search } })
            setMedicines(r.data)
        } catch { }
        setLoading(false)
    }, [search])

    useEffect(() => { load() }, [load])

    // Sync times array length when frequency changes
    const setFrequency = (freq) => {
        const n = Number(freq)
        const defaults = ['08:00', '13:00', '18:00', '21:00', '10:00', '15:00']
        const times = Array.from({ length: n }, (_, i) => form.times[i] || defaults[i])
        setForm(f => ({ ...f, frequency: n, times }))
    }

    const setTime = (idx, val) => {
        const times = [...form.times]
        times[idx] = val
        setForm(f => ({ ...f, times }))
    }

    const openAdd = () => {
        setForm(EMPTY)
        setEditing(null)
        setModal(true)
    }

    const openEdit = (m) => {
        const times = parseTimes(m.instructions)
        const freqNum = Number(m.frequency) || times.length || 1
        const adjustedTimes = Array.from({ length: freqNum }, (_, i) =>
            times[i] || ['08:00', '13:00', '18:00', '21:00'][i] || '08:00'
        )
        setForm({
            name: m.name,
            dosage: m.dosage,
            quantity: m.quantity,
            frequency: freqNum,
            start_date: m.start_date || '',
            end_date: m.end_date || '',
            plainInstructions: parseInstructions(m.instructions),
            times: adjustedTimes,
        })
        setEditing(m.id)
        setModal(true)
    }

    const save = async (e) => {
        e.preventDefault()
        const payload = {
            name: form.name,
            dosage: form.dosage,
            quantity: Number(form.quantity) || 0,
            frequency: String(form.frequency),
            start_date: form.start_date,
            end_date: form.end_date || null,
            instructions: buildInstructions(form.times, form.plainInstructions),
        }
        try {
            if (editing) {
                await api.put(`/medicines/${editing}`, payload)
                toast.success('Medicine updated')
            } else {
                await api.post('/medicines/', payload)
                toast.success('Medicine added')
            }
            setModal(false)
            load()
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Error saving medicine')
        }
    }

    const remove = async (id) => {
        if (!confirm('Delete this medicine?')) return
        try {
            await api.delete(`/medicines/${id}`)
            toast.success('Medicine deleted')
            load()
        } catch { toast.error('Failed to delete') }
    }

    const exportCSV = () => { window.open('/api/medicines/export/csv', '_blank') }

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Medicine Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your medications and schedules</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={exportCSV} className="btn-secondary text-sm">
                        <MdFileDownload size={18} />Export CSV
                    </button>
                    <button onClick={openAdd} className="btn-primary text-sm">
                        <MdAdd size={18} />Add Medicine
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="card py-4">
                <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        className="input pl-10"
                        placeholder="Search medicines..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-slate-50 to-primary-50/30 dark:from-dark-200 dark:to-primary-900/10">
                            <tr>
                                {['Medicine', 'Dosage', 'Qty', 'Times/Day', 'Schedule', 'Dates', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
                            ) : medicines.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                                    <div className="text-5xl mb-3 float">💊</div>
                                    <p className="font-medium">No medicines found. Add your first medicine!</p>
                                </td></tr>
                            ) : medicines.map(m => {
                                const times = parseTimes(m.instructions)
                                return (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-dark-200 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold shadow-sm">
                                                    {m.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white">{m.name}</div>
                                                    {m.instructions && (
                                                        <div className="text-xs text-slate-400 truncate max-w-[130px]">
                                                            {parseInstructions(m.instructions)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="badge badge-blue">{m.dosage}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">{m.quantity}</td>
                                        <td className="px-4 py-3">
                                            <span className="badge badge-purple">{m.frequency}×/day</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {times.length > 0
                                                    ? times.map((t, i) => {
                                                        const p = getPeriod(t)
                                                        return (
                                                            <span key={i} className={p?.cls}>
                                                                {p?.emoji} {t}
                                                            </span>
                                                        )
                                                    })
                                                    : <span className="text-slate-400 text-xs">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            <div>{m.start_date}</div>
                                            {m.end_date && <div className="text-slate-400">→ {m.end_date}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(m)}
                                                    className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                                    title="Edit"
                                                >
                                                    <MdEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => remove(m.id)}
                                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete"
                                                >
                                                    <MdDelete size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-100 rounded-2xl w-full max-w-lg shadow-2xl scale-in max-h-[90vh] flex flex-col">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editing ? '✏️ Edit Medicine' : '💊 Add New Medicine'}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">Fill in the details below</p>
                            </div>
                            <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <MdClose size={22} />
                            </button>
                        </div>

                        {/* Modal body — scrollable */}
                        <div className="overflow-y-auto px-6 py-4">
                            <form id="med-form" onSubmit={save} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="label">Medicine Name *</label>
                                    <input
                                        className="input"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        required
                                        placeholder="e.g. Metformin"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Dosage */}
                                    <div>
                                        <label className="label">Dosage *</label>
                                        <input
                                            className="input"
                                            value={form.dosage}
                                            onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                                            required
                                            placeholder="e.g. 500mg"
                                        />
                                    </div>
                                    {/* Quantity */}
                                    <div>
                                        <label className="label">Quantity</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={form.quantity}
                                            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                                            placeholder="30"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Frequency */}
                                <div>
                                    <label className="label">Frequency (times per day) *</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {FREQ_OPTIONS.map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setFrequency(n)}
                                                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 ${form.frequency === n
                                                        ? 'bg-gradient-to-br from-primary-500 to-violet-600 text-white shadow-md scale-105'
                                                        : 'bg-slate-100 dark:bg-dark-200 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                                    }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic time pickers */}
                                <div>
                                    <label className="label flex items-center gap-2">
                                        <MdAccessTime size={16} /> Scheduled Times
                                    </label>
                                    <div className="space-y-2">
                                        {Array.from({ length: form.frequency }, (_, i) => {
                                            const period = getPeriod(form.times[i])
                                            return (
                                                <div key={i} className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-400 w-6 font-medium text-center">{i + 1}.</span>
                                                    <input
                                                        type="time"
                                                        className="input flex-1"
                                                        value={form.times[i] || '08:00'}
                                                        onChange={e => setTime(i, e.target.value)}
                                                        required
                                                    />
                                                    {period && (
                                                        <span className={`${period.cls} flex-shrink-0`}>
                                                            {period.emoji} {period.label}
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Start Date */}
                                    <div>
                                        <label className="label">Start Date *</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={form.start_date}
                                            onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    {/* End Date */}
                                    <div>
                                        <label className="label">End Date</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={form.end_date}
                                            onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div>
                                    <label className="label">Instructions</label>
                                    <textarea
                                        className="input resize-none"
                                        rows={2}
                                        value={form.plainInstructions}
                                        onChange={e => setForm(f => ({ ...f, plainInstructions: e.target.value }))}
                                        placeholder="Take with food..."
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Modal footer */}
                        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => setModal(false)}
                                className="btn-secondary flex-1 justify-center"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="med-form"
                                className="btn-primary flex-1 justify-center"
                            >
                                {editing ? 'Update Medicine' : 'Add Medicine'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
