import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { GoogleAuthModal } from './GoogleAuthModal';
import '../../Style/Login style/Register.css';

export function Register() {
    const [formData, setFormData] = useState({
        companyType: '',
        name: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    
    const { register } = useAuth();

    const setFieldError = (field: string, message: string) => {
        setFieldErrors(prev => ({ ...prev, [field]: message }));
    };

    const clearFieldError = (field: string) => {
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fieldName = e.target.name;
        setFormData({
            ...formData,
            [fieldName]: e.target.value
        });
        // Clear error for this field when user starts typing
        clearFieldError(fieldName);
    };

    const handleCompanyTypeSelect = (type: string) => {
        setFormData({
            ...formData,
            companyType: type
        });
        clearFieldError('companyType');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // Client-side validation
        if (!formData.companyType) {
            setFieldError('companyType', 'Please select a company type');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setFieldError('confirmPassword', 'Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setFieldError('password', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setFieldErrors({});
        setSuccess(false);

        try {
            await register(formData);
            // Show success message
            setSuccess(true);
            setIsLoading(false);
            
            // Redirect to login after 1.5 seconds with smooth transition
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            
            // Map backend error messages to specific fields
            if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already')) {
                setFieldError('email', 'Email is already in use');
            } else if (errorMessage.toLowerCase().includes('email') && (errorMessage.toLowerCase().includes('not valid') || errorMessage.toLowerCase().includes('invalid'))) {
                setFieldError('email', 'Email is not valid');
            } else if (errorMessage.toLowerCase().includes('username') || (errorMessage.toLowerCase().includes('name') && errorMessage.toLowerCase().includes('already'))) {
                setFieldError('name', 'Username (name) is already in use');
            } else if (errorMessage.toLowerCase().includes('name') && errorMessage.toLowerCase().includes('at least')) {
                setFieldError('name', 'Name must be at least 2 characters');
            } else if (errorMessage.toLowerCase().includes('password') && errorMessage.toLowerCase().includes('at least')) {
                setFieldError('password', 'Password must be at least 6 characters');
            } else if (errorMessage.toLowerCase().includes('password') && errorMessage.toLowerCase().includes('match')) {
                setFieldError('confirmPassword', 'Passwords do not match');
            } else {
                // Generic error - show for companyType as fallback
                setFieldError('companyType', errorMessage);
            }
            
            setIsLoading(false);
            setSuccess(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form-wrapper">
                <h2 className="register-title">Create Account</h2>
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Company Type</label>
                        {fieldErrors.companyType && (
                            <span className="field-error">{fieldErrors.companyType}</span>
                        )}
                        <div className="company-type-selector">
                            <button
                                type="button"
                                className={`company-type-card ${formData.companyType === 'sales' ? 'selected' : ''}`}
                                onClick={() => handleCompanyTypeSelect('sales')}
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
                                className={`company-type-card ${formData.companyType === 'real-estate' ? 'selected' : ''}`}
                                onClick={() => handleCompanyTypeSelect('real-estate')}
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
                                className={`company-type-card ${formData.companyType === 'telemarketing' ? 'selected' : ''}`}
                                onClick={() => handleCompanyTypeSelect('telemarketing')}
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
                                className={`company-type-card ${formData.companyType === 'agency' ? 'selected' : ''}`}
                                onClick={() => handleCompanyTypeSelect('agency')}
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
                        {!fieldErrors.companyType && formData.companyType === '' && (
                            <span className="form-error">Please select a company type</span>
                        )}
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={isLoading || success}
                            />
                            {fieldErrors.name && (
                                <span className="field-error">{fieldErrors.name}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastname" className="form-label">Lastname</label>
                            <input
                                type="text"
                                id="lastname"
                                name="lastname"
                                className={`form-input ${fieldErrors.lastname ? 'input-error' : ''}`}
                                placeholder="Enter your lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                                required
                                disabled={isLoading || success}
                            />
                            {fieldErrors.lastname && (
                                <span className="field-error">{fieldErrors.lastname}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading || success}
                        />
                        {fieldErrors.email && (
                            <span className="field-error">{fieldErrors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading || success}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <span className="field-error">{fieldErrors.password}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={isLoading || success}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && (
                            <span className="field-error">{fieldErrors.confirmPassword}</span>
                        )}
                    </div>

                    <button type="submit" className="register-button" disabled={isLoading || success}>
                        {isLoading ? 'Registering...' : success ? 'User Created!' : 'Register Now'}
                    </button>
                    {success && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            backgroundColor: '#d1fae5',
                            color: '#10b981',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            textAlign: 'center',
                            animation: 'fadeIn 0.3s ease'
                        }}>
                            ✓ User created successfully! Redirecting to login...
                        </div>
                    )}
                </form>

                <div className="register-divider">
                    <span>or</span>
                </div>

                <div className="register-with-email">
                    <button 
                        className="email-login-button" 
                        onClick={() => setShowGoogleModal(true)}
                        disabled={isLoading || success}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Sign up with Google</span>
                    </button>
                </div>

                <GoogleAuthModal 
                    isOpen={showGoogleModal}
                    onClose={() => setShowGoogleModal(false)}
                />

                <div className="register-link">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
}
