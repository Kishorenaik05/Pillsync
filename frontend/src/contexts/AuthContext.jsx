import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
    })
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
    }, [darkMode])

    const login = async (email, password) => {
        const formData = new URLSearchParams()
        formData.append('username', email)
        formData.append('password', password)
        const res = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        const token = res.data.access_token
        localStorage.setItem('token', token)

        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4))
        const jsonPayload = decodeURIComponent(window.atob(base64 + pad).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''))
        const payload = JSON.parse(jsonPayload)

        const loggedUser = { email: payload.sub, role: payload.role.toLowerCase() }
        localStorage.setItem('user', JSON.stringify(loggedUser))
        setUser(loggedUser)

        // Fetch full name from profile (stored in patient_profiles)
        try {
            const profileRes = await api.get('/profile/')
            const name = profileRes.data.name || payload.sub  // fallback to email
            const enriched = { ...loggedUser, name }
            localStorage.setItem('user', JSON.stringify(enriched))
            setUser(enriched)
        } catch { /* profile may not exist yet, name stays empty */ }

        return loggedUser
    }

    const register = async (name, email, password, confirm_password) => {
        const res = await api.post('/auth/register', { name, email, password, role: 'PATIENT' })
        return res.data
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    const toggleDarkMode = () => {
        const next = !darkMode
        setDarkMode(next)
        localStorage.setItem('darkMode', next)
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, darkMode, toggleDarkMode }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
