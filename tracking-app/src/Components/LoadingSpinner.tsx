import './LoadingSpinner.css';

export function LoadingSpinner() {
    return (
        <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading...</p>
        </div>
    );
}

