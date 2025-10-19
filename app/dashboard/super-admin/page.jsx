import CheckoutSteps from "@/components/shared/header/SuperAdminCheckoutSteps";

const SuperAdminMainPage = async () => {
  // Simulated data — replace with actual fetch later
  const stats = {
    drivers: 50,
    businesses: 20,
    publicUsers: 110,
    revenue: "£12,340", // can use Intl.NumberFormat later
  };

  return (
    <div className="space-y-6">
      <CheckoutSteps current={0} />

      <h2 className="text-2xl font-semibold text-blue-800">Welcome Tony you genius</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatBox label="Total Drivers" value={stats.drivers} />
        <StatBox label="Total Businesses" value={stats.businesses} />
        <StatBox label="Public Users" value={stats.publicUsers} />
        <StatBox label="Total Revenue" value={stats.revenue} />
      </div>
    </div>
  );
};

const StatBox = ({ label, value }) => (
  <div className="bg-blue-50 p-5 rounded-lg shadow hover:shadow-md transition">
    <p className="text-gray-600 text-sm">{label}</p>
    <p className="text-2xl font-bold text-blue-800 mt-1">{value}</p>
  </div>
);

export default SuperAdminMainPage;