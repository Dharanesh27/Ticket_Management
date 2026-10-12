import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { Pagination } from '../../components/common/Pagination';
import { Search } from 'lucide-react';

export const AgentAssignedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        sortBy: 'updatedAt',
        direction: 'DESC'
      };
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/agent/tickets', { params });
      setTickets(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to load assigned tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, status, priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTickets();
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>My Assigned Tickets</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Tickets actively assigned to your support workload</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px' }}>
            <input
              type="text"
              placeholder="Search by ticket # or title..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select className="form-control" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select className="form-control" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(0); }}>
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading assigned tickets...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No assigned tickets match the selected filters.
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
                    <th>Updated</th>
                    <th>Action</th>
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
                      <td>{new Date(t.updatedAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/tickets/${t.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                          Manage
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
    </div>
  );
};
