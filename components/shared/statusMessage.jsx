// components/shared/StatusMessage.jsx
"use client"

export default function StatusMessage({ message, type = "info" }) {
  if (!message) return null;

  const isError = type === "error";
  const isSuccess = type === "success";

  const role = isError ? "alert" : "status";
  const ariaLive = isError ? "assertive" : "polite";
  const baseClasses = "px-4 py-3 rounded mt-4 text-sm text-center";

  const styles = isError
    ? "bg-red-100 border border-red-400 text-red-700"
    : isSuccess
    ? "bg-green-100 border border-green-400 text-green-700"
    : "bg-blue-100 border border-blue-400 text-blue-700";

  return (
    <div
      tabIndex="-1"
      role={role}
      aria-live={ariaLive}
      className={`${baseClasses} ${styles}`}
    >
      {isError && <strong>Error:</strong>} {message}
    </div>
  );
}