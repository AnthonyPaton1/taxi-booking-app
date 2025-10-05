const CoordinatorDashboard = ({ coordinator }) => {
  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-blue-700 mb-4">
        Welcome, {coordinator?.name || "Coordinator"}!
      </h2>
      <p className="text-gray-600">This is your coordinator dashboard.</p>
      {/* Add more UI blocks here as you build out features */}
    </div>
  );
};

export default CoordinatorDashboard;