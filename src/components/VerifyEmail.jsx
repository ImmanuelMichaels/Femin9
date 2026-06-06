import { useEffect, useState, useCallback } from 'react';
import { auth } from '../context/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const sendVerificationEmail = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, []);

  const checkVerification = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        navigate('/onboarding');
      } else {
        alert('Email not verified yet. Check your inbox or spam folder.');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      // Use setTimeout to move state update out of the effect body
      const timer = setTimeout(() => {
        sendVerificationEmail();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [sendVerificationEmail]);

  const userEmail = auth.currentUser?.email;

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '100px auto', 
      padding: 20, 
      textAlign: 'center',
      background: 'white',
      borderRadius: 24,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
      <h2>Verify Your Email</h2>
      <p>We've sent a verification link to</p>
      <p><strong>{userEmail}</strong></p>
      <p style={{ fontSize: 14, color: '#666', marginTop: 16 }}>
        Click the link in the email to verify your account.
      </p>
      
      <button 
        onClick={checkVerification}
        style={{
          width: '100%',
          padding: 14,
          marginTop: 24,
          background: '#e84393',
          color: 'white',
          border: 'none',
          borderRadius: 30,
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        I've verified my email
      </button>
      
      <button 
        onClick={sendVerificationEmail}
        disabled={countdown > 0}
        style={{
          width: '100%',
          padding: 14,
          marginTop: 12,
          background: 'transparent',
          border: '1px solid #e84393',
          borderRadius: 30,
          fontSize: 14,
          cursor: countdown > 0 ? 'not-allowed' : 'pointer',
          color: '#e84393'
        }}
      >
        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend verification email'}
      </button>
    </div>
  );
}