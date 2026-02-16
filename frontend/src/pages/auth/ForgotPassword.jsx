/**
 * Forgot Password Page
 * Password reset request form
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // TODO: Implement password reset API call
            // await api.post("/auth/forgot-password", { email });

            // Simulated success for now
            setTimeout(() => {
                setSuccess(true);
                setLoading(false);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset email");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">✉️ Check Your Email</h1>
                        <p className="auth-subtitle">
                            We've sent password reset instructions to {email}
                        </p>
                    </div>

                    <div className="alert alert-info">
                        <span>ℹ️</span>
                        <span>
                            Please check your email and follow the instructions to reset your password.
                        </span>
                    </div>

                    <Link to="/login" className="btn btn-primary btn-lg w-full">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">🔒 Reset Password</h1>
                    <p className="auth-subtitle">
                        Enter your email to receive reset instructions
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Remember your password?{" "}
                        <Link to="/login" className="font-semibold">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
