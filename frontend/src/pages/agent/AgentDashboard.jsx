import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { Inbox, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const AgentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/agent/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load agent dashboard:', err);
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Agent Workstation</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your assigned tickets and pick up queue requests</p>
        </div>
        <Link to="/agent/unassigned" className="btn btn-primary">
          <Inbox size={18} /> View Unassigned Queue ({stats?.unassignedClaimableTickets || 0})
        </Link>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Assigned to Me</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.assignedTickets || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef3c7', color: '#b45309' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>In Progress</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.inProgressAssignedTickets || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#dcfce7', color: '#15803d' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Resolved by Me</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.resolvedAssignedTickets || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
            <Inbox size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Unassigned Pool</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.unassignedClaimableTickets || 0}</div>
          </div>
        </div>
      </div>

      {/* Assigned Tickets */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Active Assigned Tickets</h3>
          <Link to="/agent/tickets" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            View all assigned <ArrowRight size={14} />
          </Link>
        </div>

        {(!stats?.recentTickets || stats.recentTickets.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <p>You have no pending assigned tickets.</p>
            <Link to="/agent/unassigned" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              Claim a ticket from the queue
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Customer</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last Update</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTickets.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.ticketNumber}</td>
                    <td>{t.customer?.name}</td>
                    <td>{t.title}</td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{new Date(t.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/tickets/${t.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                        Manage
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
