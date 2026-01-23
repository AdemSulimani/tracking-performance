import { useEffect } from 'react';
import '../../Style/Login style/GoogleAuthModal.css';

interface GoogleAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GoogleAuthModal({ isOpen, onClose }: GoogleAuthModalProps) {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    // Përdor window.location.origin për të siguruar që është i saktë
    // Por sigurohu që në Google Cloud Console ke shtuar të njëjtin URL
    const REDIRECT_URI = `${window.location.origin}/google-callback`;

    useEffect(() => {
        if (!isOpen) return;

        // Krijo Google OAuth URL me Authorization Code Flow
        const scope = 'openid email profile';
        const responseType = 'code'; // Përdorim 'code' në vend të 'token'
        const state = Math.random().toString(36).substring(7); // Random state për security
        localStorage.setItem('google_oauth_state', state);
        
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&include_granted_scopes=true&state=${state}&access_type=offline&prompt=consent`;

        // Hap në fullscreen (të njëjtin window)
        window.location.href = googleAuthUrl;
    }, [isOpen, GOOGLE_CLIENT_ID, REDIRECT_URI]);

    if (!isOpen) return null;

    return (
        <div className="google-auth-modal-overlay">
            <div className="google-auth-modal-content">
                <div className="google-auth-modal-body">
                    <div className="google-auth-loading">
                        <div className="google-auth-spinner"></div>
                        <p>Redirecting to Google...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

