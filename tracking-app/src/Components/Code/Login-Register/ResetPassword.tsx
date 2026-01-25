import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../Style/Login style/ResetPassword.css';
import { apiClient } from '../../../services/api';

export function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Merr token-in nga URL query parameter
    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            // Nëse nuk ka token, trego mesazh gabimi
            setMessage({
                type: 'error',
                text: 'Invalid or missing reset token. Please request a new password reset link.'
            });
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validim client-side
        if (!token) {
            setMessage({
                type: 'error',
                text: 'Invalid or missing reset token. Please request a new password reset link.'
            });
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setMessage({
                type: 'error',
                text: 'Password must be at least 6 characters long.'
            });
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setMessage({
                type: 'error',
                text: 'Passwords do not match. Please try again.'
            });
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.resetPassword(token, password, confirmPassword);
            setMessage({
                type: 'success',
                text: response.message || 'Password has been reset successfully. Redirecting to login...'
            });
            
            // Pastro password fields
            setPassword('');
            setConfirmPassword('');
            
            // Ridrejto në login pas 2 sekonda
            setTimeout(() => {
                navigate('/login');
            }, 2000);
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
        <div className="resetpassword-container">
            <div className="resetpassword-form-wrapper">
                <h2 className="resetpassword-title">Reset your password</h2>
                
                {message && (
                    <div className={`resetpassword-message ${message.type === 'success' ? 'success' : 'error'}`}>
                        {message.text}
                    </div>
                )}

                {token ? (
                    <form className="resetpassword-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">New Password</label>
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="form-input"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <button type="submit" className="resetpassword-button" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                ) : (
                    <div className="resetpassword-no-token">
                        <p className="resetpassword-info">
                            No reset token found. Please check your email for the password reset link.
                            <br />
                            <span style={{ fontSize: '13px', color: '#888', fontStyle: 'italic', marginTop: '8px', display: 'block' }}>
                                💡 Don't see the email? Check your spam folder!
                            </span>
                        </p>
                        <button 
                            type="button" 
                            className="resetpassword-button"
                            onClick={() => navigate('/forgot-password')}
                        >
                            Request New Reset Link
                        </button>
                    </div>
                )}

                <p className="resetpassword-info">
                    Please enter your new password. Make sure it's at least 6 characters long.
                </p>
            </div>
        </div>
    );
}

