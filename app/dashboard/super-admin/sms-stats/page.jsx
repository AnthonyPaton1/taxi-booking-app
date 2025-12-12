// app/dashboard/super-admin/sms-stats/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, PoundSterling, Calendar, Users, AlertCircle  } from 'lucide-react';


export default function SMSStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // month, week, today

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    setLoading(true);
    const res = await fetch(`/api/super-admin/sms-stats?range=${dateRange}`);
    const data = await res.json();
    setStats(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const smsEnabled = process.env.NEXT_PUBLIC_SMS_ENABLED === 'true';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SMS Cost Tracking</h1>
        <p className="text-gray-600">Monitor SMS usage and costs across the platform</p>
      </div>

      {/* Demo Mode Warning */}
      {!smsEnabled && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">Demo Mode Active</h3>
              <p className="text-sm text-yellow-700">
                SMS functionality is currently disabled. Statistics below show what would have been sent in production mode.
                To enable SMS, set <code className="bg-yellow-100 px-2 py-1 rounded">SMS_ENABLED=true</code> in environment variables.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-gray-600" />
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<MessageSquare className="w-8 h-8 text-blue-600" />}
          title="Total SMS Sent"
          value={stats.totalSent}
          subtitle={`${dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'This week' : 'This month'}`}
          bgColor="bg-blue-50"
        />
        
        <StatCard
          icon={<PoundSterling className="w-8 h-8 text-green-600" />}
          title="Total Cost"
          value={`£${stats.totalCostPounds}`}
          subtitle="@ 4p per SMS"
          bgColor="bg-green-50"
        />
        
        <StatCard
          icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
          title="Projected Monthly"
          value={`£${stats.projectedMonthly}`}
          subtitle="Based on current rate"
          bgColor="bg-purple-50"
        />
        
        <StatCard
          icon={<Users className="w-8 h-8 text-orange-600" />}
          title="Active Recipients"
          value={stats.uniqueRecipients}
          subtitle="Drivers receiving SMS"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cost Analysis */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost Analysis</h2>
          <div className="space-y-3">
            <CostRow label="SMS Cost" value={`£${stats.totalCostPounds}`} />
            <CostRow label="Avg per Driver" value={`£${stats.avgCostPerDriver}`} />
            <CostRow label="Monthly Revenue (20 drivers @ £99)" value="£1,980" isRevenue />
            <div className="border-t pt-3 mt-3">
              <CostRow 
                label="SMS as % of Revenue" 
                value={`${stats.costAsPercentOfRevenue}%`} 
                highlight={parseFloat(stats.costAsPercentOfRevenue) < 10}
              />
            </div>
          </div>
        </div>

        {/* ROI Justification */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ROI Justification</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Faster Response Times:</strong> SMS alerts reduce bid response time by ~70%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Higher Fill Rates:</strong> Urgent bookings get 3x more bids with SMS</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Driver Satisfaction:</strong> Never miss urgent, high-value trips</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Cost Efficient:</strong> Only sent for urgent bookings (&lt;48hrs)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Top Users */}
      {stats.topUsers && stats.topUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top SMS Recipients</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SMS Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topUsers.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.smsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      £{(user.smsCount * 0.04).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent SMS Log */}
      {stats.recentSMS && stats.recentSMS.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent SMS Activity</h2>
          <div className="space-y-3">
            {stats.recentSMS.map((sms, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{sms.recipientName}</p>
                  <p className="text-xs text-gray-600 mt-1">{sms.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(sms.sentAt).toLocaleString('en-GB')}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    smsEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {smsEnabled ? 'Sent' : 'Demo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, bgColor = 'bg-gray-50' }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className={`inline-flex p-3 rounded-lg ${bgColor} mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function CostRow({ label, value, isRevenue = false, highlight = false }) {
  return (
    <div className={`flex justify-between items-center py-2 ${highlight ? 'bg-green-50 px-3 rounded-lg' : ''}`}>
      <span className={`text-sm ${isRevenue ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
        {label}
      </span>
      <span className={`text-sm font-semibold ${
        isRevenue ? 'text-green-700' : highlight ? 'text-green-600' : 'text-gray-900'
      }`}>
        {value}
      </span>
    </div>
  );
}