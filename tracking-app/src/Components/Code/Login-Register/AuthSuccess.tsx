import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LoadingSpinner } from '../../LoadingSpinner';
import '../../Style/Login style/Login.css';

export function AuthSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { getDashboardPath } = useAuth();
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthSuccess = async () => {
            try {
                // Merr token dhe user data nga URL query params
                const token = searchParams.get('token');
                const userParam = searchParams.get('user');
                const needsCompanyType = searchParams.get('needsCompanyType') === 'true';
                const errorParam = searchParams.get('error');

                // Kontrollo nëse ka error
                if (errorParam) {
                    setError(decodeURIComponent(errorParam));
                    setTimeout(() => {
                        navigate('/login', { replace: true });
                    }, 3000);
                    return;
                }

                // Kontrollo nëse ka token dhe user data
                if (!token || !userParam) {
                    setError('Missing authentication data. Please try again.');
                    setTimeout(() => {
                        navigate('/login', { replace: true });
                    }, 3000);
                    return;
                }

                // Dekodo user data
                let user;
                try {
                    user = JSON.parse(decodeURIComponent(userParam));
                } catch (parseError) {
                    console.error('Error parsing user data:', parseError);
                    setError('Invalid user data. Please try again.');
                    setTimeout(() => {
                        navigate('/login', { replace: true });
                    }, 3000);
                    return;
                }

                // Ruaj token dhe user në localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Fshi pendingVerificationEmail nëse ekziston (për Google OAuth nuk ka nevojë për verification code)
                localStorage.removeItem('pendingVerificationEmail');

                // Trego mesazh suksesi
                setShowSuccess(true);

                // Redirect bazuar në needsCompanyType
                if (needsCompanyType) {
                    // Nëse duhet company type, redirect në /select-company-type
                    setTimeout(() => {
                        navigate('/select-company-type', { replace: true });
                    }, 2000);
                } else if (user.companyType) {
                    // Nëse ka company type, redirect në dashboard
                    const dashboardPath = getDashboardPath(user.companyType);
                    setTimeout(() => {
                        navigate(dashboardPath, { replace: true });
                    }, 2000);
                } else {
                    // Nëse nuk ka company type, redirect në /select-company-type
                    setTimeout(() => {
                        navigate('/select-company-type', { replace: true });
                    }, 2000);
                }
            } catch (err) {
                console.error('Auth success error:', err);
                setError('An error occurred during authentication. Please try again.');
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 3000);
            }
        };

        handleAuthSuccess();
    }, [searchParams, navigate, getDashboardPath]);

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
                        Authentication successful! Redirecting...
                    </div>
                )}
                {error && (
                    <div style={{ 
                        marginTop: '2rem',
                        fontSize: '16px',
                        color: '#ef4444',
                        fontWeight: '500'
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

