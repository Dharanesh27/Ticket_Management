import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { Pagination } from '../../components/common/Pagination';
import { Search, UserCheck } from 'lucide-react';

export const AdminAllTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [agentId, setAgentId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [assignModalTicket, setAssignModalTicket] = useState(null);
  const [selectedAgentForAssign, setSelectedAgentForAssign] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        sortBy: 'createdAt',
        direction: 'DESC'
      };
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;
      if (agentId) params.agentId = agentId;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/admin/tickets', { params });
      setTickets(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/admin/users/agents');
      setAgents(res.data);
    } catch (err) {
      console.error('Failed to load agents list:', err);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [page, status, priority, category, agentId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTickets();
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgentForAssign || !assignModalTicket) return;

    setActionLoading(true);
    try {
      await api.patch(`/admin/tickets/${assignModalTicket.id}/assign`, {
        agentId: Number(selectedAgentForAssign)
      });
      setAssignModalTicket(null);
      setSelectedAgentForAssign('');
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Support Operations & Assignment</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Assign tickets, manage triage, and oversee all customer inquiries</p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 200px' }}>
            <input
              type="text"
              placeholder="Search ticket # or title..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ flex: '0 1 150px' }}>
            <select className="form-control" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div style={{ flex: '0 1 150px' }}>
            <select className="form-control" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(0); }}>
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div style={{ flex: '0 1 170px' }}>
            <select className="form-control" value={agentId} onChange={(e) => { setAgentId(e.target.value); setPage(0); }}>
              <option value="">All Agents</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Search size={16} /> Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No tickets found.
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Customer</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned Agent</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.ticketNumber}</td>
                      <td>{t.customer?.name}</td>
                      <td>{t.title}</td>
                      <td>{t.category.replace('_', ' ')}</td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        {t.assignedAgent ? (
                          <span style={{ fontWeight: 500 }}>{t.assignedAgent.name}</span>
                        ) : (
                          <span style={{ color: 'var(--prio-crit-text)', fontWeight: 600, fontSize: '0.75rem' }}>UNASSIGNED</span>
                        )}
                      </td>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => { setAssignModalTicket(t); setSelectedAgentForAssign(t.assignedAgent?.id || ''); }}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <UserCheck size={14} /> Assign
                        </button>
                        <Link
                          to={`/tickets/${t.id}`}
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </>
        )}
      </div>

      {/* Assignment Modal */}
      {assignModalTicket && (
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
          <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Assign Ticket</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Assign <strong>{assignModalTicket.ticketNumber}</strong> to an active agent.
            </p>

            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">Select Agent</label>
                <select
                  required
                  className="form-control"
                  value={selectedAgentForAssign}
                  onChange={(e) => setSelectedAgentForAssign(e.target.value)}
                >
                  <option value="">-- Choose Support Agent --</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAssignModalTicket(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
