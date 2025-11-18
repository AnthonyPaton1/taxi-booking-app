//app/components/auth/PasswordStrengthInput.jsx
"use client";

import { useState, useEffect } from "react";

/**
 * Password validation function
 */
export function validateStrongPassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Must include an uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Must include a lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Must include a number");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Must include a special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Password Strength Indicator Component
 * 
 * Props:
 * - password: Current password value
 * - onPasswordChange: Callback when password changes
 * - confirmPassword: Confirm password value (optional)
 * - onConfirmPasswordChange: Callback when confirm password changes (optional)
 * - disabled: Whether inputs are disabled
 * - showConfirm: Whether to show confirm password field
 * - idPrefix: Prefix for input IDs (default: "password")
 */
export default function PasswordStrengthInput({
  password,
  onPasswordChange,
  confirmPassword = "",
  onConfirmPasswordChange = () => {},
  disabled = false,
  showConfirm = false,
  idPrefix = "password",
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    setStrength(score);
  }, [password]);

  const validation = validateStrongPassword(password);

  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-200";
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strength === 0) return "";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  const getStrengthTextColor = () => {
    if (strength === 0) return "text-gray-500";
    if (strength <= 2) return "text-red-600";
    if (strength <= 3) return "text-yellow-600";
    if (strength <= 4) return "text-blue-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-4">
      {/* Password Field */}
      <div>
        <label
          htmlFor={`${idPrefix}-input`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <input
            id={`${idPrefix}-input`}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="appearance-none rounded border border-gray-300 w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Strength Indicator */}
        {password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded ${
                    level <= strength ? getStrengthColor() : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${getStrengthTextColor()}`}>
              {getStrengthText()}
            </p>
          </div>
        )}

        {/* Validation Messages */}
        {password && !validation.isValid && (
          <div className="mt-2 space-y-1">
            {validation.errors.map((error, idx) => (
              <p key={idx} className="text-xs text-red-600">
                • {error}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      {showConfirm && (
        <div>
          <label
            htmlFor={`${idPrefix}-confirm`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id={`${idPrefix}-confirm`}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              className={`appearance-none rounded border w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:border-transparent ${
                confirmPassword && password === confirmPassword
                  ? "border-green-300 focus:ring-green-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              required
              disabled={disabled}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Match Indicator */}
          {confirmPassword && (
            <p
              className={`text-xs mt-1 ${
                password === confirmPassword
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}