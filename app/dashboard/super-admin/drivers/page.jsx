'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, XCircle, Trash2, Search,  
   AlertCircle, Loader2, Car,  ArrowLeft, PlayCircle, PauseCircle 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SuperAdminDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchDrivers();
  }, [filter]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL' 
        ? '/api/super-admin/drivers'
        : `/api/super-admin/drivers?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch drivers');
      }

      setDrivers(data.drivers);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId) => {
    if (!confirm('Are you sure you want to approve this driver?')) return;

    try {
      setActionLoading(driverId);
      const response = await fetch(`/api/super-admin/drivers/${driverId}/approve`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve driver');
      }

      setSuccess('Driver approved successfully');
      fetchDrivers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleReject = async (driverId) => {
    try {
      setActionLoading(driverId);
      const response = await fetch(`/api/super-admin/drivers/${driverId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject driver');
      }

      setSuccess('Driver rejected');
      setShowModal(false);
      setRejectReason('');
      fetchDrivers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  };
  const handleSuspend = async (driverId, shouldSuspend) => {
  if (!confirm(shouldSuspend 
    ? 'Are you sure you want to suspend this driver? They will not appear in any bookings.' 
    : 'Are you sure you want to activate this driver?'
  )) {
    return;
  }

  setActionLoading(driverId);

  try {
    const response = await fetch(`/api/super-admin/drivers/${driverId}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        suspended: shouldSuspend,
        reason: shouldSuspend ? 'Suspended by admin' : null 
      }),
    });

    if (response.ok) {
      toast.success(shouldSuspend ? 'Driver suspended' : 'Driver activated');
      router.refresh();
    } else {
      const data = await response.json();
      toast.error(data.error || 'Failed to update driver');
    }
  } catch (error) {
    console.error('Suspend error:', error);
    toast.error('An error occurred');
  } finally {
    setActionLoading(null);
  }
};

  const handleDelete = async (driverId) => {
    if (!confirm('Are you sure you want to delete this driver? This cannot be undone.')) return;

    try {
      setActionLoading(driverId);
      const response = await fetch(`/api/super-admin/drivers/${driverId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete driver');
      }

      setSuccess('Driver deleted successfully');
      fetchDrivers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

const filteredDrivers = drivers.filter(driver => {
  // Filter by status
  if (filter === 'PENDING') return !driver.approved && !driver.suspended;
  if (filter === 'APPROVED') return driver.approved && !driver.suspended;
  if (filter === 'SUSPENDED') return driver.suspended; // ← NEW
  
  // Search filter
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    return (
      driver.user.name?.toLowerCase().includes(search) ||
      driver.user.email?.toLowerCase().includes(search)
    );
  }
  
  return true; // ALL
});

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Car className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
                <p className="text-gray-600">Approve, reject, and manage driver applications</p>
              </div>
            </div>
            <Link 
              href="/dashboard/super-admin"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Drivers</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
              <div className="text-sm text-green-700">Approved</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-900">{stats.suspended}</div>
              <div className="text-sm text-red-700">Suspended</div>
            </div>
            
          </div>
          
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'APPROVED', 'SUSPENDED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-600">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Drivers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No drivers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th> 
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
  </tr>
</thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{driver.user.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{driver.user.email}</div>
                        <div className="text-sm text-gray-500">{driver.user.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{driver.vehicleType}</div>
                          <div className="text-gray-500">{driver.vehicleReg}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          driver.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {driver.approved ? 'APPROVED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
  <div className="flex flex-col gap-1">
    {/* DBS Status */}
    {driver.compliance?.dbsUpdateServiceNumber ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✓ DBS Clear
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ✗ DBS Missing
      </span>
    )}
    
    {/* License Status */}
    {driver.compliance?.licenceNumber ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✓ License OK
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ✗ License Missing
      </span>
    )}
  </div>
</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(driver.user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                            <button
    onClick={() => handleSuspend(driver.id, !driver.suspended)}
    disabled={actionLoading === driver.id}
    className={`p-2 rounded-lg transition disabled:opacity-50 ${
      driver.suspended 
        ? 'text-green-600 hover:bg-green-50' 
        : 'text-amber-600 hover:bg-amber-50'
    }`}
    title={driver.suspended ? 'Activate Driver' : 'Suspend Driver'}
  >
    {actionLoading === driver.id ? (
      <Loader2 className="w-5 h-5 animate-spin" />
    ) : driver.suspended ? (
      <PlayCircle className="w-5 h-5" />
    ) : (
      <PauseCircle className="w-5 h-5" />
    )}
  </button>
                          {!driver.approved && (
                            <>
                              <button
                                onClick={() => handleApprove(driver.id)}
                                disabled={actionLoading === driver.id}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                title="Approve"
                              >
                                {actionLoading === driver.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-5 h-5" />
                                )}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(driver.id)}
                            disabled={actionLoading === driver.id}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Driver Application</h3>
            <p className="text-sm text-gray-600 mb-4">
              You are about to reject <strong>{selectedDriver.user.name}</strong>'s application.
              Please provide a reason:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectReason('');
                  setSelectedDriver(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedDriver.id)}
                disabled={!rejectReason.trim() || actionLoading === selectedDriver.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === selectedDriver.id ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Reject Driver'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}