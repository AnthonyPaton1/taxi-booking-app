"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  MessageSquare,
  Home,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";

export default function CoordinatorIncidentsClient({
  user,
  incidents,
  feedback,
}) {
  const [activeTab, setActiveTab] = useState("incidents");
  const [filterType, setFilterType] = useState("all");
  const [filterEmergency, setFilterEmergency] = useState("all");

  // Filter incidents
  const filteredIncidents = incidents.filter((incident) => {
    if (filterEmergency === "emergency" && !incident.emergency) return false;
    if (filterEmergency === "non-emergency" && incident.emergency) return false;
    return true;
  });

  // Filter feedback
  const filteredFeedback = feedback.filter((item) => {
    if (filterType === "complaint" && item.type !== "COMPLAINT") return false;
    if (filterType === "note" && item.type !== "NOTE") return false;
    return true;
  });

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
            href="/dashboard/coordinator"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Incidents & Feedback
            </h1>
            <p className="text-gray-600 mt-1">
              {user.area?.name} - Audit trail and compliance reports
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Incidents"
            value={incidents.length}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="orange"
          />
          <StatCard
            title="Emergencies"
            value={incidents.filter((i) => i.emergency).length}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
            highlight
          />
          <StatCard
            title="Total Feedback"
            value={feedback.length}
            icon={<MessageSquare className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Complaints"
            value={feedback.filter((f) => f.type === "COMPLAINT").length}
            icon={<MessageSquare className="w-6 h-6" />}
            color="yellow"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("incidents")}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === "incidents"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Incidents ({incidents.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("feedback")}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === "feedback"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Feedback ({feedback.length})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "incidents" ? (
              <>
                {/* Filters */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Filter:
                    </span>
                  </div>
                  <select
                    value={filterEmergency}
                    onChange={(e) => setFilterEmergency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Incidents</option>
                    <option value="emergency">Emergencies Only</option>
                    <option value="non-emergency">Non-Emergency</option>
                  </select>
                </div>

                {/* Incidents List */}
                {filteredIncidents.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No incidents reported</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredIncidents.map((incident) => (
                      <IncidentCard
                        key={incident.id}
                        incident={incident}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Filters */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Filter:
                    </span>
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Feedback</option>
                    <option value="complaint">Complaints Only</option>
                    <option value="note">Notes Only</option>
                  </select>
                </div>

                {/* Feedback List */}
                {filteredFeedback.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No feedback submitted</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFeedback.map((item) => (
                      <FeedbackCard
                        key={item.id}
                        feedback={item}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
const StatCard = ({ title, value, icon, color, highlight }) => {
  const colors = {
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };

  return (
    <div
      className={`${colors[color]} ${
        highlight ? "ring-2 ring-red-400" : ""
      } border rounded-lg p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-medium opacity-75">{title}</h3>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

// Incident Card Component
const IncidentCard = ({ incident, formatDate }) => (
  <div
    className={`border-l-4 ${
      incident.emergency ? "border-red-500 bg-red-50" : "border-orange-500 bg-white"
    } rounded-r-lg p-5 shadow-sm hover:shadow-md transition-shadow`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              incident.emergency
                ? "bg-red-600 text-white"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {incident.emergency ? "🚨 EMERGENCY" : "⚠️ Incident"}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
            {incident.type}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Home className="w-4 h-4" />
            <span className="font-medium">{incident.house.label}</span>
            <span className="text-gray-400">•</span>
            <span>Manager: {incident.house.manager.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Reported by: {incident.user.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatDate(incident.time)}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-700 font-medium mb-1">Description:</p>
          <p className="text-sm text-gray-800">{incident.description}</p>
        </div>

        {incident.actionsTaken && (
          <div className="bg-green-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-green-700 font-medium mb-1">
              Actions Taken:
            </p>
            <p className="text-sm text-green-800">{incident.actionsTaken}</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          {incident.followUp ? (
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Follow-up Required</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">No Follow-up Needed</span>
            </div>
          )}
        </div>
      </div>

      {incident.image && (
        <img
          src={incident.image}
          alt="Incident evidence"
          className="w-24 h-24 object-cover rounded-lg ml-4"
        />
      )}
    </div>
  </div>
);

// Feedback Card Component
const FeedbackCard = ({ feedback, formatDate }) => {
  const booking = feedback.advancedBooking || feedback.instantBooking;

  return (
    <div
      className={`border-l-4 ${
        feedback.type === "COMPLAINT"
          ? "border-yellow-500 bg-yellow-50"
          : "border-blue-500 bg-white"
      } rounded-r-lg p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                feedback.type === "COMPLAINT"
                  ? "bg-yellow-600 text-white"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {feedback.type === "COMPLAINT" ? "⚠️ Complaint" : "📝 Note"}
            </span>
            {feedback.resolved ? (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Resolved
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-600 text-sm font-medium">
                <XCircle className="w-4 h-4" />
                Pending
              </span>
            )}
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Submitted by: {feedback.user.name}</span>
            </div>
            {booking && (
              <div className="text-sm text-gray-600">
                <p>Trip: {booking.pickupLocation} → {booking.dropoffLocation}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(booking.pickupTime)}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatDate(feedback.createdAt)}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700 font-medium mb-1">Message:</p>
            <p className="text-sm text-gray-800">{feedback.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};