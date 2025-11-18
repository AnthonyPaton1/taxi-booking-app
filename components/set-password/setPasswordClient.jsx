"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import PasswordStrengthInput from "@/components/auth/PasswordStrengthInput";
import { validateStrongPassword } from "@/components/auth/PasswordStrengthInput";

export default function SetPasswordClient() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Validate token exists
  if (!token) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Invalid or missing token. Please check your email link.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validate password strength
    const validation = validateStrongPassword(password);
    if (!validation.isValid) {
      setError(validation.errors.join(". "));
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      // Handle non-JSON responses
      const contentType = res.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("❌ Non-JSON response:", text);
        throw new Error("Invalid server response");
      }

      if (res.ok) {
        setMessage("Password set successfully! Redirecting...");
        
        // Sign in with credentials
        const signInResult = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password,
        });

        if (signInResult?.error) {
          setError("Password set but auto-login failed. Please login manually.");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          // Redirect based on role
          const dashboardUrl =
            data.role === "DRIVER"
              ? "/dashboard/driver"
              : data.role === "MANAGER"
              ? "/dashboard/manager"
              : data.role === "COORDINATOR"
              ? "/dashboard/coordinator"
              : "/dashboard/admin";
          
          router.push(dashboardUrl);
        }
      } else {
        // Handle specific error cases
        if (res.status === 400) {
          setError(data.error || "Invalid or expired token.");
        } else if (res.status === 404) {
          setError("User not found. Please contact support.");
        } else {
          setError(data.error || "Failed to set password. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error setting password:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Set Your Password
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a secure password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}

          {/* Password Strength Component with unique ID */}
          <PasswordStrengthInput
            password={password}
            onPasswordChange={setPassword}
            confirmPassword={confirmPassword}
            onConfirmPasswordChange={setConfirmPassword}
            disabled={loading}
            showConfirm={true}
            idPrefix="set-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting Password...
              </span>
            ) : (
              "Set Password & Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}