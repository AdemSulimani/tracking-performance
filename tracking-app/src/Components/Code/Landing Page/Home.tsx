import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../Style/Landing style/Home.css'

export function Home() {
    const navigate = useNavigate()
    const logosTrackRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const track = logosTrackRef.current
        if (!track) return

        const handleResize = () => {
            if (window.innerWidth <= 768) {
                // Duplicate logos for infinite slide on mobile/tablet
                if (track.children.length === 8) {
                    const logos = Array.from(track.children)
                    logos.forEach((logo) => {
                        const clone = logo.cloneNode(true)
                        track.appendChild(clone)
                    })
                }
            } else {
                // Remove duplicates on desktop
                while (track.children.length > 8) {
                    track.removeChild(track.lastChild!)
                }
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <section id="home" className="home">
            <div className="home-container">
                <div className="home-content">
                    <div className="home-text-section">
                        <h1 className="home-heading">
                            People + <span className="purple-text">AI</span>: Succeeding Together
                        </h1>
                        <p className="home-description">
                            Join 5,000+ forward-thinking teams using Lattice's HR and AI tools to manage people, pay, and performance — all on one trusted platform.
                        </p>
                        <div className="home-buttons">
                            <button className="home-button primary" onClick={() => navigate('/login')}>Request a demo</button>
                            <button className="home-button secondary" onClick={() => navigate('/login')}>Take a tour {'>'}</button>
                        </div>
                    </div>
                    <div className="home-image-section">
                        <img src="/dashboard-h.PNG" alt="Dashboard" className="home-dashboard-image" />
                    </div>
                    <div className="home-logos-section">
                        <div className="home-logos-container">
                            <div className="home-logos-track" ref={logosTrackRef}>
                                <img src="/logo 1.svg" alt="Logo 1" className="home-logo" />
                                <img src="/logo 2.svg" alt="Logo 2" className="home-logo" />
                                <img src="/logo 3.svg" alt="Logo 3" className="home-logo" />
                                <img src="/logo 4.svg" alt="Logo 4" className="home-logo" />
                                <img src="/logo 5.svg" alt="Logo 5" className="home-logo" />
                                <img src="/logo 6.svg" alt="Logo 6" className="home-logo" />
                                <img src="/logo 7.svg" alt="Logo 7" className="home-logo" />
                                <img src="/logo 8.svg" alt="Logo 8" className="home-logo" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
