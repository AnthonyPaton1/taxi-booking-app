export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Example: Left sidebar */}
      <aside className="w-64 bg-gray-100 p-4 hidden md:block">
        {/* Add your sidebar or nav links here */}
        <nav>
          <ul className="space-y-2">
            <li>
              <a href="/dashboard/manager">Dashboard</a>
            </li>
            <li>
              <a href="/dashboard/manager/create-booking">Create Booking</a>
            </li>
            <li>
              <a href="/dashboard/manager/view-bids">View Bids</a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
