import { Link } from 'react-router-dom'
import { MdMedication, MdAlarm, MdBarChart, MdNotifications, MdSecurity, MdSmartphone } from 'react-icons/md'

const features = [
    { icon: MdMedication, title: 'Medicine Tracking', desc: 'Manage all your medications in one place with dosage and schedule details.' },
    { icon: MdAlarm, title: 'Smart Reminders', desc: 'Never miss a dose with morning, afternoon, evening, and night reminders.' },
    { icon: MdBarChart, title: 'Analytics Dashboard', desc: 'Visualize your adherence trends with interactive charts and reports.' },
    { icon: MdNotifications, title: 'Push Notifications', desc: 'Get real-time alerts for due medications and refill reminders.' },
    { icon: MdSecurity, title: 'Secure & Private', desc: 'Your health data is encrypted and protected with JWT authentication.' },
    { icon: MdSmartphone, title: 'OCR Prescription Scan', desc: 'Scan your prescription and auto-extract medicine details instantly.' },
]

const testimonials = [
    { name: 'Priya Sharma', role: 'Diabetic Patient', text: 'PillSync changed my life! I never miss insulin anymore. The reminders are perfectly timed.', avatar: 'PS' },
    { name: 'Rajesh Kumar', role: 'Caregiver', text: 'Managing my mother\'s 6 medicines was chaotic. PillSync makes it so simple and organized.', avatar: 'RK' },
    { name: 'Dr. Ananya Patel', role: 'Physician', text: 'I recommend PillSync to all my patients. The adherence tracking helps me during follow-ups.', avatar: 'AP' },
]

export default function Home() {
    return (
        <div className="min-h-screen bg-white dark:bg-dark-200">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-100/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <span className="text-white text-lg font-bold">P</span>
                        </div>
                        <span className="font-bold text-xl text-primary-700 dark:text-primary-400">PillSync</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
                        <a href="#testimonials" className="hover:text-primary-600 transition-colors">Testimonials</a>
                        <a href="#contact" className="hover:text-primary-600 transition-colors">Contact</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                        <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white py-24 px-6">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-300 blur-3xl" />
                </div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        AI-Powered Medication Management
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Never Miss a<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                            Dose Again
                        </span>
                    </h1>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        PillSync combines intelligent reminders, OCR prescription scanning, and real-time analytics
                        to keep your medication routine on track — every day.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/register" className="bg-white text-primary-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl text-lg transition-all shadow-xl">
                            Start Free Today
                        </Link>
                        <Link to="/login" className="border border-white/30 bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl text-lg font-semibold transition-all">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 px-6 bg-slate-50 dark:bg-dark-200">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Everything You Need to Stay Healthy
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                            A complete ecosystem designed for patients, caregivers, and healthcare providers.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="card hover:shadow-glow transition-all duration-300 group">
                                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                                    <Icon size={24} className="text-primary-600" />
                                </div>
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 px-6 bg-white dark:bg-dark-100">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Trusted by Patients & Caregivers</h2>
                        <p className="text-slate-500 text-lg">Join thousands who rely on PillSync every day.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map(({ name, role, text, avatar }) => (
                            <div key={name} className="card">
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                                        {avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{name}</div>
                                        <div className="text-slate-400 text-xs">{role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="bg-primary-900 text-white py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">P</div>
                                <span className="font-bold text-lg">PillSync</span>
                            </div>
                            <p className="text-blue-200 text-sm">Intelligent medication management for a healthier tomorrow.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Product</h4>
                            <ul className="space-y-2 text-blue-200 text-sm">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Company</h4>
                            <ul className="space-y-2 text-blue-200 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Contact</h4>
                            <p className="text-blue-200 text-sm">support@pillsync.app</p>
                            <p className="text-blue-200 text-sm mt-1">+91 98765 43210</p>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-6 text-center text-blue-300 text-sm">
                        © {new Date().getFullYear()} PillSync. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
