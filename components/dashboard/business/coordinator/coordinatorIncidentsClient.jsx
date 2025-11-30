// components/dashboard/coordinator/CoordinatorIncidentsClient.jsx
"use client";

// Same component as AdminIncidentsClient, just different header link
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  Home,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import { formatDateTime } from "@/lib/dateUtils";

export default function CoordinatorIncidentsClient({ incidents }) {
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);



  const getIncidentTypeColor = (type) => {
    const colors = {
      "Fall/Injury": "bg-red-100 text-red-800 border-red-300",
      "Equipment Failure": "bg-orange-100 text-orange-800 border-orange-300",
      "Medical Event": "bg-purple-100 text-purple-800 border-purple-300",
      "Behavioral Issue": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Vehicle Damage": "bg-blue-100 text-blue-800 border-blue-300",
      "Handover Issue": "bg-pink-100 text-pink-800 border-pink-300",
      Other: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[type] || colors.Other;
  };

  const filteredIncidents = incidents.filter((incident) => {
    if (filter === "emergency") return incident.emergency;
    if (filter === "followUp") return incident.followUp && !incident.resolved;
    if (filter === "resolved") return incident.resolved;
    return true;
  });

  const stats = {
    total: incidents.length,
    emergency: incidents.filter((i) => i.emergency).length,
    followUp: incidents.filter((i) => i.followUp && !i.resolved).length,
    resolved: incidents.filter((i) => i.resolved).length,
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
              Incident Reports
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredIncidents.length} incident
              {filteredIncidents.length !== 1 ? "s" : ""}
              {filter !== "all" && ` (filtered)`}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              filter === "all"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Total Incidents
              </span>
              <AlertCircle className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </button>

          <button
            onClick={() => setFilter("emergency")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              filter === "emergency"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Emergency
              </span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              {stats.emergency}
            </p>
          </button>

          <button
            onClick={() => setFilter("followUp")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              filter === "followUp"
                ? "border-yellow-500 bg-yellow-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Needs Follow-up
              </span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.followUp}
            </p>
          </button>

          <button
            onClick={() => setFilter("resolved")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              filter === "resolved"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Resolved
              </span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </p>
          </button>
        </div>

        {/* Incidents List - Same as Admin */}
        {filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No incidents {filter !== "all" && "in this category"}
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "All incidents reported by drivers and managers will appear here"
                : "Try changing the filter to see other incidents"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map((incident) => {
              const isExpanded = expandedId === incident.id;

              return (
                <div
                  key={incident.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div
                    className={`p-5 ${
                      incident.emergency
                        ? "bg-red-50 border-l-4 border-red-500"
                        : incident.followUp && !incident.resolved
                        ? "bg-yellow-50 border-l-4 border-yellow-500"
                        : "border-l-4 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getIncidentTypeColor(
                              incident.type
                            )}`}
                          >
                            {incident.type}
                          </span>
                          {incident.emergency && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs rounded-full font-semibold">
                              <AlertTriangle className="w-3 h-3" />
                              EMERGENCY
                            </span>
                          )}
                          {incident.followUp && !incident.resolved && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-semibold">
                              <Clock className="w-3 h-3" />
                              FOLLOW-UP REQUIRED
                            </span>
                          )}
                          {incident.resolved && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full font-semibold">
                              <CheckCircle className="w-3 h-3" />
                              RESOLVED
                            </span>
                          )}
                        </div>

                        <p className="text-gray-900 font-medium line-clamp-2">
                          {incident.description}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : incident.id)
                        }
                        className="ml-4 p-2 hover:bg-gray-100 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(incident.time)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>
                          {incident.user.name} ({incident.user.role})
                        </span>
                      </div>
                      {incident.house && (
                        <div className="flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          <span>{incident.house.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 border-t space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Full Description
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {incident.description}
                        </p>
                      </div>

                      {incident.actionsTaken && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Actions Taken
                          </h4>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {incident.actionsTaken}
                          </p>
                        </div>
                      )}

                      {incident.evidenceUrl && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Witnesses Present
                          </h4>
                          <p className="text-gray-700">{incident.evidenceUrl}</p>
                        </div>
                      )}

                      {incident.image && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Evidence Photo
                          </h4>
                          <img
                            src={incident.image}
                            alt="Incident evidence"
                            className="max-w-md rounded-lg border"
                          />
                        </div>
                      )}

                      <div className="pt-4 border-t text-sm text-gray-500">
                        <p>
                          Reported on {formatDateTime(incident.createdAt)} by{" "}
                          {incident.user.name}
                        </p>
                        <p className="text-xs mt-1">ID: {incident.id}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}