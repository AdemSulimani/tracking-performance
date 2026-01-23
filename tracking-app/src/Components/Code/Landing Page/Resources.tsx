import '../../Style/Landing style/Resources.css'

export function Resources() {
    return (
        <section id="resources" className="resources">
            <div className="resources-container">
                <h2 className="resources-heading">Excellent HR teams deserve<br />excellent resources</h2>
                
                <div className="resources-grid">
                    <div className="resources-left-container">
                        <div className="resource-card">
                            <div className="resource-card-header">
                                <h3 className="resource-card-title">Library</h3>
                                <div className="resource-card-icon">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <p className="resource-card-description">
                                Explore the ultimate resource center for people management and people operations.
                            </p>
                        </div>
                        
                        <div className="resource-card">
                            <div className="resource-card-header">
                                <h3 className="resource-card-title">Lattice University</h3>
                                <div className="resource-card-icon">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <p className="resource-card-description">
                                On demand courses, live trainings, and customized templates to build and implement successful people programs.
                            </p>
                        </div>
                    </div>
                    
                    <div className="resources-main-container">
                        <div className="resources-main-content">
                            <h3 className="resources-main-title">The People Platform</h3>
                        </div>
                    </div>
                    
                    <div className="resources-right-container">
                        <div className="resource-card">
                            <div className="resource-card-header">
                                <h3 className="resource-card-title">Resources for Humans</h3>
                                <div className="resource-card-icon">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <p className="resource-card-description">
                                The community designed to help HR professionals connect, share advice, and ask questions.
                            </p>
                        </div>
                        
                        <div className="resource-card">
                            <div className="resource-card-header">
                                <h3 className="resource-card-title">Events</h3>
                                <div className="resource-card-icon">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <p className="resource-card-description">
                                Join us for events and webinars on all things people management and HR.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}