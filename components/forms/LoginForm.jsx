// components/LoginForm.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { Eye, EyeClosed } from "lucide-react";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const isTimeout = searchParams.get('timeout') === 'true';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  // Role-based redirection after successful login
  useEffect(() => {
    if (session?.user?.role) {
      const role = session.user.role;

      if (role === "SUPER_ADMIN") {
        router.push("/dashboard/super-admin");
      } else if (role === "ADMIN" || role === "COMPANY_ADMIN") {
        router.push("/dashboard/admin");
      } else if (role === "COORDINATOR") {
        router.push("/dashboard/coordinator");
      } else if (role === "MANAGER") {
        router.push("/dashboard/manager");
      } else if (role === "DRIVER") {
        router.push("/dashboard/driver");
      } else {
        router.push("/dashboard"); // fallback
      }
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
      <h1 className="text-xl font-bold mb-6 text-center" id="login-heading">
        Login
      </h1>
      {isTimeout && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            ⏱️ Your session has expired due to inactivity. Please log in again.
          </p>
        </div>
      )}

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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              aria-required="true"
              aria-label="Password"
              className="w-full border p-2 pr-10 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeClosed className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-right mt-2">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
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