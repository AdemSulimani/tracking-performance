import { useState } from 'react';
import '../../Style/Login style/Forgotpass.css';
import { apiClient } from '../../../services/api';

export function Forgotpass() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await apiClient.forgotPassword(email);
            setMessage({
                type: 'success',
                text: response.message || 'Password reset instructions sent to your email'
            });
            setEmail(''); // Clear email after successful submission
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'An error occurred. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (

  <div className="forgotpass-container">
            <div className="forgotpass-form-wrapper">
                <h2 className="forgotpass-title">Forgot your password</h2>
                
                <form className="forgotpass-form" onSubmit={handleSubmit}>
                    {message && (
                        <div className={`forgotpass-message ${message.type === 'success' ? 'success' : 'error'}`}>
                            {message.text}
                            {message.type === 'success' && (
                                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                                    💡 Don't see the email? Check your spam folder!
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="form-group">
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="forgotpass-button" disabled={loading}>
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </form>

                <p className="forgotpass-info">
                    We will send you the instructions on how to reset the password in this email.
                    <br />
                    <span style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
                        💡 If you don't see it, check your spam folder!
                    </span>
                </p>
            </div>
        </div>
      
    );
}
