import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Medicines from './pages/Medicines'
import Reminders from './pages/Reminders'
import OCR from './pages/OCR'
import Refills from './pages/Refills'
import Analytics from './pages/Analytics'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import CaregiverLayout from './components/CaregiverLayout'
import AdminLayout from './components/AdminLayout'

import CaregiverDashboard from './pages/caregiver/CaregiverDashboard'
import CaregiverPatients from './pages/caregiver/CaregiverPatients'
import CaregiverPatientDetail from './pages/caregiver/CaregiverPatientDetail'
import CaregiverSettings from './pages/caregiver/CaregiverSettings'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAssignments from './pages/admin/AdminAssignments'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminSettings from './pages/admin/AdminSettings'

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Patient app routes */}
                    <Route
                        path="/app"
                        element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="medicines" element={<Medicines />} />
                        <Route path="reminders" element={<Reminders />} />
                        <Route path="ocr" element={<OCR />} />
                        <Route path="refills" element={<Refills />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Caregiver app routes */}
                    <Route
                        path="/caregiver"
                        element={
                            <ProtectedRoute allowedRoles={['caregiver']}>
                                <CaregiverLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<CaregiverDashboard />} />
                        <Route path="patients" element={<CaregiverPatients />} />
                        <Route path="patients/:id" element={<CaregiverPatientDetail />} />
                        <Route path="missed-alerts" element={<div className="p-6 h-full font-bold text-slate-500">Missed Alerts Page (Placeholder)</div>} />
                        <Route path="refill-alerts" element={<div className="p-6 h-full font-bold text-slate-500">Refill Alerts Page (Placeholder)</div>} />
                        <Route path="settings" element={<CaregiverSettings />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>

                    {/* Admin app routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="assignments" element={<AdminAssignments />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="notifications" element={<AdminNotifications />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
