import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStaffToken, getStaffInfo, clearStaffSession, staffAuthHeaders } from '../utils/auth';
import { apiUrl, parseJsonResponse } from '../utils/api';

const STATUSES = ['Pending', 'In Progress', 'Resolved'];

const TYPE_COLORS = {
  'Patient Support': 'badge-patient',
  'Volunteer Registration': 'badge-volunteer',
  Contact: 'badge-contact',
};

const STATUS_COLORS = {
  Pending: 'status-pending',
  'In Progress': 'status-progress',
  Resolved: 'status-resolved',
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function StaffDashboard() {
  const navigate = useNavigate();
  const staff = getStaffInfo();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(apiUrl('/api/requests'), {
        headers: { ...staffAuthHeaders() },
      });

      if (res.status === 401) {
        clearStaffSession();
        navigate('/staff/login');
        return;
      }

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load requests');
      }

      setRequests(data);
      const initialDrafts = {};
      data.forEach((req) => {
        initialDrafts[req._id] = {
          status: req.status || 'Pending',
          staffReply: req.staffReply || '',
        };
      });
      setDrafts(initialDrafts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!getStaffToken()) {
      navigate('/staff/login');
      return;
    }
    fetchRequests();
  }, [fetchRequests, navigate]);

  const handleDraftChange = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id) => {
    setSavingId(id);
    setError('');

    try {
      const draft = drafts[id];
      const res = await fetch(apiUrl(`/api/requests/${id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...staffAuthHeaders(),
        },
        body: JSON.stringify({
          status: draft.status,
          staffReply: draft.staffReply,
        }),
      });

      if (res.status === 401) {
        clearStaffSession();
        navigate('/staff/login');
        return;
      }

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update request');
      }

      setRequests((prev) => prev.map((r) => (r._id === id ? data : r)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleLogout = () => {
    clearStaffSession();
    navigate('/staff/login');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon" aria-hidden="true">+</span>
            <span className="logo-text">CareBridge NGO</span>
          </div>
          <div className="header-actions">
            <span className="staff-name">{staff?.name || 'Staff'}</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="hero hero-compact">
          <h1>Staff Dashboard</h1>
          <p>View and manage all user requests.</p>
        </section>

        {loading && (
          <div className="card dashboard-card">
            <p className="loading-text">Loading requests...</p>
          </div>
        )}

        {error && (
          <div className="card dashboard-card">
            <p className="form-error" role="alert">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="card dashboard-card">
            <div className="dashboard-header">
              <h2>All User Requests</h2>
              <span className="request-count">{requests.length} total</span>
            </div>

            {requests.length === 0 ? (
              <p className="empty-state">No requests submitted yet.</p>
            ) : (
              <div className="request-list">
                {requests.map((req) => (
                  <article key={req._id} className="request-item staff-request-item">
                    <div className="request-item-header">
                      <h3>{req.fullName}</h3>
                      <span className={`badge ${TYPE_COLORS[req.type] || ''}`}>
                        {req.type}
                      </span>
                    </div>

                    <div className="request-details-grid">
                      <div><strong>User Name:</strong> {req.fullName}</div>
                      <div><strong>Email:</strong> {req.email}</div>
                      <div><strong>Phone:</strong> {req.phone}</div>
                      <div><strong>Submitted:</strong> {formatDate(req.createdAt)}</div>
                      <div>
                        <strong>Status:</strong>{' '}
                        <span className={`badge status-badge ${STATUS_COLORS[req.status] || ''}`}>
                          {req.status || 'Pending'}
                        </span>
                      </div>
                    </div>

                    <p className="request-message">
                      <strong>User Message:</strong> {req.message}
                    </p>

                    <div className="request-summary">
                      <span className="ai-badge">AI Summary</span>
                      <p>{req.summary}</p>
                    </div>

                    {req.aiResponse && (
                      <div className="ai-response-box">
                        <span className="ai-badge ai-badge-response">AI Response</span>
                        <p>{req.aiResponse}</p>
                      </div>
                    )}

                    <div className="staff-actions">
                      <div className="form-row">
                        <label htmlFor={`status-${req._id}`}>Update Status</label>
                        <select
                          id={`status-${req._id}`}
                          value={drafts[req._id]?.status || 'Pending'}
                          onChange={(e) => handleDraftChange(req._id, 'status', e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-row">
                        <label htmlFor={`reply-${req._id}`}>Staff Follow-up (optional)</label>
                        <textarea
                          id={`reply-${req._id}`}
                          value={drafts[req._id]?.staffReply || ''}
                          placeholder="Add a personal follow-up message for the user..."
                          rows={3}
                          onChange={(e) => handleDraftChange(req._id, 'staffReply', e.target.value)}
                        />
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSave(req._id)}
                        disabled={savingId === req._id}
                      >
                        {savingId === req._id ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="back-link">
          <Link to="/">← Back to public portal</Link>
        </p>
      </main>
    </div>
  );
}

export default StaffDashboard;
