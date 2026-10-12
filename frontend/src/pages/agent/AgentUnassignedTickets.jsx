import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { PriorityBadge } from '../../components/common/Badges';
import { Pagination } from '../../components/common/Pagination';
import { Inbox, Check } from 'lucide-react';

export const AgentUnassignedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/agent/tickets/unassigned', {
        params: { page, size: 10, sortBy: 'createdAt', direction: 'ASC' }
      });
      setTickets(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to load unassigned tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page]);

  const handleClaim = async (ticketId) => {
    setClaimingId(ticketId);
    setMessage('');
    try {
      await api.post(`/agent/tickets/${ticketId}/claim`);
      setMessage('Ticket successfully claimed and moved to your queue!');
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to claim ticket');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Unassigned Ticket Queue</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Open tickets awaiting agent assignment</p>
      </div>

      {message && (
        <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', color: '#065f46', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          {message}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading unassigned queue...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Inbox size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>Great job! The unassigned queue is currently clear.</p>
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
                    <th>Submitted</th>
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
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-primary"
                          disabled={claimingId === t.id}
                          onClick={() => handleClaim(t.id)}
                          style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                        >
                          <Check size={14} /> {claimingId === t.id ? 'Claiming...' : 'Claim'}
                        </button>
                        <Link
                          to={`/tickets/${t.id}`}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                        >
                          Preview
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
