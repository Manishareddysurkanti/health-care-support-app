import { useState } from 'react';
import { apiUrl, parseJsonResponse } from '../utils/api';

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

function TrackRequest({ initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(
        apiUrl(`/api/requests/mine?email=${encodeURIComponent(email.trim())}`)
      );
      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load requests');
      }

      setRequests(data);
    } catch (err) {
      setError(err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card track-card">
      <h2>Track My Request</h2>
      <p className="card-subtitle">
        Enter the email you used when submitting a request to view your status and AI response.
      </p>

      <form onSubmit={handleSearch} className="track-search-form">
        <div className="form-row">
          <label htmlFor="trackEmail">Your Email</label>
          <input
            id="trackEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'View My Requests'}
        </button>
      </form>

      {error && <p className="form-error" role="alert">{error}</p>}

      {searched && !loading && !error && requests.length === 0 && (
        <p className="empty-state">No requests found for this email address.</p>
      )}

      {requests.length > 0 && (
        <div className="request-list">
          {requests.map((req) => (
            <article key={req._id} className="request-item">
              <div className="request-item-header">
                <h3>{req.type}</h3>
                <span className={`badge status-badge ${STATUS_COLORS[req.status] || ''}`}>
                  {req.status || 'Pending'}
                </span>
              </div>

              <div className="request-meta">
                <span>Submitted {formatDate(req.createdAt)}</span>
              </div>

              <p className="request-message">{req.message}</p>

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

              {req.staffReply && (
                <div className="staff-reply-box">
                  <span className="reply-label">Staff Follow-up</span>
                  <p>{req.staffReply}</p>
                  {req.repliedAt && (
                    <span className="reply-date">Updated {formatDate(req.repliedAt)}</span>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackRequest;
