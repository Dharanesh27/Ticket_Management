import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { PlusCircle, ArrowLeft, AlertCircle } from 'lucide-react';

export const CreateTicket = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('TECHNICAL_ISSUE');
  const [priority, setPriority] = useState('MEDIUM');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/tickets', {
        title,
        description,
        category,
        priority
      });
      navigate(`/tickets/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create ticket. Please verify all inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create Support Ticket</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Provide as much detail as possible to help our team resolve your issue quickly.
        </p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#991b1b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject / Title</label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={150}
              className="form-control"
              placeholder="Brief summary of the issue (e.g. Cannot access payment history)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="TECHNICAL_ISSUE">Technical Issue</option>
                <option value="BILLING">Billing & Invoice</option>
                <option value="ACCOUNT_ACCESS">Account Access</option>
                <option value="FEATURE_REQUEST">Feature Request</option>
                <option value="GENERAL_QUERY">General Query</option>
              </select>
            </div>

            <div>
              <label className="form-label">Severity / Priority</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">Low - General inquiry</option>
                <option value="MEDIUM">Medium - Normal operational issue</option>
                <option value="HIGH">High - Significant business impact</option>
                <option value="CRITICAL">Critical - System down / blocked</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              required
              rows={6}
              minLength={10}
              maxLength={5000}
              className="form-control"
              placeholder="Please describe what happened, steps to reproduce, and any relevant error messages..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <PlusCircle size={16} /> {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
