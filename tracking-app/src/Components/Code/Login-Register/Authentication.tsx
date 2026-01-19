import { useState, useRef, useEffect } from 'react';
import '../../Style/Login style/Authentication.css';

export function Authentication() {
    const [codes, setCodes] = useState<string[]>(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = codes.join('');
        if (code.length === 6) {
            // Handle authentication logic here
            console.log('Code:', code);
        }
    };

    const handleResend = () => {
        // Handle resend code logic here
        setCodes(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
    };

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    return (
        <div className="authentication-container">
            <div className="authentication-form-wrapper">
                <h2 className="authentication-title">Enter your code that was sent to your email</h2>
                
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
                        disabled={codes.join('').length !== 6}
                    >
                        Verify Code
                    </button>
                </form>

                <div className="authentication-info">
                    <p className="expire-text">The code will expire in 15 minutes</p>
                    <button 
                        type="button" 
                        className="resend-button"
                        onClick={handleResend}
                    >
                        Resend code
                    </button>
                </div>
            </div>
        </div>
    );
}
