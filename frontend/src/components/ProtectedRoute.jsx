import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useAuth()
    const location = useLocation()

    if (!user) return <Navigate to="/login" replace state={{ from: location }} />

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
        if (user.role === 'caregiver') return <Navigate to="/caregiver/dashboard" replace />
        return <Navigate to="/app/dashboard" replace />
    }

    return children
}
