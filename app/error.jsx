'use client'
import Link from "next/link";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function Error500() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-gray-100 text-center px-4">
      <div className="max-w-md">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-24 h-24 text-red-600" />
          </div>
          <div className="text-8xl font-bold text-red-600 mb-2">500</div>
          <div className="w-24 h-1 bg-red-600 mx-auto rounded"></div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Something Went Wrong
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          We're sorry, but something unexpected happened on our end. Our team has been notified and is working to fix it.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-white text-red-600 border-2 border-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition font-medium"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
        </div>

        {/* Error Details (Optional - can show error code) */}
        <div className="mt-8 pt-8 border-t border-gray-300">
          <p className="text-sm text-gray-500 mb-4">
            If this problem persists, please contact our support team.
          </p>
          <Link 
            href="/contact" 
            className="text-sm text-red-600 hover:underline font-medium"
          >
            Contact Support
          </Link>
        </div>

        {/* Technical Details for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-900 text-left rounded-lg">
            <p className="text-xs text-gray-400 font-mono">
              Error 500: Internal Server Error
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
