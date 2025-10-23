"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie, Settings } from "lucide-react";

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, can't be disabled
    functional: false,
    analytics: false,
    security: true, // Recommended, but can be disabled
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
        applyCookiePreferences(saved);
      } catch (e) {
        console.error("Error loading cookie preferences:", e);
      }
    }
  }, []);

  const applyCookiePreferences = (prefs) => {
    // Apply Google Analytics based on consent
    if (prefs.analytics) {
      // Initialize Google Analytics
      window.gtag?.("consent", "update", {
        analytics_storage: "granted",
      });
    } else {
      // Deny Google Analytics
      window.gtag?.("consent", "update", {
        analytics_storage: "denied",
      });
    }

    // You can add other cookie-dependent services here
  };

  const savePreferences = (prefs) => {
    localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    applyCookiePreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      security: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const acceptEssential = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
      security: true, // Keep security on by default
    };
    setPreferences(essentialOnly);
    savePreferences(essentialOnly);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  const handleToggle = (category) => {
    if (category === "essential") return; // Can't disable essential
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => !showSettings && setShowBanner(false)}
        aria-hidden="true"
      />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl border border-gray-200">
          {!showSettings ? (
            /* Simple Banner View */
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Cookie className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    We Use Cookies
                  </h2>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    We use cookies to enhance your experience, keep you signed in, remember your preferences, and analyze how you use our platform. Essential cookies are required for the site to function. You can customize your preferences or accept all cookies.
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    By clicking "Accept All", you consent to our use of cookies. Read our{" "}
                    <Link href="/cookies" className="text-blue-600 hover:underline font-medium">
                      Cookie Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
                      Privacy Policy
                    </Link>{" "}
                    for more information.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={acceptAll}
                      className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={acceptEssential}
                      className="flex-1 sm:flex-none bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      Essential Only
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex items-center justify-center gap-2 flex-1 sm:flex-none border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      Customize
                    </button>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowBanner(false)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
                  aria-label="Close cookie banner"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            /* Detailed Settings View */
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Cookie Preferences
                  </h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                  aria-label="Close settings"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Choose which cookies you want to accept. Essential cookies cannot be disabled as they are required for the platform to function.
              </p>

              {/* Cookie Categories */}
              <div className="space-y-4 mb-6">
                {/* Essential */}
                <div className="flex items-start justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">Essential Cookies</h3>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Required</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Required for authentication, security, and basic functionality. Cannot be disabled.
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Functional */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Functional Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Remember your preferences, settings, and accessibility options for a better experience.
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleToggle("functional")}
                      className={`w-12 h-6 rounded-full transition-colors flex items-center ${
                        preferences.functional
                          ? "bg-green-600 justify-end"
                          : "bg-gray-300 justify-start"
                      }`}
                      aria-label={`${preferences.functional ? "Disable" : "Enable"} functional cookies`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                    </button>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Analytics Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Help us understand how you use the platform so we can improve it. All data is anonymized.
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleToggle("analytics")}
                      className={`w-12 h-6 rounded-full transition-colors flex items-center ${
                        preferences.analytics
                          ? "bg-green-600 justify-end"
                          : "bg-gray-300 justify-start"
                      }`}
                      aria-label={`${preferences.analytics ? "Disable" : "Enable"} analytics cookies`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                    </button>
                  </div>
                </div>

                {/* Security */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">Security Cookies</h3>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Recommended</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Protect against security threats, fraud, and bot attacks (Cloudflare).
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleToggle("security")}
                      className={`w-12 h-6 rounded-full transition-colors flex items-center ${
                        preferences.security
                          ? "bg-green-600 justify-end"
                          : "bg-gray-300 justify-start"
                      }`}
                      aria-label={`${preferences.security ? "Disable" : "Enable"} security cookies`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={saveCustomPreferences}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Save Preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Accept All
                </button>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href="/cookies"
                  className="text-sm text-blue-600 hover:underline"
                  target="_blank"
                >
                  View Full Cookie Policy
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}