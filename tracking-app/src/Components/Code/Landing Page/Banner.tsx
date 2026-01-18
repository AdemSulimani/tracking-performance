import { useState, useEffect } from 'react';
import '../../Style/Landing style/Banner.css';

interface BannerProps {
    onBannerHidden?: (hidden: boolean) => void;
}

export function Banner({ onBannerHidden }: BannerProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Scrolling down
                setIsScrolled(true);
                onBannerHidden?.(true);
            } else if (currentScrollY < lastScrollY && currentScrollY <= 50) {
                // Scrolling up and near the top
                setIsScrolled(false);
                onBannerHidden?.(false);
            } else if (currentScrollY < lastScrollY && currentScrollY > 50) {
                // Scrolling up but not at the top - keep banner hidden
                setIsScrolled(true);
                onBannerHidden?.(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY, onBannerHidden]);

    const handleClose = () => {
        setIsVisible(false);
        onBannerHidden?.(true);
    };

    useEffect(() => {
        if (!isVisible) {
            onBannerHidden?.(true);
        }
    }, [isVisible, onBannerHidden]);

    if (!isVisible) {
        return null;
    }

    return (
        <section className={`banner ${isScrolled ? 'hidden' : ''}`}>
            <div className="banner-container">
                <p className="banner-text">Stay ahead with our 2026 HR calendar</p>
                <button 
                    className="banner-close" 
                    onClick={handleClose}
                    aria-label="Close banner"
                >
                    ×
                </button>
            </div>
        </section>
    );
}
