import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setStaffSession } from '../utils/auth';
import { apiUrl, parseJsonResponse } from '../utils/api';

function StaffLogin() {
  const navigate = useNavigate();
  const [needsSetup, setNeedsSetup] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [resetForm, setResetForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch(apiUrl('/api/auth/setup-status'));
        const data = await parseJsonResponse(res);
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setNeedsSetup(data.needsSetup);
        if (data.registeredEmail) setRegisteredEmail(data.registeredEmail);
      } catch (err) {
        setError(err.message);
        setNeedsSetup(false);
      }
    }
    checkSetup();
  }, []);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const completeAuth = (data) => {
    setStaffSession(data.token, data.staff);
    navigate('/staff/dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      completeAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      completeAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetForm),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      setSuccess(data.message);
      setShowReset(false);
      setLoginForm((prev) => ({ ...prev, email: resetForm.email, password: '' }));
      setResetForm({ email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (needsSetup === null) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <span className="logo-icon" aria-hidden="true">+</span>
              <span className="logo-text">CareBridge NGO</span>
            </div>
            <Link to="/" className="header-link">Back to Portal</Link>
          </div>
        </header>
        <main className="main-content staff-login-page">
          <div className="card staff-login-card">
            <p className="loading-text">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon" aria-hidden="true">+</span>
            <span className="logo-text">CareBridge NGO</span>
          </div>
          <Link to="/" className="header-link">Back to Portal</Link>
        </div>
      </header>

      <main className="main-content staff-login-page">
        <div className="card staff-login-card">
          <div className="staff-login-header">
            <span className="staff-badge">Staff Only</span>
            <h1>
              {needsSetup
                ? 'First-Time Staff Setup'
                : showReset
                  ? 'Reset Password'
                  : 'NGO Staff Login'}
            </h1>
            <p className="card-subtitle">
              {needsSetup
                ? 'Create your staff account to access the request management dashboard. This can only be done once.'
                : showReset
                  ? 'Enter your registered email and choose a new password.'
                  : 'Sign in with the email and password you created during staff setup.'}
            </p>
            {!needsSetup && !showReset && registeredEmail && (
              <p className="registered-email-hint">
                Registered account: <strong>{registeredEmail}</strong>
              </p>
            )}
          </div>

          {needsSetup ? (
            <form onSubmit={handleRegister} className="support-form">
              <div className="form-row">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="regEmail">Staff Email</label>
                <input
                  id="regEmail"
                  name="email"
                  type="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="Enter your work email"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="form-row">
                <label htmlFor="regPassword">Create Password</label>
                <input
                  id="regPassword"
                  name="password"
                  type="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-row">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Re-enter password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              {error && <p className="form-error" role="alert">{error}</p>}

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Staff Account'}
              </button>
            </form>
          ) : showReset ? (
            <form onSubmit={handleReset} className="support-form">
              <div className="form-row">
                <label htmlFor="resetEmail">Staff Email</label>
                <input
                  id="resetEmail"
                  name="email"
                  type="email"
                  value={resetForm.email}
                  onChange={handleResetChange}
                  placeholder="Enter your registered email"
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="resetPassword">New Password</label>
                <input
                  id="resetPassword"
                  name="password"
                  type="password"
                  value={resetForm.password}
                  onChange={handleResetChange}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-row">
                <label htmlFor="resetConfirm">Confirm New Password</label>
                <input
                  id="resetConfirm"
                  name="confirmPassword"
                  type="password"
                  value={resetForm.confirmPassword}
                  onChange={handleResetChange}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="form-error" role="alert">{error}</p>}

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>

              <button
                type="button"
                className="btn btn-link btn-full"
                onClick={() => { setShowReset(false); setError(''); }}
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="support-form">
              <div className="form-row">
                <label htmlFor="email">Staff Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="Enter your registered email"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="form-row">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && <p className="form-error" role="alert">{error}</p>}
              {success && <p className="form-success" role="status">{success}</p>}

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                className="btn btn-link btn-full"
                onClick={() => { setShowReset(true); setError(''); setSuccess(''); }}
              >
                Forgot password?
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default StaffLogin;
