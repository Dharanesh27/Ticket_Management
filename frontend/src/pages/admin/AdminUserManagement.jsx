import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { UserCheck, UserX, UserPlus, Shield, Headphones, User, AlertCircle } from 'lucide-react';

export const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id}/active`, { active: !user.active });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/admin/users/agents', { name, email, password });
      setShowAddAgent(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create agent');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>User & Staff Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage accounts, onboard support agents, and control user access</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddAgent(true)}>
          <UserPlus size={18} /> Provision Support Agent
        </button>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading user directory...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>System Role</th>
                  <th>Status</th>
                  <th>Member Since</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: u.role === 'ROLE_ADMIN' ? '#fee2e2' : u.role === 'ROLE_AGENT' ? '#eff6ff' : '#f1f5f9',
                        color: u.role === 'ROLE_ADMIN' ? '#991b1b' : u.role === 'ROLE_AGENT' ? '#1d4ed8' : '#475569'
                      }}>
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        color: u.active ? '#16a34a' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>
                        {u.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          className={`btn ${u.active ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.active ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agent Provisioning Modal */}
      {showAddAgent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Provision Support Agent</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Create internal credentials for a new support team member.
            </p>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#991b1b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateAgent}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Bob Agent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="bob.agent@supportdesk.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-control"
                  placeholder="Temporary password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddAgent(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Provision Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
