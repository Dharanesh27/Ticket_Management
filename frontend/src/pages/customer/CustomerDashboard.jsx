import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { PlusCircle, Ticket, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const CustomerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/tickets/my/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load customer dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Customer Portal</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage your customer support requests</p>
        </div>
        <Link to="/customer/create-ticket" className="btn btn-primary">
          <PlusCircle size={18} /> Create New Ticket
        </Link>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Ticket size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Submitted</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.totalTickets || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#dbeafe', color: '#1e40af' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Open Tickets</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.openTickets || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef3c7', color: '#b45309' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>In Progress</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.inProgressTickets || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#dcfce7', color: '#15803d' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Resolved</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.resolvedTickets || 0}</div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Support Tickets</h3>
          <Link to="/customer/tickets" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>
            View all
          </Link>
        </div>

        {(!stats?.recentTickets || stats.recentTickets.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <p>You haven't submitted any support tickets yet.</p>
            <Link to="/customer/create-ticket" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              Submit your first request
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTickets.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.ticketNumber}</td>
                    <td>{t.title}</td>
                    <td>{t.category.replace('_', ' ')}</td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/tickets/${t.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
