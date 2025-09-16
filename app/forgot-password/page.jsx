"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Reset link sent! Check your email.");
      } else {
        setMessage(`❌ ${data.error || "Something went wrong"}`);
      }
    } catch (err) {
      setMessage("❌ Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded"
      role="main"
      aria-labelledby="forgot-password-heading"
    >
      <h1 id="forgot-password-heading" className="text-xl font-bold mb-4">
        Forgot Password
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="forgot-password-instructions">
        <p id="forgot-password-instructions" className="text-sm text-gray-600 mb-2">
          Enter your email address and we’ll send you a link to reset your password.
        </p>

        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Enter your email"
          aria-required="true"
          aria-label="Email address"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          aria-disabled={loading}
          aria-busy={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {message && (
        <p
          className="mt-4 text-sm text-center"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </main>
  );
}