import Link from "next/link";
import { Home, Lock, ArrowLeft } from "lucide-react";

export default function UnauthorisedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 text-center px-4">
      <div className="max-w-md">
        {/* Lock Icon */}
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-6 rounded-full">
              <Lock className="w-16 h-16 text-orange-600" />
            </div>
          </div>
          <div className="text-6xl font-bold text-orange-600 mb-2">403</div>
          <div className="w-24 h-1 bg-orange-600 mx-auto rounded"></div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          You don't have permission to view this page. This area is restricted to authorized users only.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 border-2 border-orange-600 px-6 py-3 rounded-lg hover:bg-orange-50 transition font-medium"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-8 border-t border-gray-300">
          <p className="text-sm text-gray-600 mb-4">
            If you believe you should have access to this page:
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              • Check you're logged in with the correct account
            </p>
            <p className="text-sm text-gray-500">
              • Contact your administrator for access
            </p>
            <p className="text-sm text-gray-500">
              • Return to your dashboard to see available options
            </p>
          </div>
          <Link 
            href="/contact" 
            className="inline-block mt-4 text-sm text-orange-600 hover:underline font-medium"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
