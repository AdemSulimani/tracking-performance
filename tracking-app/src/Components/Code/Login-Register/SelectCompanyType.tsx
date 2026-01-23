import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import '../../Style/Login style/Register.css';

export function SelectCompanyType() {
    const [selectedType, setSelectedType] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { updateCompanyType, user, getDashboardPath } = useAuth();
    const navigate = useNavigate();

    // Nëse user-i tashmë ka companyType, ridrejto në dashboard
    useEffect(() => {
        if (user && user.companyType) {
            const dashboardPath = getDashboardPath(user.companyType);
            navigate(dashboardPath, { replace: true });
        }
    }, [user, navigate, getDashboardPath]);

    const handleCompanyTypeSelect = (type: string) => {
        setSelectedType(type);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedType) {
            setError('Please select a company type');
            return;
        }

        setIsLoading(true);

        try {
            await updateCompanyType(selectedType);
            // Navigation is handled by AuthContext
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update company type. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form-wrapper">
                <h2 className="register-title">Select Your Company Type</h2>
                <p style={{ 
                    textAlign: 'center', 
                    color: '#666', 
                    marginBottom: '2rem',
                    fontSize: '0.95rem'
                }}>
                    Please choose the type of company you work for
                </p>
                
                {error && (
                    <div style={{ 
                        color: 'red', 
                        marginBottom: '1rem', 
                        padding: '0.75rem', 
                        backgroundColor: '#fee', 
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Company Type</label>
                        <div className="company-type-selector">
                            <button
                                type="button"
                                className={`company-type-card ${selectedType === 'sales' ? 'selected' : ''}`}
                                onClick={() => handleCompanyTypeSelect('sales')}
                                disabled={isLoading}
                            >
                                <div className="company-type-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="8.5" cy="7" r="4"></circle>
                                        <line x1="20" y1="8" x2="20" y2="14"></line>
                                        <line x1="23" y1="11" x2="17" y2="11"></line>
                                    </svg>
                                </div>
                                <span className="company-type-text">Sales Company</span>
                            </button>
                            <button
                                type="button"
                                className={`company-type-card ${selectedType === 'real-estate' ? 'selected' : ''}`}
                                onClick={() => handleCompanyTypeSelect('real-estate')}
                                disabled={isLoading}
                            >
                                <div className="company-type-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                </div>
                                <span className="company-type-text">Real Estate Company</span>
                            </button>
                            <button
                                type="button"
                                className={`company-type-card ${selectedType === 'telemarketing' ? 'selected' : ''}`}
                                onClick={() => handleCompanyTypeSelect('telemarketing')}
                                disabled={isLoading}
                            >
                                <div className="company-type-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </div>
                                <span className="company-type-text">Telemarketing Company</span>
                            </button>
                            <button
                                type="button"
                                className={`company-type-card ${selectedType === 'agency' ? 'selected' : ''}`}
                                onClick={() => handleCompanyTypeSelect('agency')}
                                disabled={isLoading}
                            >
                                <div className="company-type-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="9" y1="3" x2="9" y2="21"></line>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                    </svg>
                                </div>
                                <span className="company-type-text">Agency</span>
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="register-button" disabled={isLoading || !selectedType}>
                        {isLoading ? 'Saving...' : 'Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}

