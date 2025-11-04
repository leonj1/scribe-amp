import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
