import { useState } from 'react';
import '../../Style/Landing style/Header.css';

interface HeaderProps {
    isBannerHidden?: boolean;
}

export function Header({ isBannerHidden = false }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <>
            <section className={`header ${isBannerHidden ? 'banner-hidden' : ''}`}>
                <div className="header-container">
                    <div className="header-left">
                        <img src="/logo.png" alt="Lattice Logo" className="header-logo" />
                    </div>
                    
                    <nav className="header-middle">
                        <ul className="header-nav">
                            <li><a href="#platform">Platform</a></li>
                            <li><a href="#why-lattice">Why Lattice</a></li>
                            <li><a href="#customers">Customers</a></li>
                            <li><a href="#resources">Resources</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                        </ul>
                    </nav>

                    <div className="header-right">
                        <button className="header-button">Get started</button>
                    </div>

                    <button 
                        className="hamburger-menu"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                    </button>
                </div>
            </section>

            <div 
                className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`}
                onClick={closeMenu}
            ></div>

            <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Lattice Logo" className="sidebar-logo" />
                    <button 
                        className="sidebar-close"
                        onClick={closeMenu}
                        aria-label="Close menu"
                    >
                        ×
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <ul className="sidebar-nav-list">
                        <li><a href="#platform" onClick={closeMenu}>Platform</a></li>
                        <li><a href="#why-lattice" onClick={closeMenu}>Why Lattice</a></li>
                        <li><a href="#customers" onClick={closeMenu}>Customers</a></li>
                        <li><a href="#resources" onClick={closeMenu}>Resources</a></li>
                        <li><a href="#pricing" onClick={closeMenu}>Pricing</a></li>
                    </ul>
                    <button className="sidebar-button" onClick={closeMenu}>Get started</button>
                </nav>
            </aside>
        </>
    );
}

