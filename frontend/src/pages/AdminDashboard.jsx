import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [resetRequests, setResetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const normalizeUser = (user) => ({
    ...user,
    isBanned: Boolean(user.isBanned ?? user.banned),
    isVerified: Boolean(user.isVerified ?? user.verified),
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store', credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.map(normalizeUser));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports', { cache: 'no-store', credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchResetRequests = async () => {
    try {
      const response = await fetch('/api/admin/password-reset-requests', { cache: 'no-store', credentials: 'include' });
      if (response.ok) setResetRequests(await response.json());
    } catch (error) {
      console.error('Error fetching password reset requests:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchReports(), fetchResetRequests()]);
    setLoading(false);
  };

  const handleResetRequest = async (requestId, status) => {
    try {
      const response = await fetch(`/api/admin/password-reset-requests/${requestId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) await fetchResetRequests();
    } catch (error) {
      console.error('Error resolving password reset request:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBanToggle = async (userId, isCurrentlyBanned) => {
    const action = isCurrentlyBanned ? 'unban' : 'ban';
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (response.ok) {
        const updatedUser = normalizeUser(await response.json());
        setUsers(currentUsers => currentUsers.map(user =>
          user.id === userId ? updatedUser : user
        ));
        await fetchUsers();
      }
    } catch (error) {
      console.error(`Error trying to ${action} user:`, error);
    }
  };

  const handleVerificationToggle = async (userId, isCurrentlyVerified) => {
    const action = isCurrentlyVerified ? 'unverify' : 'verify';
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (response.ok) {
        const updatedUser = normalizeUser(await response.json());
        setUsers(currentUsers => currentUsers.map(user =>
          user.id === userId ? updatedUser : user
        ));
      }
    } catch (error) {
      console.error(`Error trying to ${action} user:`, error);
    }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  const summaryCards = [
    { label: 'Total users', value: users.length },
    { label: 'Pending reports', value: reports.filter(r => r.status === 'PENDING').length },
    { label: 'Banned users', value: users.filter(u => u.isBanned).length },
    { label: 'Pending verification', value: users.filter(u => !u.isVerified && u.role !== 'ADMIN').length },
    { label: 'Password requests', value: resetRequests.filter(r => r.status === 'PENDING').length },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Dashboard</h1>
        </div>
        <p>Monitor users and keep the marketplace safe.</p>
      </div>

      <div className="admin-summary">
        {summaryCards.map((card) => (
          <div className="summary-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'verification' ? 'active' : ''}`}
          onClick={() => setActiveTab('verification')}
        >
          Verify Students ({users.filter(user => !user.isVerified && user.role !== 'ADMIN').length} Pending)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports ({reports.filter(r => r.status === 'PENDING').length} Pending)
        </button>
        <button
          className={`tab-btn ${activeTab === 'password-resets' ? 'active' : ''}`}
          onClick={() => setActiveTab('password-resets')}
        >
          Password Resets ({resetRequests.filter(r => r.status === 'PENDING').length} Pending)
        </button>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : activeTab === 'users' || activeTab === 'verification' ? (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verification</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(user => activeTab !== 'verification' || (!user.isVerified && user.role !== 'ADMIN'))
                  .map(user => (
                  <tr key={user.id} className={user.isBanned ? 'row-banned' : ''}>
                    <td>#{user.id}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.universityEmail}</td>
                    <td><span className={`badge role-${user.role.toLowerCase()}`}>{user.role}</span></td>
                    <td>
                      {user.isVerified ? (
                        <span className="badge status-verified">Verified</span>
                      ) : (
                        <span className="badge status-pending">Pending</span>
                      )}
                    </td>
                    <td>
                      {user.isBanned ? (
                        <span className="badge status-banned">Banned</span>
                      ) : (
                        <span className="badge status-active">Active</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn btn-msg"
                          onClick={() => navigate(`/messages?seller=${encodeURIComponent(user.universityEmail)}`)}
                        >
                          Message
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button
                            className={`action-btn ${user.isVerified ? 'btn-unverify' : 'btn-verify'}`}
                            onClick={() => handleVerificationToggle(user.id, user.isVerified)}
                          >
                            {user.isVerified ? 'Revoke verification' : 'Verify student'}
                          </button>
                        )}
                        {user.isBanned ? (
                          <button
                            className="action-btn btn-unban"
                            onClick={() => handleBanToggle(user.id, true)}
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            className="action-btn btn-ban"
                            onClick={() => handleBanToggle(user.id, false)}
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'reports' ? (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Item / Seller</th>
                  <th>Reporter</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className={report.status === 'RESOLVED' ? 'row-resolved' : ''}>
                    <td>#{report.id}</td>
                    <td>
                      <strong>{report.item.title}</strong><br/>
                      <small>by {report.item.seller.firstName}</small>
                    </td>
                    <td>{report.reporter.firstName}</td>
                    <td className="reason-cell">{report.reason}</td>
                    <td>
                      <span className={`badge status-${report.status.toLowerCase()}`}>{report.status}</span>
                    </td>
                    <td>
                      {report.status === 'PENDING' ? (
                        <div className="action-buttons">
                          <button 
                            className="action-btn btn-ignore"
                            onClick={() => handleResolveReport(report.id, 'IGNORE')}
                          >
                            Ignore
                          </button>
                          <button 
                            className="action-btn btn-remove"
                            onClick={() => handleResolveReport(report.id, 'REMOVE_ITEM')}
                          >
                            Remove Item
                          </button>
                          <button 
                            className="action-btn btn-ban-user"
                            onClick={() => handleResolveReport(report.id, 'BAN_USER')}
                          >
                            Ban Seller & Remove
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No reports found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>User</th>
                  <th>University Email</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resetRequests.map(request => (
                  <tr key={request.id}>
                    <td>#{request.id}</td>
                    <td>{request.user.firstName} {request.user.lastName}</td>
                    <td>{request.user.universityEmail}</td>
                    <td>{new Date(request.createdAt).toLocaleString()}</td>
                    <td><span className={`badge status-${request.status.toLowerCase()}`}>{request.status}</span></td>
                    <td>
                      {request.status === 'PENDING' ? (
                        <div className="action-buttons">
                          <button className="action-btn btn-unban" onClick={() => handleResetRequest(request.id, 'APPROVED')}>
                            Approve
                          </button>
                          <button className="action-btn btn-ban" onClick={() => handleResetRequest(request.id, 'REJECTED')}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
                {resetRequests.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No password reset requests found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
