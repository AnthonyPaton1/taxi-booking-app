"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Star,
} from "lucide-react";

export default function AdminFeedbackClient({ feedback }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Feedback & Complaints
            </h1>
            <p className="text-gray-600 mt-1">
              {feedback.length} feedback item{feedback.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Feedback System Coming Soon
              </h3>
              <p className="text-blue-800 text-sm">
                The feedback and complaints system is currently under development. 
                Once completed, you'll be able to:
              </p>
              <ul className="mt-3 space-y-2 text-blue-800 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  View customer feedback on completed bookings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Monitor driver ratings and performance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Track and respond to complaints
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Generate quality reports
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Placeholder Content */}
        {feedback.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No feedback yet
            </h3>
            <p className="text-gray-600">
              Feedback will appear here once the system is activated
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < item.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                {item.comment && (
                  <p className="text-gray-700">{item.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}