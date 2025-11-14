"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type the confirmation text exactly');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account deleted successfully');
        // Sign out and redirect to home
        await signOut({ redirect: false });
        router.push('/');
      } else {
        toast.error(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('An error occurred while deleting your account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Delete Account</h1>
              <p className="text-sm text-gray-600">Permanently delete your NEAT Transport account</p>
            </div>
          </div>

          {!showFinalConfirm ? (
            /* Warning Screen */
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">⚠️ Warning: This action cannot be undone</h3>
                <p className="text-sm text-red-800">
                  Deleting your account will permanently remove all your data from our systems.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">What will be deleted:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Trash2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Your personal information (name, email, phone)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trash2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Driver profile and compliance records (if applicable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trash2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Business profile (if applicable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trash2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>All booking history and bids</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trash2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Account settings and preferences</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📝 Before you delete:</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Complete or cancel all active bookings</li>
                  <li>• Download any important data you need</li>
                  <li>• Settle any outstanding payments</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowFinalConfirm(true)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Continue to Delete
                </button>
              </div>
            </div>
          ) : (
            /* Final Confirmation */
            <div className="space-y-6">
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                <h3 className="font-bold text-red-900 mb-2">Final Confirmation Required</h3>
                <p className="text-sm text-red-800 mb-4">
                  Type <strong>DELETE MY ACCOUNT</strong> below to confirm deletion:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFinalConfirm(false);
                    setConfirmText('');
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Go Back
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading || confirmText !== 'DELETE MY ACCOUNT'}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    'Permanently Delete Account'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}