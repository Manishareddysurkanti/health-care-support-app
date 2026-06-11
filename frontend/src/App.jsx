import { Routes, Route, Navigate } from 'react-router-dom';
import UserPortal from './pages/UserPortal';
import StaffLogin from './pages/StaffLogin';
import StaffDashboard from './pages/StaffDashboard';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserPortal />} />
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/staff/dashboard" element={<StaffDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
