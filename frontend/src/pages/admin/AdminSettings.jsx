import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AdminSettings() {
    const { darkMode, toggleDarkMode } = useAuth()

    return (
        <div className="space-y-6 fade-in max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Global administrative settings</p>
            </div>

            <div className="card space-y-4">
                <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Appearance</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">Dark Mode</div>
                        <div className="text-sm text-slate-500">Toggle dark/light interface</div>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={`toggle ${darkMode ? 'bg-primary-600' : 'bg-slate-200'}`}
                    >
                        <span className={`toggle-thumb ${darkMode ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <div className="card">
                <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Database Info</h2>
                <div className="space-y-2 text-sm font-mono bg-slate-50 dark:bg-dark-200 rounded-xl p-4 text-slate-600 dark:text-slate-300">
                    <div>Engine: SQLite (dev) / PostgreSQL (prod)</div>
                    <div>ORM: SQLAlchemy</div>
                    <div>Auth: JWT (HS256)</div>
                </div>
            </div>
        </div>
    )
}
