// app/house/login/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HouseLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    loginName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/house/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Success - redirect to house dashboard
      router.push("/house/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            NEAT Transport
          </h1>
          <p className="text-gray-600">House Staff Access</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Name */}
            <div>
              <label
                htmlFor="loginName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Login Name
              </label>
              <Input
                id="loginName"
                name="loginName"
                type="text"
                placeholder="e.g., oakvilla-2024"
                value={formData.loginName}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="username"
                className="text-lg"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter house password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="text-lg"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Need help logging in?</p>
            <p className="mt-1">Contact your house manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}