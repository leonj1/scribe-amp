import React, { useEffect } from 'react';
import { Spin } from 'antd';

const AuthCallback = () => {
  useEffect(() => {
    // Handle OAuth callback if needed
    // For now, redirect to dashboard since we're using credential response
    window.location.href = '/dashboard';
  }, []);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Spin size="large" />
    </div>
  );
};

export default AuthCallback;
