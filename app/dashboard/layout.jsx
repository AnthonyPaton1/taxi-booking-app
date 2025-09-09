export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Example: Left sidebar */}

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
