'use client';

import { useState } from 'react';
import { Download, Database, Shield, Loader2, FileJson, FileArchive } from 'lucide-react';

export default function AdminDataExportPage() {
  const [format, setFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export data');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const today = new Date().toISOString().split('T')[0];
      const extension = format === 'json' ? 'json' : 'zip';
      a.download = `neat_data_export_${today}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(`Successfully exported data as ${format.toUpperCase()}`);
    } catch (err) {
      setError(err.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Data Export</h1>
          </div>
          <p className="text-gray-600">
            Export complete business data for backup, compliance, or migration purposes.
            This includes all users, bookings, bids, businesses, and system data.
          </p>
        </div>

        {/* GDPR Compliance Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-2">GDPR Compliance</h2>
              <p className="text-sm text-blue-800 mb-3">
                This export function fulfills data portability requirements under GDPR Articles 15 and 20.
                All personally identifiable information is included for comprehensive compliance.
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Article 15:</strong> Right of access by the data subject</li>
                <li>• <strong>Article 20:</strong> Right to data portability</li>
                <li>• <strong>Retention:</strong> 7 years for financial records</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Export Format</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* JSON Option */}
            <button
              onClick={() => setFormat('json')}
              className={`p-6 rounded-lg border-2 transition-all ${
                format === 'json'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <FileJson className={`w-8 h-8 ${format === 'json' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-lg font-semibold">Single JSON File</span>
              </div>
              <p className="text-sm text-gray-600 text-left">
                All data in one structured JSON file. Best for programmatic access and parsing.
              </p>
            </button>

            {/* ZIP Option */}
            <button
              onClick={() => setFormat('zip')}
              className={`p-6 rounded-lg border-2 transition-all ${
                format === 'zip'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <FileArchive className={`w-8 h-8 ${format === 'zip' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-lg font-semibold">ZIP Archive</span>
              </div>
              <p className="text-sm text-gray-600 text-left">
                Separate JSON files for each entity type. Better organization for large datasets.
              </p>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Exporting Data...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export {format.toUpperCase()}
              </>
            )}
          </button>
        </div>

        {/* What's Included */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Included Data</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">User Data</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All user accounts</li>
                <li>• Admin profiles</li>
                <li>• Coordinator details</li>
                <li>• Manager information</li>
                <li>• Driver profiles & vehicles</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Business Data</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Business registrations</li>
                <li>• Service areas</li>
                <li>• All advanced bookings</li>
                <li>• All instant bookings</li>
                <li>• Bid history</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Compliance</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Incident reports</li>
                <li>• Accessibility profiles</li>
                <li>• Approval status history</li>
                <li>• Timestamps & metadata</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Statistics</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Export metadata</li>
                <li>• Entity counts</li>
                <li>• Status breakdowns</li>
                <li>• Audit trail</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Security Notice:</strong> This export contains sensitive business and personal data.
            Ensure the exported file is stored securely and access is restricted to authorized personnel only.
            Do not share via unsecured channels.
          </p>
        </div>
      </div>
    </div>
  );
}