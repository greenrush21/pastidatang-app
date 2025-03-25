import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [division, setDivision] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  
  const navigate = useNavigate();
  const { signUp, user, authError } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Use authError from context if available
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }
    
    // Calculate password strength
    let strength = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) {
      strength += 1;
    } else {
      feedback.push('Use at least 8 characters');
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Add uppercase letters');
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Add lowercase letters');
    }
    
    // Number check
    if (/[0-9]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Add numbers');
    }
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Add special characters');
    }
    
    setPasswordStrength(strength);
    setPasswordFeedback(feedback.join(', '));
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }
    
    if (!password) {
      setLocalError('Password is required');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    if (passwordStrength < 3) {
      setLocalError('Please use a stronger password');
      return;
    }
    
    if (!division.trim()) {
      setLocalError('Division is required');
      return;
    }
    
    setLocalError('');
    setIsSubmitting(true);
    
    try {
      await signUp(email, password, { division, role: 'division' });
      // Show success message and redirect to login
      navigate('/registration-success');
    } catch (error) {
      // Error handling is done via authError from context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Register for Pastidatang</h1>
          <p>Create an account to access your division dashboard</p>
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
            <label htmlFor="email">Email</label>
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
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              placeholder="••••••••"
              required
            />
            {password && (
              <div className="password-strength">
                <div className="strength-meter">
                  <div 
                    className={`strength-bar strength-${passwordStrength}`} 
                    style={{ width: `${passwordStrength * 20}%` }}
                  ></div>
                </div>
                <div className="strength-text">
                  {passwordStrength === 0 && 'Very weak'}
                  {passwordStrength === 1 && 'Weak'}
                  {passwordStrength === 2 && 'Fair'}
                  {passwordStrength === 3 && 'Good'}
                  {passwordStrength === 4 && 'Strong'}
                  {passwordStrength === 5 && 'Very strong'}
                </div>
                {passwordFeedback && <div className="password-feedback">{passwordFeedback}</div>}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              placeholder="••••••••"
              required
            />
            {password && confirmPassword && password !== confirmPassword && (
              <div className="input-error">Passwords do not match</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="division">Division</label>
            <input
              type="text"
              id="division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              disabled={isSubmitting}
              placeholder="Enter your division name"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn-primary ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting || (password !== confirmPassword) || (passwordStrength < 3)}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;