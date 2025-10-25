//app/components/auth/PasswordStrengthInput.jsx
"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

/**
 * Password Strength Indicator Component
 * Enforces strong password requirements with visual feedback
 */
export default function PasswordStrengthInput({
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  disabled = false,
  showConfirm = true,
}) {
  const [strength, setStrength] = useState({
    score: 0,
    label: "Too weak",
    color: "text-red-600",
    barColor: "bg-red-500",
  });

  const requirements = [
    {
      label: "At least 8 characters",
      test: (pwd) => pwd.length >= 8,
      met: password.length >= 8,
    },
    {
      label: "One uppercase letter (A-Z)",
      test: (pwd) => /[A-Z]/.test(pwd),
      met: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter (a-z)",
      test: (pwd) => /[a-z]/.test(pwd),
      met: /[a-z]/.test(password),
    },
    {
      label: "One number (0-9)",
      test: (pwd) => /[0-9]/.test(pwd),
      met: /[0-9]/.test(password),
    },
    {
      label: "One special character (!@#$%^&*)",
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  useEffect(() => {
    if (!password) {
      setStrength({
        score: 0,
        label: "Too weak",
        color: "text-red-600",
        barColor: "bg-red-500",
      });
      return;
    }

    const metCount = requirements.filter((req) => req.test(password)).length;
    const scorePercent = (metCount / requirements.length) * 100;

    if (metCount === requirements.length) {
      setStrength({
        score: scorePercent,
        label: "Strong",
        color: "text-green-600",
        barColor: "bg-green-500",
      });
    } else if (metCount >= 3) {
      setStrength({
        score: scorePercent,
        label: "Medium",
        color: "text-yellow-600",
        barColor: "bg-yellow-500",
      });
    } else {
      setStrength({
        score: scorePercent,
        label: "Weak",
        color: "text-red-600",
        barColor: "bg-red-500",
      });
    }
  }, [password]);

  const allRequirementsMet = requirements.every((req) => req.met);
  const passwordsMatch = confirmPassword === password && confirmPassword !== "";

  return (
    <div className="space-y-4">
      {/* Password Input */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter a strong password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={`appearance-none rounded border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:border-transparent ${
            password && !allRequirementsMet
              ? "border-red-300 focus:ring-red-500"
              : password && allRequirementsMet
              ? "border-green-300 focus:ring-green-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          required
          disabled={disabled}
        />
      </div>

      {/* Strength Meter - Only show when typing */}
      {password && (
        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${strength.barColor} transition-all duration-300`}
              style={{ width: `${strength.score}%` }}
            />
          </div>

          {/* Strength Label */}
          <p className={`text-sm font-medium ${strength.color}`}>
            Password strength: {strength.label}
          </p>

          {/* Requirements Checklist */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Password must contain:
            </p>
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {req.met ? (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <span
                  className={req.met ? "text-green-700" : "text-gray-600"}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Password */}
      {showConfirm && (
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className={`appearance-none rounded border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:border-transparent ${
              confirmPassword && !passwordsMatch
                ? "border-red-300 focus:ring-red-500"
                : confirmPassword && passwordsMatch
                ? "border-green-300 focus:ring-green-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            required
            disabled={disabled}
          />
          {confirmPassword && !passwordsMatch && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <X className="w-4 h-4" />
              Passwords do not match
            </p>
          )}
          {confirmPassword && passwordsMatch && (
            <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Passwords match
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Validation helper function for form submission
 * Use this in your form's onSubmit handler
 */
export function validateStrongPassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}