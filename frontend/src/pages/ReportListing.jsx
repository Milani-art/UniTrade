import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import './ReportListing.css';

export default function ReportListing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const itemId = searchParams.get('itemId') || '';
  
  const [formData, setFormData] = useState({
    itemId: itemId,
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('You must be logged in to report a listing.');
      }
      const user = JSON.parse(userStr);

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: formData.itemId,
          reporterId: user.id,
          reason: formData.reason
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to submit report.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="report-page">
        <div className="report-success">
          <h2>Report Submitted</h2>
          <p>Thank you for keeping our campus safe. The university administration will review your report shortly.</p>
          <Link to="/home" className="btn-cancel">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page">
      <div className="report-header">
        <h1>Report Listing</h1>
        <p>If you believe a listing is a scam or violates university guidelines, please report it below.</p>
      </div>

      <form className="report-form" onSubmit={handleSubmit}>
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        
        <div className="form-group">
          <label htmlFor="itemId">Listing ID</label>
          <input 
            type="text" 
            id="itemId" 
            value={formData.itemId} 
            onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
            placeholder="e.g. 12"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason for Reporting</label>
          <textarea 
            id="reason" 
            value={formData.reason} 
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Please describe why you are reporting this listing (e.g. suspected scam, inappropriate content, fake item)..."
            required
          />
        </div>

        <div className="report-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
