"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token.");
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.message || "Something went wrong.");
    } else {
      setMessage("Password set successfully. Redirecting to login…");
      setTimeout(() => router.push("/login"), 1500);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Set Your Password</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {message && <p className="text-green-600 mb-3">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 rounded text-white ${
            submitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? "Saving..." : "Save Password"}
        </button>
      </form>
    </div>
  );
}