import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Style/Landing style/Header.css';

interface HeaderProps {
    isBannerHidden?: boolean;
}

// Lista e komponenteve për navigim (pa Banner dhe Header)
const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'performance', label: 'Performance' },
    { id: 'our-process', label: 'Our Process' },
    { id: 'resources', label: 'Resources' },
    { id: 'intergrations', label: 'Integrations' },
    { id: 'ready', label: 'Ready' }
];

export function Header({ isBannerHidden = false }: HeaderProps) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = isBannerHidden ? 80 : 130; // Offset për header dhe banner
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        closeMenu();
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
                            {navigationItems.map((item) => (
                                <li key={item.id}>
                                    <a 
                                        href={`#${item.id}`}
                                        onClick={(e) => handleNavClick(e, item.id)}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="header-right">
                        <button className="header-button" onClick={() => navigate('/login')}>Get started</button>
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
                        {navigationItems.map((item) => (
                            <li key={item.id}>
                                <a 
                                    href={`#${item.id}`}
                                    onClick={(e) => handleNavClick(e, item.id)}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <button className="sidebar-button" onClick={() => { closeMenu(); navigate('/login'); }}>Get started</button>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
}

