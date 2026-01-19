import '../../Style/Landing style/Intergrations.css'

export function Intergrations () {
    return (
        <>
        <section className="intergrations">
            <div className="intergrations-container">
                <div className="intergrations-left-container">
                    <p className="intergrations-small-text">INTEGRATIONS</p>
                    <h2 className="intergrations-heading">Connect to your HRIS and other platforms in minutes</h2>
                    <p className="intergrations-paragraph">Your HRIS stores the data-15Five helps you act on it. Connect instantly to drive engagement, retention, and performance.</p>
                    <button className="intergrations-button">Explore integrations</button>
                </div>
                <div className="intergrations-right-container">
                    <img src="/Integrations.webp" alt="Integrations" className="intergrations-image" />
                </div>
            </div>
        </section>
        </>
    )
}