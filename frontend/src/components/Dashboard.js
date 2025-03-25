import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, userProfile, signOut } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !userProfile) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/dashboards?role=${userProfile.role}&division=${userProfile.division}`, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error(`Error fetching dashboard data: ${res.status}`);
        }
        
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, userProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (!userProfile) {
    return (
      <div className="loading-container">
        <p>Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{userProfile.division || 'Welcome'} Dashboard</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={handleSignOut} className="btn-logout">Logout</button>
        </div>
      </header>
      
      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading">Loading dashboard data...</div>
        ) : error ? (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <>
            {userProfile.role === 'admin' || userProfile.role === 'alpha' ? (
              <AdminDashboard userProfile={userProfile} data={data} />
            ) : (
              <DivisionDashboard userProfile={userProfile} data={data} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = ({ userProfile, data }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="admin-dashboard">
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-panel">
            <h2>Admin Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Divisions</h3>
                <p className="stat-value">{data.length || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Active Dashboards</h3>
                <p className="stat-value">
                  {data.filter(d => d.status === 'active').length || 0}
                </p>
              </div>
              <div className="stat-card">
                <h3>Recent Updates</h3>
                <p className="stat-value">
                  {data.filter(d => {
                    const updatedAt = new Date(d.updated_at);
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return updatedAt > oneWeekAgo;
                  }).length || 0}
                </p>
              </div>
            </div>
            
            <div className="dashboard-list">
              <h3>All Dashboards</h3>
              <table>
                <thead>
                  <tr>
                    <th>Division</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((dashboard) => (
                      <tr key={dashboard.id}>
                        <td>{dashboard.division}</td>
                        <td>{dashboard.title}</td>
                        <td>
                          <span className={`status-badge ${dashboard.status}`}>
                            {dashboard.status}
                          </span>
                        </td>
                        <td>{new Date(dashboard.updated_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No dashboards found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="users-panel">
            <h2>User Management</h2>
            <p>User management interface to be implemented</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="settings-panel">
            <h2>System Settings</h2>
            <p>System settings interface to be implemented</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DivisionDashboard = ({ userProfile, data }) => {
  const divisionData = data.find(d => d.division === userProfile.division) || { data: {} };
  
  return (
    <div className="division-dashboard">
      <h2>{userProfile.division} Data</h2>
      
      {Object.keys(divisionData.data).length > 0 ? (
        <div className="division-data">
          <pre>{JSON.stringify(divisionData.data, null, 2)}</pre>
        </div>
      ) : (
        <div className="empty-state">
          <p>No data available for this division</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;