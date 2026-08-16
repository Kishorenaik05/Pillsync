import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || null
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const loggedInUser = await login(form.email, form.password)
            toast.success('Welcome back!')

            if (from) {
                navigate(from, { replace: true })
                return
            }

            if (loggedInUser.role === 'admin') {
                navigate('/admin/dashboard', { replace: true })
            } else if (loggedInUser.role === 'caregiver') {
                navigate('/caregiver/dashboard', { replace: true })
            } else {
                navigate('/app/dashboard', { replace: true })
            }
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-violet-800 to-pink-700 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
                <div className="absolute top-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
                <div className="relative text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl mb-6 mx-auto float shadow-xl">💊</div>
                    <h2 className="text-4xl font-extrabold mb-4">Welcome Back!</h2>
                    <p className="text-white/70 text-lg max-w-sm">
                        Your health journey continues here. Sign in to manage your medications and stay on track.
                    </p>
                    <div className="mt-10 flex flex-wrap gap-3 justify-center">
                        {['Smart Reminders 🔔', 'Push Notifications 💬', 'OCR Scanning 📄', 'Analytics 📊'].map(f => (
                            <span key={f} className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">{f}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50 dark:bg-dark-200">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <span className="text-white font-bold">P</span>
                        </div>
                        <span className="font-bold text-xl text-primary-700">PillSync</span>
                    </Link>

                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sign In</h1>
                    <p className="text-slate-500 mb-8">Enter your credentials to access your dashboard.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label">Email Address</label>
                            <div className="relative">
                                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input pl-10"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input pl-10 pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 font-medium hover:underline">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
