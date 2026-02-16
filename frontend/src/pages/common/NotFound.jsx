/**
 * 404 Not Found Page
 */

import { Link } from "react-router-dom";
import "./ErrorPages.css";

function NotFound() {
    return (
        <div className="error-page">
            <div className="error-content">
                <h1 className="error-code">404</h1>
                <h2 className="error-title">Page Not Found</h2>
                <p className="error-message">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/" className="btn btn-primary btn-lg">
                    Go Home
                </Link>
            </div>
        </div>
    );
}

export default NotFound;
