import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function CaregiverSettings() {
    const { darkMode, toggleDarkMode } = useAuth()
    const [notifs, setNotifs] = useState(localStorage.getItem('caregiverNotifs') !== 'false')

    const toggle = (newVal) => {
        setNotifs(newVal)
        localStorage.setItem('caregiverNotifs', newVal)
        toast.success(`Caregiver notifications ${newVal ? 'enabled' : 'disabled'}`)
    }

    return (
        <div className="space-y-6 fade-in max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your caregiver preferences</p>
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

            <div className="card space-y-4">
                <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Notifications</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-slate-900 dark:text-white">Patient Alerts</div>
                        <div className="text-sm text-slate-500">Get notified about missed doses and refills</div>
                    </div>
                    <button
                        onClick={() => toggle(!notifs)}
                        className={`toggle ${notifs ? 'bg-primary-600' : 'bg-slate-200'}`}
                    >
                        <span className={`toggle-thumb ${notifs ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    )
}
