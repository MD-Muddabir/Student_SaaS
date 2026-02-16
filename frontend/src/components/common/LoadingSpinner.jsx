/**
 * Loading Spinner Component
 * Reusable loading indicator for async operations
 */

import "./LoadingSpinner.css";

/**
 * LoadingSpinner component
 * @param {Object} props - Component props
 * @param {string} props.size - Size of spinner (small, medium, large)
 * @param {string} props.message - Optional loading message
 * @returns {React.ReactElement} Loading spinner
 */
function LoadingSpinner({ size = "medium", message = "" }) {
    return (
        <div className="loading-spinner-container">
            <div className={`loading-spinner loading-spinner-${size}`}>
                <div className="spinner"></div>
            </div>
            {message && <p className="loading-message">{message}</p>}
        </div>
    );
}

export default LoadingSpinner;
