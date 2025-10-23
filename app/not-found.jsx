import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";



export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 text-center px-4">
      <div className="max-w-md">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-600 mb-2">404</div>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded"></div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
          
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-8 border-t border-gray-300">
          <p className="text-sm text-gray-500 mb-4">Need help?</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
            <Link href="/how-it-works" className="text-blue-600 hover:underline">
              How It Works
            </Link>
            <Link href="/faq" className="text-blue-600 hover:underline">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
