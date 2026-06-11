import { useState } from 'react';
import { apiUrl, parseJsonResponse } from '../utils/api';

const REQUEST_TYPES = [
  'Patient Support',
  'Volunteer Registration',
  'Contact',
];

function SupportForm({ onSuccess }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    type: 'Patient Support',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLastResult(null);

    try {
      const res = await fetch(apiUrl('/api/requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setLastResult({ summary: data.summary, aiResponse: data.aiResponse });
      const submittedEmail = form.email;
      setForm({
        fullName: '',
        email: '',
        phone: '',
        type: 'Patient Support',
        message: '',
      });
      onSuccess?.(submittedEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card support-form-card">
      <h2>Submit a Support Request</h2>
      <p className="card-subtitle">
        Fill out the form below and our team will respond as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="support-form">
        <div className="form-row">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            {REQUEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Describe your request..."
            rows={4}
            required
          />
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {lastResult && (
        <div className="submission-result" role="status">
          <div className="ai-summary">
            <span className="ai-badge">AI Summary</span>
            <p>{lastResult.summary}</p>
          </div>
          <div className="ai-response-box">
            <span className="ai-badge ai-badge-response">AI Response</span>
            <p>{lastResult.aiResponse}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportForm;
