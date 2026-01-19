import { useEffect, useRef } from 'react'
import '../../Style/Landing style/Performance.css'

const talentItems = [
    { text: 'Goals & OKRs', checked: false },
    { text: 'Grow', checked: true },
    { text: 'Engagement', checked: true },
    { text: 'Performance', checked: true },
    { text: 'Compensation', checked: true },
    { text: 'Analytics', checked: false },
]

const aiItems = [
    { text: 'Meeting Assist', checked: false },
    { text: 'Engagement Insights', checked: true },
    { text: 'Performance Summaries', checked: true },
    { text: 'HR Help Desk', checked: true },
    { text: 'Writing Assist', checked: true },
    { text: 'Personalized Coaching', checked: false },
]

export function Performance() {
    const talentTrackRef = useRef<HTMLDivElement>(null)
    const aiTrackRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const talentTrack = talentTrackRef.current
        const aiTrack = aiTrackRef.current

        // Duplicate items for seamless infinite slide
        const duplicateItems = (track: HTMLDivElement, itemCount: number) => {
            // Clear any existing duplicates first
            while (track.children.length > itemCount) {
                track.removeChild(track.lastChild!)
            }
            
            if (track.children.length === itemCount) {
                // Duplicate the entire set once for seamless loop
                // This ensures when first set moves up and out, second set is ready to continue
                const items = Array.from(track.children)
                items.forEach((item) => {
                    const clone = item.cloneNode(true) as HTMLElement
                    track.appendChild(clone)
                })
            }
        }

        if (talentTrack) {
            duplicateItems(talentTrack, talentItems.length)
        }

        if (aiTrack) {
            duplicateItems(aiTrack, aiItems.length)
        }
    }, [])

    return (
        <section className="performance">
            <div className="performance-container">
                <div className="performance-header">
                    <h2 className="performance-title">High performance starts here.</h2>
                    <p className="performance-description">
                        By bringing best-in-class People and AI tools together, Lattice unlocks your team's potential – helping employees grow, managers lead, and companies succeed.
                    </p>
                </div>

                <div className="performance-cards">
                    <div className="performance-card talent-card">
                        <div className="card-header">
                            <h3 className="card-title">Talent</h3>
                            <button className="card-plus-button">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>
                        <div className="card-checklist-container">
                            <div className="card-checklist-track" ref={talentTrackRef}>
                                {talentItems.map((item, index) => (
                                    <div key={index} className={`checklist-item ${item.checked ? 'checked' : ''}`}>
                                        <span className="check-icon">✔</span>
                                        <span className="check-text">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="card-description">
                            Integrated performance and engagement tools that drive productivity and retention.
                        </p>
                    </div>

                    <div className="performance-card ai-card">
                        <div className="card-header">
                            <h3 className="card-title">AI</h3>
                            <button className="card-icon-button">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 13L13 3M13 3H3M13 3V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        <div className="card-checklist-container">
                            <div className="card-checklist-track" ref={aiTrackRef}>
                                {aiItems.map((item, index) => (
                                    <div key={index} className={`checklist-item ${item.checked ? 'checked' : ''}`}>
                                        <span className="check-icon">✔</span>
                                        <span className="check-text">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="card-description">
                            Save time, drive employee performance, and unlock manager insights with Lattice AI.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
