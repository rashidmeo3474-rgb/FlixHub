import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginGateModal({ product, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      onClose();
      return;
    }
    
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [user, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleLogin = () => {
    navigate('/auth?tab=login');
  };

  const handleRegister = () => {
    navigate('/auth?tab=register');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        padding: '20px'
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          background: 'var(--background)',
          borderRadius: 20,
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--muted)',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s ease'
          }}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div
            style={{
<<<<<<< HEAD
              display: 'flex', 
              textAlign: 'center', 
              padding: isMobile ? '14px 20px' : '10px',
              borderRadius: isMobile ? 10 : 11, 
              fontSize: isMobile ? 14 : 13.5, 
              fontWeight: 700,
              minHeight: isMobile ? '48px' : 'auto',
=======
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              display: 'flex',
>>>>>>> fbdb5a0e799ae7ce0143f1c827542dad87270979
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '30px'
            }}
          >
            🔒
          </div>
          
          <h2 style={{ marginBottom: '12px', fontSize: '24px' }}>
            Login Required
          </h2>
          
          <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
            To purchase <strong>{product?.name}</strong> and access our premium streaming accounts, 
            please login to your account or create a new one.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={handleLogin}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
          >
            Login to Account
          </button>

          <button
            onClick={handleRegister}
            style={{
              background: 'transparent',
              color: 'var(--foreground)',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
          >
            Create New Account
          </button>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px', 
          paddingTop: '24px',
          borderTop: '1px solid var(--border)'
        }}>
          <p style={{ 
            color: 'var(--muted)', 
            fontSize: '14px',
            lineHeight: 1.5
          }}>
            Join thousands of satisfied customers enjoying premium streaming services 
            at unbeatable prices.
          </p>
        </div>
      </div>
    </div>
  );
}