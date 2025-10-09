"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SetPasswordClient() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [confirm, setConfirm] = useState("")

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setMessage(null);

  if (password.length < 8) {
    setError("Password must be at least 8 characters.");
    return;
  }

  if (password !== confirm) {
    setError("Passwords do not match.");
    return;
  }

  setLoading(true);

  const res = await fetch("/api/auth/set-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  const data = await res.json();

  if (res.ok) {
    await signIn("credentials", {
      redirect: true,
      email: data.email,
      password,
      callbackUrl:
        data.role === "DRIVER"
          ? "/dashboard/driver"
          : data.role === "MANAGER"
          ? "/dashboard/manager"
          : "/dashboard/admin",
    });
  } else {
    setError(data.error || "Failed to set password");
  }

  setLoading(false);
};

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto space-y-4">
  <h1 className="text-xl font-bold text-blue-700">Set Your Password</h1>

  {error && <p className="text-red-600">{error}</p>}
  {message && <p className="text-green-600">{message}</p>}

  <div>
    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
      New Password
    </label>
    <input
      id="password"
      type="password"
      placeholder="New Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="border p-2 rounded w-full"
      required
    />
  </div>

  <div>
    <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
      Confirm Password
    </label>
    <input
      id="confirm"
      type="password"
      placeholder="Confirm Password"
      value={confirm}
      onChange={(e) => setConfirm(e.target.value)}
      className="border p-2 rounded w-full"
      required
    />
  </div>

  <button
    type="submit"
    disabled={loading}
    className="w-full bg-blue-700 text-white p-2 rounded"
  >
    {loading ? "Setting..." : "Set Password"}
  </button>
</form>
  );
}