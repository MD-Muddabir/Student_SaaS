/**
 * Unauthorized Access Page
 */

import { Link, useNavigate } from "react-router-dom";
import "./ErrorPages.css";

function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="error-page">
            <div className="error-content">
                <h1 className="error-code">403</h1>
                <h2 className="error-title">Access Denied</h2>
                <p className="error-message">
                    You don't have permission to access this page.
                </p>
                <div className="error-actions">
                    <button onClick={() => navigate(-1)} className="btn btn-secondary btn-lg">
                        Go Back
                    </button>
                    <Link to="/" className="btn btn-primary btn-lg">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Unauthorized;
