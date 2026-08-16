import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    MdDashboard, MdMedication, MdAlarm, MdDocumentScanner,
    MdLocalPharmacy, MdBarChart, MdNotifications, MdPerson,
    MdSettings, MdLogout, MdMenuOpen, MdClose,
    MdLightMode, MdDarkMode,
} from 'react-icons/md'
import { useState } from 'react'
import toast from 'react-hot-toast'
import useNotifications from '../hooks/useNotifications'

const nav = [
    { to: 'dashboard', icon: MdDashboard, label: 'Dashboard' },
    { to: 'medicines', icon: MdMedication, label: 'Medicines' },
    { to: 'reminders', icon: MdAlarm, label: 'Reminders' },
    { to: 'ocr', icon: MdDocumentScanner, label: 'OCR / Scan' },
    { to: 'refills', icon: MdLocalPharmacy, label: 'Refill Tracker' },
    { to: 'analytics', icon: MdBarChart, label: 'Analytics' },
    { to: 'notifications', icon: MdNotifications, label: 'Notifications' },
    { to: 'profile', icon: MdPerson, label: 'Profile' },
    { to: 'settings', icon: MdSettings, label: 'Settings' },
]

export default function Layout() {
    const { user, logout, darkMode, toggleDarkMode } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const { pendingCount } = useNotifications()

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully')
        navigate('/')
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* ── Sidebar ── */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-16'
                    } bg-white dark:bg-dark-100 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 flex-shrink-0 shadow-sm`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 via-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white text-lg font-bold">P</span>
                    </div>
                    {sidebarOpen && (
                        <span className="font-extrabold text-lg shimmer-text">PillSync</span>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
                    {nav.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <Icon size={20} className="flex-shrink-0" />
                            {sidebarOpen && <span>{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 pb-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <button
                        onClick={handleLogout}
                        className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                    >
                        <MdLogout size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="bg-white/90 dark:bg-dark-100/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 h-16 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                        {sidebarOpen ? <MdMenuOpen size={24} /> : <MdClose size={24} />}
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Dark mode toggle */}
                        <button
                            onClick={toggleDarkMode}
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            className="relative p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                        >
                            {darkMode
                                ? <MdLightMode size={22} className="text-amber-400" />
                                : <MdDarkMode size={22} />}
                        </button>

                        {/* Notifications bell */}
                        <NavLink
                            to="notifications"
                            className="relative p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                        >
                            <MdNotifications size={22} />
                            {pendingCount > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-dark-100 pulse-glow" />
                            )}
                        </NavLink>

                        {/* User avatar */}
                        <NavLink to="profile" className="flex items-center gap-2 group">
                            {user?.profile_picture ? (
                                <img src={user.profile_picture} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 via-violet-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden md:inline group-hover:text-primary-600 transition-colors">
                                {user?.name}
                            </span>
                        </NavLink>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
