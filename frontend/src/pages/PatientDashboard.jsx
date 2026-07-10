import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, LogOut, FileText, Bell } from 'lucide-react';

export default function PatientDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profiles/patient/me');
        setProfile(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          // Profile not created yet
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
                <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                  <Bell className="h-5 w-5 mr-2 text-primary" />
                  Upcoming Medications
                </h3>
                <div className="rounded-md bg-blue-50 p-4 border border-blue-100">
                  <p className="text-sm text-blue-700">No medications scheduled for today. (Feature coming soon in Milestone 2)</p>
                </div>
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
    </div>
  );
}
