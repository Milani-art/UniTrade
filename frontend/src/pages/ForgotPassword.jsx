import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitRequest = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityEmail: email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not submit request.');
      setToken(data.token);
      setStatus(data.status);
      setMessage('Your request was sent to an administrator. Check approval before setting a new password.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const checkApproval = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`/api/password-reset/status/${token}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not check request status.');
      setStatus(data.status);
      setMessage(data.status === 'APPROVED'
        ? 'Your request was approved. Set a new password below.'
        : `Request status: ${data.status}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const completeReset = async (event) => {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/password-reset/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not reset password.');
      setMessage('Password reset successfully. You can now sign in.');
      setStatus('COMPLETED');
      setNewPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/login" className="auth-close">×</Link>
        <div className="auth-header">
          <h1>Reset password</h1>
          <p>An administrator must approve your request first.</p>
        </div>
        {message && <div className="auth-message">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        {!token ? (
          <form className="auth-form" onSubmit={submitRequest}>
            <div className="form-group">
              <label>University Email</label>
              <div className="input-container">
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
            </div>
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Request password reset'}
            </button>
          </form>
        ) : status === 'APPROVED' ? (
          <form className="auth-form" onSubmit={completeReset}>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-container">
                <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength="8" required />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-container">
                <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength="8" required />
              </div>
            </div>
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save new password'}
            </button>
          </form>
        ) : status === 'COMPLETED' ? null : (
          <button className="auth-button" type="button" onClick={checkApproval} disabled={loading}>
            {loading ? 'Checking...' : 'Check approval status'}
          </button>
        )}
        <div className="auth-footer"><Link to="/login">Back to sign in</Link></div>
      </div>
    </div>
  );
}
