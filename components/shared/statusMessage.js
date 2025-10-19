// components/dashboard/shared/statusMessage.jsx
"use client";

import { AlertCircle, CheckCircle, Info, Loader2 } from "lucide-react";

export default function StatusMessage({ message, type = "info" }) {
  if (!message) return null;

  const getStyles = () => {
    switch (type) {
      case "error":
        return {
          container: "bg-red-50 border-red-200 text-red-800",
          icon: AlertCircle,
          iconColor: "text-red-600",
        };
      case "success":
        return {
          container: "bg-green-50 border-green-200 text-green-800",
          icon: CheckCircle,
          iconColor: "text-green-600",
        };
      case "loading":
        return {
          container: "bg-blue-50 border-blue-200 text-blue-800",
          icon: Loader2,
          iconColor: "text-blue-600 animate-spin",
        };
      default:
        return {
          container: "bg-blue-50 border-blue-200 text-blue-800",
          icon: Info,
          iconColor: "text-blue-600",
        };
    }
  };

  const styles = getStyles();
  const Icon = message === "loading" ? Loader2 : styles.icon;
  const isLoading = message === "loading";

  return (
    <div className={`flex items-start gap-3 p-4 mb-6 rounded-lg border-2 ${styles.container}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />
      <p className="flex-1">
        {isLoading ? "Processing..." : message}
      </p>
    </div>
  );
}