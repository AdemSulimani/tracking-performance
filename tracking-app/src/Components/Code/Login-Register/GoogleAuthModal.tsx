import { useEffect } from 'react';
import { apiClient } from '../../../services/api';
import '../../Style/Login style/GoogleAuthModal.css';

interface GoogleAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GoogleAuthModal({ isOpen, onClose }: GoogleAuthModalProps) {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    // Përdor backend URL për redirect URI (Google do të redirect-ojë te backend)
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const REDIRECT_URI = `${BACKEND_URL}/api/auth/google/callback`;

    useEffect(() => {
        if (!isOpen) return;

        const initiateGoogleAuth = async () => {
            try {
                // Krijo Google OAuth URL me Authorization Code Flow
                const scope = 'openid email profile';
                const responseType = 'code'; // Përdorim 'code' në vend të 'token'
                const state = Math.random().toString(36).substring(7); // Random state për security
                
                // Ruaj state në localStorage (për backup)
                localStorage.setItem('google_oauth_state', state);
                
                // Dërgo state në backend për verifikim
                try {
                    await apiClient.storeGoogleAuthState(state);
                } catch (stateError) {
                    console.error('Error storing state in backend:', stateError);
                    // Vazhdo edhe nëse dështon (state do të verifikohet në localStorage)
                }
                
                const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&include_granted_scopes=true&state=${state}&access_type=offline&prompt=consent`;

                // Hap në fullscreen (të njëjtin window)
                window.location.href = googleAuthUrl;
            } catch (error) {
                console.error('Error initiating Google auth:', error);
            }
        };

        initiateGoogleAuth();
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

