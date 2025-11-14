"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?take=50');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
      });
      
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'BOOKING_AVAILABLE':
      case 'BOOKING_ASSIGNED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BOOKING_CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'BID_ACCEPTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAYMENT_RECEIVED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get booking link based on which booking exists
  const getBookingLink = (notification) => {
    if (notification.advancedBooking) {
      return `/dashboard/bookings/advanced/${notification.advancedBookingId}`;
    }
    if (notification.instantBooking) {
      return `/dashboard/bookings/instant/${notification.instantBookingId}`;
    }
    return null;
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">
          {unreadCount > 0 
            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
            : 'You\'re all caught up!'
          }
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <CheckCheck className="w-5 h-5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {filter !== 'all' ? filter : ''} notifications
          </h3>
          <p className="text-gray-600">
            {filter === 'unread' 
              ? "You're all caught up! Check back later for updates."
              : "When you receive notifications, they'll appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const payload = notification.payload || {};
            const bookingLink = getBookingLink(notification);
            
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow border-2 transition-all hover:shadow-md ${
                  !notification.read 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-100'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Type Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(notification.type)}`}>
                      {notification.type.replace(/_/g, ' ')}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {payload.title || 'Notification'}
                        </h3>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium flex-shrink-0"
                          >
                            <Check className="w-4 h-4" />
                            Mark read
                          </button>
                        )}
                      </div>

                      <p className="text-gray-700 mb-3">
                        {payload.message || 'New notification'}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        
                        {bookingLink && (
                          <Link
                            href={bookingLink}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Booking Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}