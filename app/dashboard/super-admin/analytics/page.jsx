'use client';

import Link from 'next/link';
import { TrendingUp, ArrowLeft, Wrench } from 'lucide-react';

export default function SuperAdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Council reports, care provider insights, and system metrics</p>
              </div>
            </div>
            <Link 
              href="/dashboard/super-admin"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
          </div>

          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Coming Soon</h2>
            <p className="text-gray-600 mb-4">Comprehensive analytics dashboard for partnerships</p>
            <div className="text-sm text-gray-500 space-y-2">
              <div>✓ Council regional reports (rides, coverage, economic impact)</div>
              <div>✓ Care provider monthly reports (costs, savings, compliance)</div>
              <div>✓ System-wide statistics and trends</div>
              <div>✓ PDF export functionality</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}