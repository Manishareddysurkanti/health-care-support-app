import SupportForm from '../components/SupportForm';
import { Link } from 'react-router-dom';

function UserPortal() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon" aria-hidden="true">+</span>
            <span className="logo-text">CareBridge NGO</span>
          </div>
          <div className="header-actions">
            <span className="header-tagline">Healthcare Support</span>
            <Link to="/staff/login" className="header-link">Staff Login</Link>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <h1>Healthcare Support Portal</h1>
          <p>
            CareBridge NGO connects patients, volunteers, and communities with
            compassionate healthcare assistance.
          </p>
        </section>

        <div className="portal-container">
          <SupportForm />
        </div>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} CareBridge NGO. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default UserPortal;
