import { useEffect, useRef, useState, useCallback } from 'react'
import api from '../api/client'

/**
 * useNotifications
 * ─────────────────
 * • Requests browser Notification permission (if setting is enabled)
 * • Fetches today's reminders from the backend every 5 minutes
 * • Schedules a browser notification 2 minutes before each reminder time
 * • Returns { pendingCount, permissionGranted, requestPermission }
 */
export default function useNotifications() {
    const timersRef = useRef([])          // holds all scheduled setTimeout IDs
    const scheduledRef = useRef(new Set()) // tracks reminder IDs already scheduled
    const [pendingCount, setPendingCount] = useState(0)
    const [permissionGranted, setPermissionGranted] = useState(
        () => Notification?.permission === 'granted'
    )

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Convert "HH:MM" string to today's Date object minus 2 minutes.
     * Returns null if the trigger time is in the past.
     */
    const getReminderTriggerTime = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number)
        const now = new Date()
        const trigger = new Date()
        trigger.setHours(h, m - 2, 0, 0)        // 2 min before scheduled time
        const msUntil = trigger.getTime() - now.getTime()
        return msUntil > 0 ? msUntil : null      // null means already past
    }

    const getPeriodLabel = (timeStr) => {
        const [h] = timeStr.split(':').map(Number)
        if (h >= 5 && h < 12) return '🌅 Morning'
        if (h >= 12 && h < 17) return '☀️ Afternoon'
        if (h >= 17 && h < 20) return '🌆 Evening'
        return '🌙 Night'
    }

    const showNotification = async (reminder) => {
        if (Notification.permission !== 'granted') return
        const notificationsEnabled = localStorage.getItem('reminderNotifications') !== 'false'
        if (!notificationsEnabled) return

        const medicineName = reminder.medicine_name || `Medicine #${reminder.medicine_id}`
        const timeLabel = getPeriodLabel(reminder.reminder_time)

        const title = '💊 PillSync — Medicine Reminder'
        const options = {
            body: `Time to take ${medicineName}${reminder.dosage ? ` (${reminder.dosage})` : ''} at ${reminder.reminder_time}.\n${timeLabel} — It's time to take your medicine.`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `reminder-${reminder.id}`,
            requireInteraction: true,
        }

        // Chrome requires notifications to go through a Service Worker
        // (direct new Notification() is silently blocked in Chrome)
        if ('serviceWorker' in navigator) {
            try {
                const reg = await navigator.serviceWorker.ready
                reg.showNotification(title, options)
                return
            } catch (err) {
                console.warn('SW notification failed, falling back:', err)
            }
        }

        // Fallback for browsers without SW support (e.g. older Safari)
        new Notification(title, options)
    }


    // ── Core scheduling ───────────────────────────────────────────────────────

    const scheduleReminders = useCallback(async () => {
        if (Notification.permission !== 'granted') return

        let reminders = []
        let medicines = []

        try {
            const [rRes, mRes] = await Promise.all([
                api.get('/reminders/today'),
                api.get('/medicines/'),
            ])
            reminders = rRes.data
            medicines = mRes.data
        } catch {
            return
        }

        // Build medicine lookup map
        const medMap = {}
        medicines.forEach(m => { medMap[m.id] = m })

        // Pending reminders only
        const pending = reminders.filter(r => r.status === 'pending')
        setPendingCount(pending.length)

        pending.forEach(reminder => {
            const uniqueKey = `${reminder.id}-${reminder.reminder_time}`
            if (scheduledRef.current.has(uniqueKey)) return  // already scheduled

            const msUntil = getReminderTriggerTime(reminder.reminder_time)
            if (msUntil === null) return  // past — skip

            // Enrich with medicine info
            const med = medMap[reminder.medicine_id] || {}
            const enriched = { ...reminder, medicine_name: med.name, dosage: med.dosage }

            const timer = setTimeout(() => {
                showNotification(enriched)
                scheduledRef.current.delete(uniqueKey)
            }, msUntil)

            timersRef.current.push(timer)
            scheduledRef.current.add(uniqueKey)
        })
    }, [])

    // ── Request permission ────────────────────────────────────────────────────

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return false
        const result = await Notification.requestPermission()
        const granted = result === 'granted'
        setPermissionGranted(granted)
        if (granted) {
            localStorage.setItem('reminderNotifications', 'true')
            scheduleReminders()
        }
        return granted
    }, [scheduleReminders])

    // ── Effect: run on mount + every 5 minutes ────────────────────────────────

    useEffect(() => {
        scheduleReminders()

        const interval = setInterval(scheduleReminders, 5 * 60 * 1000)

        return () => {
            clearInterval(interval)
            timersRef.current.forEach(clearTimeout)
            timersRef.current = []
        }
    }, [scheduleReminders])

    return { pendingCount, permissionGranted, requestPermission }
}
