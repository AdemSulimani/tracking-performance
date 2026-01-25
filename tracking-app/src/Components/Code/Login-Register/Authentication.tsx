import { useState, useRef, useEffect } from 'react';
import { apiClient } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import '../../Style/Login style/Authentication.css';

export function Authentication() {
    const [codes, setCodes] = useState<string[]>(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { getDashboardPath } = useAuth();

    const handleChange = (index: number, value: string) => {
        // Only allow single digit
        if (value.length > 1) return;
        
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newCodes = [...codes];
        newCodes[index] = value;
        setCodes(newCodes);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace' && !codes[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newCodes = [...codes];
        
        for (let i = 0; i < 6; i++) {
            if (pastedData[i] && /^\d$/.test(pastedData[i])) {
                newCodes[i] = pastedData[i];
            }
        }
        
        setCodes(newCodes);
        const lastFilledIndex = Math.min(pastedData.length - 1, 5);
        inputRefs.current[lastFilledIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = codes.join('');
        
        if (code.length !== 6) {
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            // Merr email nga localStorage
            const email = localStorage.getItem('pendingVerificationEmail');
            
            if (!email) {
                setError('Email not found. Please login again.');
                setIsLoading(false);
                return;
            }

            // Bëj request në /api/auth/verify-code
            const response = await apiClient.verifyCode(email, code);

            // Nëse sukses: token dhe user janë ruajtur tashmë në api.ts
            // Fshi pendingUserEmail nga localStorage (bëhet tashmë në api.ts)
            
            // Ridrejto në dashboard bazuar në companyType
            const dashboardPath = getDashboardPath(response.user.companyType);
            
            // 2 second delay për të treguar sukses
            setTimeout(() => {
                window.location.href = dashboardPath;
            }, 2000);

        } catch (err) {
            // Nëse gabim: shfaq mesazh gabimi
            setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
            setIsLoading(false);
            // Reset codes për të lejuar përdoruesin të provojë përsëri
            setCodes(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            // Merr email nga localStorage
            const email = localStorage.getItem('pendingVerificationEmail');
            
            if (!email) {
                setError('Email not found. Please login again.');
                setIsLoading(false);
                return;
            }

            // Bëj request në /api/auth/resend-code
            const response = await apiClient.resendCode(email);

            if (response.success) {
                // Nëse sukses, reset codes dhe fokus në input-in e parë
                setCodes(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                setSuccessMessage('New verification code sent to your email');
                // Fshi success message pas 5 sekondave
                setTimeout(() => {
                    setSuccessMessage('');
                }, 5000);
            } else {
                setError(response.message || 'Failed to resend code. Please try again.');
            }
        } catch (err) {
            // Nëse gabim: shfaq mesazh gabimi
            setError(err instanceof Error ? err.message : 'Failed to resend code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Kontrollo nëse ka pendingVerificationEmail në localStorage
        const pendingEmail = localStorage.getItem('pendingVerificationEmail');
        if (!pendingEmail) {
            // Nëse nuk ka email, ridrejto në login
            window.location.href = '/login';
            return;
        }
        
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    return (
        <div className="authentication-container">
            <div className="authentication-form-wrapper">
                <h2 className="authentication-title">Enter your code that was sent to your email</h2>
                
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
                
                {successMessage && (
                    <div style={{ 
                        color: 'green', 
                        marginBottom: '1rem', 
                        padding: '0.75rem', 
                        backgroundColor: '#efe', 
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                    }}>
                        {successMessage}
                        <div style={{ marginTop: '8px', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                            💡 Don't see the email? Check your spam folder!
                        </div>
                    </div>
                )}
                
                <form className="authentication-form" onSubmit={handleSubmit}>
                    <div className="code-inputs-container">
                        {codes.map((code, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                className="code-input"
                                value={code}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                autoComplete="off"
                            />
                        ))}
                    </div>

                    <button 
                        type="submit" 
                        className="authentication-button"
                        disabled={codes.join('').length !== 6 || isLoading}
                    >
                        {isLoading ? 'Verifying...' : 'Verify Code'}
                    </button>
                </form>

                <div className="authentication-info">
                    <p className="expire-text">The code will expire in 15 minutes</p>
                    <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic', marginTop: '8px' }}>
                        💡 Don't see the code? Check your spam folder!
                    </p>
                    <button 
                        type="button" 
                        className="resend-button"
                        onClick={handleResend}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Resend code'}
                    </button>
                </div>
            </div>
        </div>
    );
}
