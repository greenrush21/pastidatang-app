import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/dashboards?role=${user.role}&division=${user.division}`);
      const json = await res.json();
      setData(json);
    };
    fetchData();
  }, [user]);

  return (
    <div>
      <h1>{user.division} Dashboard</h1>
      {user.role === 'admin' || user.role === 'alpha' ? (
        <AdminControls />
      ) : (
        <DivisionView data={data} />
      )}
    </div>
  );
};

const AdminControls = () => {
  const manageUsers = () => {
    // Logic to manage users
    console.log('Managing users');
  };

  const configureSystem = () => {
    // Logic to configure system
    console.log('Configuring system');
  };

  const viewAllDashboards = () => {
    // Logic to view all dashboards
    console.log('Viewing all dashboards');
  };

  return (
    <div className="admin-panel">
      <button onClick={() => manageUsers()}>Manage Users</button>
      <button onClick={() => configureSystem()}>System Settings</button>
      <button onClick={() => viewAllDashboards()}>All Division Views</button>
    </div>
  );
};

const DivisionView = ({ data }) => (
  <div className="division-view">
    <h2>Division Data</h2>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>
);

export default Dashboard;