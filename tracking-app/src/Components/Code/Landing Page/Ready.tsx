import '../../Style/Landing style/Ready.css';

export function Ready() {
    return (
        <section className="ready">
            <div className="ready-container">
                <div className="ready-content">
                    <h1 className="ready-heading">Your people are your business</h1>
                    <p className="ready-subheading">Ensure both are successful with Lattice.</p>
                    <div className="ready-buttons">
                        <button className="ready-button">Request a demo</button>
                        <button className="ready-button">Take a free tour</button>
                    </div>
                    <div className="ready-ratings">
                        <div className="ready-rating">
                            <span className="ready-star">★</span>
                            <span className="ready-rating-text">4.7 on G2.com</span>
                        </div>
                        
                        <div className="ready-rating">
                            <span className="ready-star">★</span>
                            <span className="ready-rating-text">4.5 on Capterra</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}