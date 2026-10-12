import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import {
  ArrowLeft,
  Clock,
  User,
  Shield,
  MessageSquare,
  History,
  Lock,
  Send,
  AlertCircle
} from 'lucide-react';

export const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'history'
  const [newComment, setNewComment] = useState('');
  const [internalNote, setInternalNote] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');

  const isStaff = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_AGENT';

  const fetchTicketData = async () => {
    try {
      const [ticketRes, commentsRes, historyRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`),
        api.get(`/tickets/${id}/history`)
      ]);
      setTicket(ticketRes.data);
      setStatusUpdate(ticketRes.data.status);
      setComments(commentsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await api.post(`/tickets/${id}/comments`, {
        message: newComment,
        internalNote: isStaff ? internalNote : false
      });
      setNewComment('');
      setInternalNote(false);
      fetchTicketData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async () => {
    if (statusUpdate === ticket.status) return;

    setUpdatingStatus(true);
    try {
      const endpoint = user?.role === 'ROLE_ADMIN'
        ? `/admin/tickets/${id}/status`
        : `/agent/tickets/${id}/status`;

      await api.patch(endpoint, { status: statusUpdate });
      fetchTicketData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Status transition not permitted');
      setStatusUpdate(ticket.status);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div>Loading ticket...</div>;
  if (error) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
        <AlertCircle size={40} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
        <h3>Access Restricted or Ticket Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Tickets
      </button>

      {/* Main Ticket Card Header */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{ticket.title}</h2>
          </div>

          {/* Status Controls for Agents & Admins */}
          {isStaff && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                className="form-control"
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                {user?.role === 'ROLE_ADMIN' && <option value="CLOSED">Closed</option>}
              </select>
              <button
                className="btn btn-primary"
                onClick={handleStatusChange}
                disabled={updatingStatus || statusUpdate === ticket.status}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          )}
        </div>

        {/* Metadata Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          <div>
            <strong>Customer:</strong> {ticket.customer?.name} ({ticket.customer?.email})
          </div>
          <div>
            <strong>Assigned Agent:</strong> {ticket.assignedAgent ? ticket.assignedAgent.name : 'Unassigned'}
          </div>
          <div>
            <strong>Category:</strong> {ticket.category?.replace('_', ' ')}
          </div>
          <div>
            <strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Description */}
        <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-wrap' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Description
          </div>
          <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{ticket.description}</p>
        </div>
      </div>

      {/* Tabs: Conversation vs Audit History */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('comments')}
          style={{
            padding: '0.75rem 1rem',
            borderBottom: activeTab === 'comments' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'comments' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            background: 'none',
            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <MessageSquare size={16} /> Comments & Conversation ({comments.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.75rem 1rem',
            borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            background: 'none',
            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <History size={16} /> Audit Trail ({history.length})
        </button>
      </div>

      {/* TAB CONTENT: COMMENTS */}
      {activeTab === 'comments' && (
        <div>
          {/* Add Comment Form */}
          {ticket.status !== 'CLOSED' ? (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Add a Response</h4>
              <form onSubmit={handleCommentSubmit}>
                <div className="form-group">
                  <textarea
                    required
                    rows={4}
                    className="form-control"
                    placeholder="Type your response here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {isStaff ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={internalNote}
                        onChange={(e) => setInternalNote(e.target.checked)}
                      />
                      <Lock size={14} color="#b45309" />
                      <span style={{ color: '#b45309', fontWeight: 500 }}>Internal staff note (hidden from customer)</span>
                    </label>
                  ) : <div />}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingComment}
                  >
                    <Send size={14} /> {submittingComment ? 'Sending...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
              <p style={{ color: 'var(--text-secondary)' }}>This ticket is CLOSED. Further comments are disabled.</p>
            </div>
          )}

          {/* Comment Thread */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No comments yet. Start the conversation above!
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="card"
                  style={{
                    backgroundColor: c.internalNote ? '#fffbeb' : '#ffffff',
                    border: c.internalNote ? '1px solid #fef3c7' : '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>{c.author?.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({c.author?.role?.replace('ROLE_', '')})
                      </span>
                      {c.internalNote && (
                        <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.65rem' }}>
                          INTERNAL NOTE
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {c.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: HISTORY AUDIT */}
      {activeTab === 'history' && (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((h) => (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '0.75rem'
                }}
              >
                <div style={{ padding: '0.375rem', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  <Clock size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem' }}>
                    <strong>{h.actor?.name}</strong> performed <strong>{h.actionType}</strong>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {h.previousValue && <span>Previous: <code>{h.previousValue}</code> → </span>}
                    {h.newValue && <span>New: <code>{h.newValue}</code></span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {new Date(h.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
