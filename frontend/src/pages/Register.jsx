import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '' })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.password !== form.confirm_password) {
            toast.error('Passwords do not match')
            return
        }
        setLoading(true)
        try {
            await register(form.name, form.email, form.password, form.confirm_password)
            toast.success('Account created! Please sign in.')
            navigate('/login')
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-900 via-teal-800 to-primary-700 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
                <div className="absolute top-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl" />
                <div className="relative text-center">
                    <div className="text-6xl mb-6 float">🏥</div>
                    <h2 className="text-4xl font-extrabold mb-4">Join PillSync</h2>
                    <p className="text-white/70 text-lg max-w-sm">
                        Start your medication journey today. Free forever. No credit card required.
                    </p>
                    <div className="mt-10 grid grid-cols-2 gap-3 w-full max-w-xs">
                        {[['Smart Reminders', '🔔'], ['OCR Scanning', '📄'], ['Analytics', '📊'], ['Refill Alerts', '💊']].map(([f, e]) => (
                            <div key={f} className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl px-3 py-2.5 text-sm font-medium text-center">
                                {e} {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50 dark:bg-dark-200">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <span className="text-white font-bold">P</span>
                        </div>
                        <span className="font-bold text-xl text-primary-700">PillSync</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
                    <p className="text-slate-500 mb-8">Fill in the details below to get started.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label">Full Name</label>
                            <div className="relative">
                                <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="input pl-10" placeholder="John Doe" required />
                            </div>
                        </div>
                        <div>
                            <label className="label">Email Address</label>
                            <div className="relative">
                                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input pl-10" placeholder="you@example.com" required />
                            </div>
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type={showPass ? 'text' : 'password'} value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input pl-10 pr-10" placeholder="Min 8 characters" required minLength={8} />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="label">Confirm Password</label>
                            <div className="relative">
                                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="password" value={form.confirm_password}
                                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                                    className="input pl-10" placeholder="Re-enter password" required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
