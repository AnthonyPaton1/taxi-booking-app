import Link from "next/link";

export default function UnauthorisedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <div>
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 text-lg mb-6">
          You do not have permission to view this page.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
