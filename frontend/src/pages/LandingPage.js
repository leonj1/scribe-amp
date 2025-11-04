import React, { useEffect } from 'react';
import { Button } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const LandingPage = () => {
  const { isAuthenticated, handleGoogleLogin } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
      return;
    }

    // Initialize Google Sign-In
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
    }
  }, [isAuthenticated, handleGoogleLogin]);

  const handleGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      alert('Google Sign-In not loaded. Please refresh the page.');
    }
  };

  return (
    <div className="landing-page">
      <div className="hero-content">
        <h1 className="hero-title">Audio Transcription Service</h1>
        <p className="hero-subtitle">
          Secure and accurate transcription for healthcare professionals
        </p>
        <Button
          type="primary"
          size="large"
          icon={<GoogleOutlined />}
          onClick={handleGoogleSignIn}
          style={{
            height: '50px',
            fontSize: '16px',
            borderRadius: '25px',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
        >
          Login with Google
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
