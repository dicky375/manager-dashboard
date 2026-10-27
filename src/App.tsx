import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { RefreshCw, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

interface Booking {
  id: string;
  host_name: string;
  host_phone: string;
  guest_count: number;
  start_at: string;
  status: string;
  manage_code: string;
  table_name: string;
}

export default function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/admin/bookings');
      const data = await response.json();
      // Sort by date/time
      setBookings(data.sort((a: any, b: any) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()));
    } catch (error) {
      toast.error('Failed to connect to API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update');
      }
      
      toast.success(`Marked as ${newStatus}`);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">La Bella Staff Portal</h1>
            <p className="text-gray-500 mt-1">Manage live reservations and table seating.</p>
          </div>
          <button 
            onClick={fetchBookings} 
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <tr>
                <th className="p-4 font-semibold">Date & Time</th>
                <th className="p-4 font-semibold">Guest Info</th>
                <th className="p-4 font-semibold">Table</th>
                <th className="p-4 font-semibold">Party Size</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => {
                const date = new Date(b.start_at);
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="p-4">
                      <div className="font-semibold text-gray-900">
                        {new Intl.DateTimeFormat('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit', 
                          hour12: true 
                        }).format(date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Intl.DateTimeFormat('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        }).format(date)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{b.host_name}</div>
                      <div className="text-sm text-gray-500">{b.host_phone}</div>
                      <div className="text-xs font-mono bg-gray-100 inline-block px-2 py-1 rounded mt-1 text-gray-600">
                        {b.manage_code}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-full text-sm">
                        {b.table_name}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4 text-gray-400" />
                        {b.guest_count}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        b.status === 'CONFIRMED' || b.status === 'HELD' ? 'bg-green-100 text-green-700' :
                        b.status === 'SEATED' ? 'bg-blue-100 text-blue-700' :
                        b.status === 'COMPLETED' ? 'bg-gray-200 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {(b.status === 'CONFIRMED' || b.status === 'HELD') && (
                        <>
                          <button 
                            onClick={() => updateStatus(b.id, 'SEATED')}
                            className="inline-flex items-center gap-1 bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700"
                          >
                            <CheckCircle className="w-4 h-4" /> Seat
                          </button>
                          <button 
                            onClick={() => updateStatus(b.id, 'CANCELLED')}
                            className="inline-flex items-center gap-1 bg-white border border-red-200 text-red-600 text-sm px-3 py-1.5 rounded-md hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" /> Cancel
                          </button>
                        </>
                      )}
                      {b.status === 'SEATED' && (
                        <button 
                          onClick={() => updateStatus(b.id, 'COMPLETED')}
                          className="inline-flex items-center gap-1 bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md hover:bg-gray-900"
                        >
                          <Clock className="w-4 h-4" /> Finish
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    No reservations found for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}