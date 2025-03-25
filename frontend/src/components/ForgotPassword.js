import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { resetPassword, authError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }
    
    setLocalError('');
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      setLocalError(authError || 'Failed to send password reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </div>
          
          <div className="auth-header">
            <h1>Check Your Email</h1>
            <p>Password reset instructions sent</p>
          </div>
          
          <div className="message-box">
            <p>
              We've sent password reset instructions to:
              <br />
              <strong>{email}</strong>
            </p>
            <p>
              Please check your inbox and follow the link to reset your password.
              If you don't see the email, please check your spam folder.
            </p>
          </div>
          
          <div className="button-container">
            <Link to="/login" className="btn-outline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Your Password</h1>
          <p>Enter your email address and we'll send you instructions to reset your password</p>
        </div>
        
        {localError && (
          <div className="error-alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{localError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              placeholder="your.email@example.com"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn-primary ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Remembered your password? <Link to="/login" className="auth-link">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;