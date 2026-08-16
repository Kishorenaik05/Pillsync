import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import {
    MdPerson, MdEmail, MdPhone, MdContactPhone, MdLock,
    MdCameraAlt, MdVisibility, MdVisibilityOff, MdCheckCircle, MdSave
} from 'react-icons/md'

function PasswordStrength({ password }) {
    const checks = [
        { label: '8+ characters', ok: password.length >= 8 },
        { label: 'Uppercase', ok: /[A-Z]/.test(password) },
        { label: 'Number', ok: /\d/.test(password) },
        { label: 'Symbol', ok: /[^a-zA-Z0-9]/.test(password) },
    ]
    const score = checks.filter(c => c.ok).length
    const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500']
    const labels = ['Weak', 'Fair', 'Good', 'Strong']
    if (!password) return null
    return (
        <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < score ? colors[score - 1] : 'bg-slate-200 dark:bg-slate-700'}`} />
                ))}
            </div>
            <div className="flex gap-3 flex-wrap">
                {checks.map(({ label, ok }) => (
                    <span key={label} className={`text-xs flex items-center gap-1 ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        <MdCheckCircle size={12} className={ok ? 'opacity-100' : 'opacity-30'} />
                        {label}
                    </span>
                ))}
            </div>
        </div>
    )
}

function PasswordInput({ value, onChange, placeholder, required, minLength }) {
    const [show, setShow] = useState(false)
    return (
        <div className="relative">
            <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
                type={show ? 'text' : 'password'}
                className="input pl-10 pr-10"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
            />
            <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
                {show ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            </button>
        </div>
    )
}

export default function Profile() {
    const { user, setUser } = useAuth()
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    })
    const [passw, setPassw] = useState({ current_password: '', new_password: '', confirm_password: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [pwSaving, setPwSaving] = useState(false)
    const [pwMatch, setPwMatch] = useState(null) // null=untouched, true, false

    useEffect(() => {
        const load = async () => {
            try {
                const r = await api.get('/profile/')
                setProfile({
                    name: r.data.name || '',
                    phone: r.data.phone || '',
                    emergency_contact_name: r.data.emergency_contact_name || '',
                    emergency_contact_phone: r.data.emergency_contact_phone || '',
                })
            } catch { }
            setLoading(false)
        }
        load()
    }, [])

    const handleConfirmChange = (val) => {
        setPassw(p => ({ ...p, confirm_password: val }))
        if (val) setPwMatch(val === passw.new_password)
        else setPwMatch(null)
    }

    const updateProfile = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.put('/profile/', profile)
            toast.success('Profile updated successfully ✨')
        } catch {
            toast.error('Failed to update profile')
        }
        setSaving(false)
    }

    const changePassword = async (e) => {
        e.preventDefault()
        if (passw.new_password !== passw.confirm_password) {
            toast.error('New passwords do not match')
            return
        }
        if (passw.new_password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }
        setPwSaving(true)
        try {
            await api.post('/profile/change-password', passw)
            toast.success('Password changed successfully 🔐')
            setPassw({ current_password: '', new_password: '', confirm_password: '' })
            setPwMatch(null)
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Failed to change password')
        }
        setPwSaving(false)
    }

    const handleAvatar = async (e) => {
        const f = e.target.files[0]
        if (!f) return
        if (f.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5 MB')
            return
        }
        const fd = new FormData()
        fd.append('file', f)
        try {
            const r = await api.post('/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
            toast.success('Avatar updated 📸')
            // Build the full URL (Vite proxies /api/* but not /uploads/*)
            const fullPicUrl = `http://localhost:8000${r.data.profile_picture}`
            const updatedUser = { ...user, profile_picture: fullPicUrl }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setUser(updatedUser)
        } catch {
            toast.error('Failed to upload avatar')
        }
    }

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-6 fade-in max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your personal information and account security</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Avatar Card ── */}
                <div className="card text-center flex flex-col items-center justify-center py-10 lg:row-span-1">
                    <div className="relative group cursor-pointer mb-5">
                        {user?.profile_picture ? (
                            <img
                                src={user.profile_picture}
                                alt="avatar"
                                className="w-28 h-28 rounded-full object-cover border-4 border-primary-200 dark:border-primary-700 shadow-lg"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-400 via-violet-400 to-pink-400 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                            <div className="text-center text-white">
                                <MdCameraAlt size={26} />
                                <span className="text-[10px] font-medium">Change</span>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
                        </label>
                    </div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">{user?.name}</h2>
                    <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
                    <span className="badge badge-blue mt-3 capitalize">{user?.role}</span>
                    <p className="text-xs text-slate-400 mt-4 px-4">Click your photo to upload a new avatar (max 5 MB)</p>
                </div>

                {/* ── Personal Info ── */}
                <div className="card lg:col-span-2">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                        <MdPerson className="text-primary-500" size={20} />
                        Personal Information
                    </h2>
                    <form onSubmit={updateProfile} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="label">Full Name *</label>
                            <div className="relative">
                                <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    className="input pl-10"
                                    value={profile.name}
                                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    required
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="label">Email Address</label>
                            <div className="relative">
                                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    className="input pl-10 opacity-70 cursor-not-allowed"
                                    value={user?.email || ''}
                                    readOnly
                                    placeholder="your@email.com"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Email cannot be changed here</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="label">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
                            <div className="relative">
                                <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    className="input pl-10"
                                    value={profile.phone}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    placeholder="+91 99999 99999"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Emergency Contact Name</label>
                                <div className="relative">
                                    <MdContactPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        className="input pl-10"
                                        value={profile.emergency_contact_name}
                                        onChange={e => setProfile({ ...profile, emergency_contact_name: e.target.value })}
                                        placeholder="Caregiver name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Emergency Contact Phone</label>
                                <div className="relative">
                                    <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        className="input pl-10"
                                        value={profile.emergency_contact_phone}
                                        onChange={e => setProfile({ ...profile, emergency_contact_phone: e.target.value })}
                                        placeholder="+91 88888 88888"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? (
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <MdSave size={18} />
                            )}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                {/* ── Change Password ── */}
                <div className="card lg:col-span-3">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                        <MdLock className="text-violet-500" size={20} />
                        Change Password
                    </h2>
                    <form onSubmit={changePassword} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                        {/* Current */}
                        <div>
                            <label className="label">Current Password</label>
                            <PasswordInput
                                value={passw.current_password}
                                onChange={e => setPassw(p => ({ ...p, current_password: e.target.value }))}
                                required
                                placeholder="Your current password"
                            />
                        </div>

                        {/* New */}
                        <div>
                            <label className="label">New Password</label>
                            <PasswordInput
                                value={passw.new_password}
                                onChange={e => setPassw(p => ({ ...p, new_password: e.target.value }))}
                                required
                                minLength={8}
                                placeholder="At least 8 characters"
                            />
                            <PasswordStrength password={passw.new_password} />
                        </div>

                        {/* Confirm */}
                        <div>
                            <label className="label">Confirm New Password</label>
                            <PasswordInput
                                value={passw.confirm_password}
                                onChange={e => handleConfirmChange(e.target.value)}
                                required
                                placeholder="Repeat new password"
                            />
                            {pwMatch === false && (
                                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                    ✗ Passwords do not match
                                </p>
                            )}
                            {pwMatch === true && (
                                <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                                    ✓ Passwords match
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-3">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={pwSaving || pwMatch === false}
                            >
                                {pwSaving ? (
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <MdLock size={18} />
                                )}
                                {pwSaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
