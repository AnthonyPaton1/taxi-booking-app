'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, ArrowLeft, Search, Trash2, Edit, 
  Loader2, X, AlertTriangle, Check, Home, Users
} from 'lucide-react';

export default function SuperAdminBusinessesPage() {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalHouses: 0, totalBookings: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', address: '', phone: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/super-admin/businesses');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch businesses');
      }

      setBusinesses(data.businesses);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (businessId) => {
    const business = businesses.find(b => b.id === businessId);
    const hasData = business._count.houses > 0 || business._count.advancedBookings > 0;
    
    const message = hasData
      ? `Are you sure? This business has ${business._count.houses} houses and ${business._count.advancedBookings + business._count.instantBookings} bookings.`
      : 'Are you sure you want to delete this business?';

    if (!confirm(message)) return;

    try {
      setActionLoading(businessId);
      const response = await fetch(`/api/super-admin/businesses/${businessId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete business');
      }

      setSuccess('Business deleted successfully');
      fetchBusinesses();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleEdit = (business) => {
    setSelectedBusiness(business);
    setEditForm({
      name: business.name,
      address: business.address || '',
      phone: business.phone || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedBusiness) return;

    try {
      setActionLoading(selectedBusiness.id);
      const response = await fetch(`/api/super-admin/businesses/${selectedBusiness.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update business');
      }

      setSuccess('Business updated successfully');
      setShowEditModal(false);
      setSelectedBusiness(null);
      fetchBusinesses();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const filteredBusinesses = (businesses || []).filter(biz =>
    biz.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    biz.address1?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Management</h1>
                <p className="text-gray-600">View, edit, and manage all businesses</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{stats.total}</div>
              <div className="text-sm text-purple-700">Total Businesses</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{stats.totalHouses}</div>
              <div className="text-sm text-blue-700">Total Houses</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{stats.totalBookings}</div>
              <div className="text-sm text-green-700">Total Bookings</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by business name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Businesses Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : !filteredBusinesses || filteredBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No businesses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Houses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Managers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBusinesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{business.name}</div>
                        {business.address && (
                          <div className="text-sm text-gray-500">{business.address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {business.phone || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Home className="w-4 h-4 text-gray-400" />
                          {business._count.housesAsBusiness}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Users className="w-4 h-4 text-gray-400" />
                          {business.employees.length}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {business._count.advancedBookings + business._count.instantBookings}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(business)}
                            disabled={actionLoading === business.id}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(business.id)}
                            disabled={actionLoading === business.id}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                            title="Delete"
                          >
                            {actionLoading === business.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
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

      {/* Edit Modal */}
      {showEditModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Business</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBusiness(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={!editForm.name || actionLoading === selectedBusiness.id}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === selectedBusiness.id ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}