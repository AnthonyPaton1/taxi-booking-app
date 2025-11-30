// components/dashboard/driver/PendingConfirmations.jsx
"use client";

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { confirmBid, withdrawBid, getDriverPendingConfirmations } from '@/app/actions/bidding/bidActions';
import { toast } from 'sonner';

export default function PendingConfirmations() {
  const [pendingBids, setPendingBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);

  useEffect(() => {
    loadPendingBids();
    
    // Refresh every minute to update countdown
    const interval = setInterval(loadPendingBids, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadPendingBids() {
    const result = await getDriverPendingConfirmations();
    if (result.success) {
      setPendingBids(result.bids);
    }
    setLoading(false);
  }

  async function handleConfirm(bidId) {
    if (!confirm('Confirm this booking? You will be committed to completing this trip.')) {
      return;
    }

    setConfirming(bidId);
    const result = await confirmBid(bidId);
    
    if (result.success) {
      toast.success('Booking confirmed!');
      loadPendingBids();
    } else {
      toast.error(result.error || 'Failed to confirm booking');
    }
    setConfirming(null);
  }

  async function handleWithdraw(bidId) {
    const reason = prompt('Please provide a reason for withdrawal:');
    if (!reason) return;

    setWithdrawing(bidId);
    const result = await withdrawBid(bidId, reason);
    
    if (result.success) {
      toast.success('Bid withdrawn');
      loadPendingBids();
    } else {
      toast.error(result.error || 'Failed to withdraw bid');
    }
    setWithdrawing(null);
  }

  function getTimeRemaining(expiresAt) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'EXPIRED';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  function getUrgencyColor(expiresAt) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const hoursRemaining = (expires - now) / (1000 * 60 * 60);
    
    if (hoursRemaining <= 2) return 'text-red-600 bg-red-50';
    if (hoursRemaining <= 6) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (pendingBids.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          ⏰ Awaiting Your Confirmation
        </h2>
      </div>

      <p className="text-gray-600 mb-6">
        You have <strong>{pendingBids.length}</strong> accepted bid{pendingBids.length !== 1 ? 's' : ''} waiting for confirmation.
        You must confirm within 24 hours or they will be reopened to other drivers.
      </p>

      <div className="space-y-4">
        {pendingBids.map(bid => {
          const timeRemaining = getTimeRemaining(bid.expiresAt);
          const urgencyClass = getUrgencyColor(bid.expiresAt);
          
          return (
            <div 
              key={bid.id}
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition"
            >
              {/* Countdown Timer */}
              <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg ${urgencyClass}`}>
                <Clock className="w-5 h-5" />
                <span className="font-bold">
                  {timeRemaining === 'EXPIRED' ? '⚠️ EXPIRED' : `Expires in ${timeRemaining}`}
                </span>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {bid.booking.pickupLocation} → {bid.booking.dropoffLocation}
                  </h3>
                  <div className="space-y-1 text-gray-600">
                    <p>📅 {new Date(bid.booking.pickupDate).toLocaleDateString()}</p>
                    <p>🕐 {bid.booking.pickupTime}</p>
                    <p>👥 {bid.booking.passengerCount} passenger{bid.booking.passengerCount !== 1 ? 's' : ''}</p>
                    {bid.booking.wheelchairUsers > 0 && (
                      <p>♿ {bid.booking.wheelchairUsers} wheelchair user{bid.booking.wheelchairUsers !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Your Bid</p>
                    <p className="text-3xl font-bold text-green-600">£{bid.price}</p>
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              {(bid.booking.wheelchairAccess || bid.booking.femaleDriverOnly || bid.booking.assistanceAnimal) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-blue-900 mb-2">Special Requirements:</p>
                  <ul className="space-y-1 text-blue-800">
                    {bid.booking.wheelchairAccess && <li>♿ Wheelchair accessible vehicle required</li>}
                    {bid.booking.femaleDriverOnly && <li>👩 Female driver only</li>}
                    {bid.booking.assistanceAnimal && <li>🐕‍🦺 Assistance animal on board</li>}
                    {bid.booking.quietEnvironment && <li>🔇 Quiet environment preferred</li>}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleConfirm(bid.id)}
                  disabled={confirming === bid.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {confirming === bid.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Booking
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleWithdraw(bid.id)}
                  disabled={withdrawing === bid.id}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {withdrawing === bid.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-800 border-t-transparent"></div>
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Withdraw Bid
                    </>
                  )}
                </button>
              </div>

              {/* Warning */}
              {timeRemaining !== 'EXPIRED' && (
                <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    If you don't confirm within 24 hours, this booking will automatically be reopened to other drivers.
                    Withdrawing now has no penalty.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}