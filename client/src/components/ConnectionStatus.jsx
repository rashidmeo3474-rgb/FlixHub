import { useState, useEffect } from 'react';
import api from '../api/client.js';

export default function ConnectionStatus() {
  const [status, setStatus] = useState('checking');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.get('/health');
        setStatus('connected');
        setShow(false);
      } catch (error) {
        setStatus('disconnected');
        setShow(true);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      background: status === 'connected' ? 'var(--good)' : 'var(--warn)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      zIndex: 1001,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'currentColor',
        animation: status === 'checking' ? 'pulse 1.5s infinite' : 'none'
      }} />
      {status === 'connected' && 'Server Connected'}
      {status === 'disconnected' && 'Server Offline - Using Demo Data'}
      {status === 'checking' && 'Checking Connection...'}
    </div>
  );
}