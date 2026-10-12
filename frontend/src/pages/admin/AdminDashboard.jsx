import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ShieldAlert,
  Ticket,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle
} from 'lucide-react';

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#64748b'];

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <div>Loading executive dashboard...</div>;

  // Format data for Recharts
  const statusChartData = stats?.statusDistribution
    ? Object.entries(stats.statusDistribution).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value
      }))
    : [];

  const priorityChartData = stats?.priorityDistribution
    ? Object.entries(stats.priorityDistribution).map(([name, value]) => ({
        name,
        count: value
      }))
    : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Executive Support Operations</h2>
          <p style={{ color: 'var(--text-secondary)' }}>System overview, agent allocation, and ticket health</p>
        </div>
        <Link to="/admin/tickets" className="btn btn-primary">
          <Ticket size={18} /> Manage All Tickets
        </Link>
      </div>

      {/* Top Level Metric KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Tickets</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{stats?.totalTickets || 0}</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Open (Unassigned)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#b45309' }}>
            {stats?.unassignedTickets || 0}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>In Progress</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#2563eb' }}>
            {stats?.inProgressTickets || 0}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Resolved</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#16a34a' }}>
            {stats?.resolvedTickets || 0}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Closed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#64748b' }}>
            {stats?.closedTickets || 0}
          </div>
        </div>
      </div>

      {/* Charts Section using Recharts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Status Distribution Donut */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Ticket Status Distribution</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Tickets by Priority Level</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={priorityChartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Agent Workload Table */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Support Agent Workload Capacity</h3>
        {(!stats?.agentWorkload || stats.agentWorkload.length === 0) ? (
          <p style={{ color: 'var(--text-secondary)' }}>No support agents found in the system.</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Total Active Workload</th>
                  <th>Open Tickets</th>
                  <th>In Progress Tickets</th>
                </tr>
              </thead>
              <tbody>
                {stats.agentWorkload.map((a) => (
                  <tr key={a.agentId}>
                    <td style={{ fontWeight: 600 }}>{a.agentName}</td>
                    <td>{a.assignedCount}</td>
                    <td>{a.openCount}</td>
                    <td>{a.inProgressCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent System Activity */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Recent System-wide Activity</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Customer</th>
                <th>Title</th>
                <th>Assigned Agent</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last Update</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentActivity?.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.ticketNumber}</td>
                  <td>{t.customer?.name}</td>
                  <td>{t.title}</td>
                  <td>{t.assignedAgent ? t.assignedAgent.name : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>{new Date(t.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/tickets/${t.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
