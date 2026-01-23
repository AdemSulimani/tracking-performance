import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LoadingSpinner } from '../../LoadingSpinner';
import '../../Style/Login style/Login.css';

export function GoogleCallback() {
    const navigate = useNavigate();
    const { googleAuth } = useAuth();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const handleGoogleCallback = async () => {
            try {
                // Merr authorization code nga URL query params (jo hash)
                const params = new URLSearchParams(window.location.search);
                let code = params.get('code');
                const error = params.get('error');
                const state = params.get('state');
                const savedState = localStorage.getItem('google_oauth_state');

                // Kontrollo state për security
                if (state !== savedState) {
                    console.error('Invalid state parameter');
                    setTimeout(() => {
                        navigate('/login', { replace: true });
                    }, 2000);
                    return;
                }

                // Fshi state nga localStorage
                localStorage.removeItem('google_oauth_state');

                if (error) {
                    console.error('Google OAuth error:', error);
                    setTimeout(() => {
                        navigate('/login', { replace: true });
                    }, 2000);
                    return;
                }

                if (!code) {
                    console.error('No authorization code received');
                    setTimeout(() => {
                        navigate('/login', { replace: true });
                    }, 2000);
                    return;
                }

                // URLSearchParams.get() automatikisht dekodon, por sigurohu që nuk ka HTML entities
                // Nëse ka HTML entities, zëvendësoji
                code = code.replace(/&#x2F;/g, '/').replace(/&#47;/g, '/');

                // Dërgo authorization code te backend (jo token)
                await googleAuth(code);
                
                // Nëse arrijmë këtu, login-i ishte i suksesshëm
                setShowSuccess(true);
                // Navigation is handled by AuthContext
            } catch (err) {
                console.error('Google auth error:', err);
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 2000);
            }
        };

        handleGoogleCallback();
    }, [navigate, googleAuth]);

    return (
        <div className="login-container">
            <div className="login-form-wrapper" style={{ textAlign: 'center' }}>
                <LoadingSpinner />
                {showSuccess && (
                    <div style={{ 
                        marginTop: '2rem',
                        fontSize: '16px',
                        color: '#10b981',
                        fontWeight: '500'
                    }}>
                        Login successful! Redirecting to your dashboard...
                    </div>
                )}
            </div>
        </div>
    );
}

