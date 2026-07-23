import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

export default function AddMedicationModal({ isOpen, onClose, onAdded }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    const medicineData = {
      name: formData.get('name'),
      form: formData.get('form'),
      strength: formData.get('strength'),
      quantity_in_stock: parseInt(formData.get('quantity_in_stock')) || 0,
    };

    const scheduleData = {
      frequency: formData.get('frequency'),
      time_of_day: formData.get('time_of_day'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date') || null
    };

    try {
      // 1. Create Medicine
      const medRes = await api.post('/medicines/', medicineData);
      const medicineId = medRes.data.id;

      // 2. Create Schedule
      await api.post(`/medicines/${medicineId}/schedules`, scheduleData);

      onAdded();
      onClose();
    } catch (err) {
      console.error('API Error:', err.response?.data || err);
      const errorMessage = err.response?.data?.detail || 'Failed to add medication. Ensure profile exists and inputs are valid.';
      const detailString = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);
      alert(`Error: ${detailString}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Add Medication
                  </h3>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
                    <input name="name" required className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g. Aspirin" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Form</label>
                      <input name="form" className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2 border sm:text-sm" placeholder="e.g. Tablet" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Strength</label>
                      <input name="strength" className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2 border sm:text-sm" placeholder="e.g. 500mg" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Initial Stock Quantity</label>
                    <input name="quantity_in_stock" type="number" min="0" className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2 border sm:text-sm" placeholder="e.g. 30" />
                  </div>

                  <hr className="my-4" />
                  <h4 className="text-md font-medium text-gray-900 mb-2">Schedule Details</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Frequency</label>
                      <select name="frequency" required className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2 border sm:text-sm bg-white">
                        <option value="Daily">Daily</option>
                        <option value="Twice a Day">Twice a Day</option>
                        <option value="Weekly">Weekly</option>
                        <option value="As Needed">As Needed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Time of Day</label>
                      <input name="time_of_day" type="time" required className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input name="start_date" type="date" required className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2 border sm:text-sm" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                      <input name="end_date" type="date" className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button type="submit" disabled={loading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                      {loading ? 'Adding...' : 'Add Medication'}
                    </button>
                    <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
