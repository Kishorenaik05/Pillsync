import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, LogOut, FileText, Bell, Plus, Check, X, BellRing } from 'lucide-react';
import AddMedicationModal from '../components/AddMedicationModal';
import { requestNotificationPermission, sendLocalNotification } from '../services/notificationService';

export default function PatientDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const fetchProfileAndReminders = async () => {
    try {
      const response = await api.get('/profiles/patient/me');
      setProfile(response.data);
      
      const remindersRes = await api.get('/reminders/today');
      setReminders(remindersRes.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // Profile not created yet
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndReminders();
    
    // Check initial notification permission
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationEnabled(true);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationEnabled(granted);
    if (granted) {
      sendLocalNotification("PillSync Notifications Enabled", {
        body: "You will receive desktop push notifications for your scheduled medications!"
      });
    } else {
      alert("Notification permission was denied. Please allow notifications in your browser settings.");
    }
  };

  // Background reminder checker for desktop popups
  useEffect(() => {
    if (!notificationEnabled || reminders.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHoursStr = String(now.getHours()).padStart(2, '0');
      const currentMinutesStr = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHoursStr}:${currentMinutesStr}`;

      reminders.forEach(reminder => {
        if (reminder.status === 'PENDING') {
          // reminder.time_of_day format is HH:MM:SS or HH:MM
          const scheduledTimeStr = reminder.time_of_day.substring(0, 5);
          if (scheduledTimeStr === currentTimeStr) {
            sendLocalNotification(`Medication Reminder: ${reminder.medicine_name}`, {
              body: `It's time to take ${reminder.medicine_name} (${reminder.medicine_strength || ''}).`,
              tag: `med-${reminder.schedule_id}-${currentTimeStr}` // Prevent duplicate popups within the same minute
            });
          }
        }
      });
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [reminders, notificationEnabled]);

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      date_of_birth: formData.get('dob'),
      blood_group: formData.get('blood_group')
    };
    try {
      const response = await api.post('/profiles/patient/me', data);
      setProfile(response.data);
    } catch (err) {
      alert('Failed to create profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">PillSync Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user?.email}</span>
              <button
                onClick={logout}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Your Profile
                </h3>
                {loading ? (
                  <p className="mt-4 text-sm text-gray-500">Loading...</p>
                ) : profile ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-gray-900">{profile.first_name} {profile.last_name}</p>
                    <p className="text-sm text-gray-500">DOB: {profile.date_of_birth || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Blood Group: {profile.blood_group || 'N/A'}</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreateProfile} className="mt-4 space-y-4">
                    <input name="first_name" placeholder="First Name" required className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-primary focus:border-primary" />
                    <input name="last_name" placeholder="Last Name" required className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-primary focus:border-primary" />
                    <input name="dob" type="date" className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-primary focus:border-primary" />
                    <input name="blood_group" placeholder="Blood Group (e.g. O+)" className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-primary focus:border-primary" />
                    <button type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 text-sm font-medium">Create Profile</button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-primary" />
                    Upcoming Medications
                  </h3>
                  <div className="flex space-x-2">
                    {!notificationEnabled && (
                      <button
                        onClick={handleEnableNotifications}
                        className="inline-flex items-center px-3 py-1.5 border border-amber-300 text-xs font-medium rounded-md shadow-sm text-amber-800 bg-amber-50 hover:bg-amber-100 focus:outline-none"
                      >
                        <BellRing className="h-3.5 w-3.5 mr-1" />
                        Enable Desktop Alerts
                      </button>
                    )}
                    {profile && (
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Medication
                      </button>
                    )}
                  </div>
                </div>
                
                {reminders.length === 0 ? (
                  <div className="rounded-md bg-blue-50 p-4 border border-blue-100">
                    <p className="text-sm text-blue-700">No medications scheduled for today.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {reminders.map(reminder => (
                      <li key={reminder.schedule_id} className="py-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-900">{reminder.medicine_name} - {reminder.medicine_strength}</p>
                          <p className="text-xs text-gray-500">Scheduled: {reminder.time_of_day} • {reminder.frequency}</p>
                        </div>
                        <div>
                          {reminder.status === 'PENDING' ? (
                            <div className="flex space-x-2">
                              <button 
                                onClick={async () => {
                                  try {
                                    await api.post(`/reminders/${reminder.schedule_id}/log`, { status: 'TAKEN', scheduled_time: new Date().toISOString() });
                                    fetchProfileAndReminders();
                                  } catch(e) { alert('Error logging'); }
                                }}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-3 w-3 mr-1" /> Take
                              </button>
                              <button 
                                onClick={async () => {
                                  try {
                                    await api.post(`/reminders/${reminder.schedule_id}/log`, { status: 'MISSED', scheduled_time: new Date().toISOString() });
                                    fetchProfileAndReminders();
                                  } catch(e) { alert('Error logging'); }
                                }}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                              >
                                <X className="h-3 w-3 mr-1" /> Miss
                              </button>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reminder.status === 'TAKEN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {reminder.status}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Medical History
                </h3>
                <p className="text-sm text-gray-500">Your medical records and documents will appear here.</p>
              </div>
            </div>
          </div>
          
        </div>
      </main>

      <AddMedicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdded={() => fetchProfileAndReminders()} 
      />
    </div>
  );
}
