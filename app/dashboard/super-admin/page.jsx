'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Car, Building2, TrendingUp, AlertCircle, 
  Database, Shield, MessageSquare, ChevronRight, Clock, Loader2
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/super-admin/stats');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">System-wide management and analytics</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats?.overview?.totalUsers || 0}
              </span>
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Car className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats?.overview?.totalDrivers || 0}
              </span>
            </div>
            <div className="text-sm text-gray-600">Active Drivers</div>
            {stats?.overview?.pendingDrivers > 0 && (
              <div className="mt-2 text-xs text-orange-600 font-medium">
                {stats.overview.pendingDrivers} pending approval
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats?.overview?.totalBusinesses || 0}
              </span>
            </div>
            <div className="text-sm text-gray-600">Businesses</div>
            {stats?.overview?.totalHouses > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                {stats.overview.totalHouses} houses total
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats?.overview?.totalBookings || 0}
              </span>
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
            {stats?.overview?.completedBookings > 0 && (
              <div className="mt-2 text-xs text-green-600 font-medium">
                {stats.overview.completedBookings} completed
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Driver Management */}
            <Link
              href="/dashboard/super-admin/drivers"
              className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Driver Management</h3>
                <p className="text-sm text-gray-600">Approve, reject, and manage drivers</p>
                {stats?.pendingDrivers > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                    <Clock className="w-3 h-3" />
                    {stats.pendingDrivers} pending
                  </div>
                )}
              </div>
            </Link>

            {/* Business Management */}
            <Link
              href="/dashboard/super-admin/businesses"
              className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Business Management</h3>
                <p className="text-sm text-gray-600">View and manage all businesses</p>
              </div>
            </Link>

            {/* User Management */}
            <Link
              href="/dashboard/super-admin/users"
              className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">User Management</h3>
                <p className="text-sm text-gray-600">Manage users and roles</p>
              </div>
            </Link>

            {/* Analytics */}
            <Link
              href="/dashboard/super-admin/analytics"
              className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Analytics Dashboard</h3>
                <p className="text-sm text-gray-600">Council & care provider reports</p>
              </div>
            </Link>

            {/* Data Export */}
            <Link
              href="/dashboard/admin/export"
              className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Data Export</h3>
                <p className="text-sm text-gray-600">GDPR compliance & backups</p>
              </div>
            </Link>

            {/* System Settings */}
  <Link href="/dashboard/super-admin/sms-stats">
  <div className="flex items-start gap-4 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <MessageSquare className="w-6 h-6 text-blue-600" />
      </div>
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900 mb-1">SMS Cost Tracking</h3>
      <p className="text-sm text-gray-600">Monitor SMS usage and operational costs</p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400 mt-3" />
  </div>
</Link>
          </div>
        </div>

        {/* Pending Actions */}
        {stats?.pendingDrivers > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Action Required</h3>
                <p className="text-sm text-orange-800 mb-3">
                  You have {stats.pendingDrivers} driver application{stats.pendingDrivers > 1 ? 's' : ''} waiting for approval.
                </p>
                <Link
                  href="/dashboard/super-admin/drivers?filter=PENDING"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                >
                  Review Applications
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}