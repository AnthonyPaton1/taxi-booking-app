const ManagerDashboard = ({ manager }) => {
  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-blue-700 mb-4">
        Welcome, {manager?.name || "Manager"}!
      </h2>
      <p className="text-gray-600">This is your Manager dashboard.</p>
      {/* Add more UI blocks here as you build out features */}
    </div>
  );
};

export default ManagerDashboard;