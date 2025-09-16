"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect after successful login
  useEffect(() => {
    if (session?.user?.dashboardUrl) {
      router.push(session.user.dashboardUrl);
    }
  }, [session, router]);

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <main className="max-w-md mx-auto mt-20 p-8 mb-30 bg-white shadow rounded">
      <h1
        className="text-xl font-bold mb-6 text-center"
        id="login-heading"
      >
        Login
      </h1>

      <form
        onSubmit={handleCredentialsLogin}
        className="space-y-4"
        aria-labelledby="login-heading"
        aria-describedby={error ? "login-error" : undefined}
      >
        {error && (
          <div
            id="login-error"
            className="text-red-600 text-sm mb-2"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            aria-required="true"
            aria-label="Email address"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            aria-required="true"
            aria-label="Password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Login with your email and password"
        >
          Login
        </button>
      </form>
    </main>
  );
}