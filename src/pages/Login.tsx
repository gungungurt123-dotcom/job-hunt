import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      // Send the credential to our backend
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Save user to context & localStorage
        login(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Authentication failed on server.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('A network error occurred during login.');
    }
  };

  const handleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again.');
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary)',
      padding: '1rem'
    }}>
      <Card padding="3rem" className="animate-fade-in" style={{ 
        maxWidth: '450px', 
        width: '100%', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="logo-icon glass-panel" style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}>JH</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>JobHubへようこそ</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Googleアカウントでログインして、就活の情報を一元管理しましょう。
          </p>
        </div>

        {error && (
          <div style={{ 
            color: 'var(--danger)', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            fontSize: '0.875rem',
            width: '100%'
          }}>
            {error}
          </div>
        )}

        <div style={{ padding: '1rem 0' }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme="filled_black"
            shape="pill"
            text="continue_with"
            size="large"
          />
        </div>

      </Card>
    </div>
  );
};

export default Login;
