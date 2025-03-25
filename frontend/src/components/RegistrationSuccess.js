import React from 'react';
import { Link } from 'react-router-dom';

const RegistrationSuccess = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <div className="auth-header">
          <h1>Registration Successful!</h1>
          <p>Your account has been created successfully.</p>
        </div>
        
        <div className="message-box">
          <p>
            We've sent a confirmation email to your email address. 
            Please check your inbox and confirm your email address to activate your account.
          </p>
          <p>
            Once confirmed, you can login to access your dashboard.
          </p>
        </div>
        
        <div className="button-container">
          <Link to="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;