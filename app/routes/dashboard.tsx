const DashboardPage = () => {
  return (
    <div className="max-w-[90%] mx-auto w-full px-4 py-10">
      <p className="text-2xl font-medium">Dashboard</p>
      <div className="mt-10">
        <input
          className="w-full px-5 py-1"
          placeholder="Search your sites"
          type="text"
        />
      </div>
    </div>
  );
};
export default DashboardPage;
