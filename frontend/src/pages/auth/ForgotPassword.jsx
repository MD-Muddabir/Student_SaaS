/**
 * Forgot Password Page — 3-Step OTP Flow
 * Step 1: Enter email → POST /auth/forgot-password
 * Step 2: Enter 6-digit OTP (with countdown + resend)
 * Step 3: Enter new password → POST /auth/reset-password
 */

import { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import ThemeSelector from "../../components/ThemeSelector";
import api from "../../services/api";
import "./Auth.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const { setTheme, isDark } = useContext(ThemeContext);

    const [step, setStep]           = useState(1); // 1=email, 2=OTP, 3=newPassword
    const [email, setEmail]         = useState("");
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword]       = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass]   = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState("");
    const [success, setSuccess]           = useState(false);
    const [devOtp, setDevOtp]             = useState("");

    // OTP timer / resend
    const [timer, setTimer]               = useState(600);
    const [timerActive, setTimerActive]   = useState(false);
    const [resendCount, setResendCount]   = useState(0);
    const [resendMax]                     = useState(3);
    const [resendLoading, setResendLoading] = useState(false);
    const otpRefs = useRef([]);


    // Countdown
    useEffect(() => {
        if (!timerActive) return;
        if (timer <= 0) { setTimerActive(false); return; }
        const id = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(id);
    }, [timerActive, timer]);

    const startTimer = () => { setTimer(600); setTimerActive(true); };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // ── Step 1: Request OTP ────────────────────────────────────────────────
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) { setError("Please enter your email address."); return; }
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
            if (res.data.success) {
                // Security: always advance to step 2 even if email not found
                setStep(2);
                setOtpDigits(["", "", "", "", "", ""]);
                setResendCount(0);
                startTimer();
                if (res.data.devOtp) {
                    setDevOtp(res.data.devOtp);
                    setOtpDigits(res.data.devOtp.split(""));
                }
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── OTP digit handlers ────────────────────────────────────────────────
    const handleOtpDigit = (idx, val) => {
        const digit = val.replace(/\D/g, "").slice(-1);
        const next  = [...otpDigits];
        next[idx] = digit;
        setOtpDigits(next);
        setError("");
        if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpKeyDown = (idx, e) => {
        if (e.key === "Backspace" && !otpDigits[idx] && idx > 0)
            otpRefs.current[idx - 1]?.focus();
        if (e.key === "ArrowLeft"  && idx > 0) otpRefs.current[idx - 1]?.focus();
        if (e.key === "ArrowRight" && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setOtpDigits(pasted.split(""));
            otpRefs.current[5]?.focus();
        }
    };

    // ── Step 2: Verify OTP (move to step 3) ───────────────────────────────
    const handleOtpVerify = (e) => {
        e.preventDefault();
        const otp = otpDigits.join("");
        if (otp.length !== 6) { setError("Please enter all 6 OTP digits."); return; }
        setError("");
        setStep(3); // actual validation happens in step 3
    };

    // ── Resend OTP ────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (resendCount >= resendMax) return;
        setResendLoading(true);
        setError("");
        try {
            const res = await api.post("/auth/resend-otp", {
                email: email.trim().toLowerCase(),
                type:  "password_reset"
            });
            if (res.data.success) {
                setResendCount(res.data.resendCount ?? resendCount + 1);
                startTimer();
                setOtpDigits(["", "", "", "", "", ""]);
                if (res.data.devOtp) {
                    setDevOtp(res.data.devOtp);
                    setOtpDigits(res.data.devOtp.split(""));
                    alert(`[DEV] New OTP: ${res.data.devOtp}`);
                } else {
                    alert("A new OTP has been sent to your email.");
                }
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to resend OTP.";
            setError(msg);
            if (err.response?.status === 429) setResendCount(resendMax);
        } finally {
            setResendLoading(false);
        }
    };

    // ── Step 3: Reset Password ─────────────────────────────────────────────
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters."); return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match."); return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/auth/reset-password", {
                email:            email.trim().toLowerCase(),
                otp:              otpDigits.join(""),
                new_password:     newPassword,
                confirm_password: confirmPassword
            });
            if (res.data.success) {
                setSuccess(true);
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Password reset failed. Please try again.";
            setError(msg);
            // If OTP error — go back to OTP step
            if (msg.toLowerCase().includes("otp") || msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("attempt")) {
                setStep(2);
                setOtpDigits(["", "", "", "", "", ""]);
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Success Screen ─────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-orb auth-orb--1" />
                <div className="auth-orb auth-orb--2" />
                <div className="auth-orb auth-orb--3" />
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <div className="auth-logo">✅</div>
                            <h1 className="auth-title">Password Reset!</h1>
                            <p className="auth-subtitle">
                                Your password has been updated successfully. You can now login with your new password.
                            </p>
                        </div>
                        <button
                            className="auth-submit"
                            onClick={() => navigate("/login", { state: { message: "Password reset successfully. Please login." } })}
                        >
                            🚀 Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Step progress indicator ────────────────────────────────────────────
    const steps = ["Email", "OTP", "New Password"];

    return (
        <div className="auth-page">
            <div className="auth-orb auth-orb--1" />
            <div className="auth-orb auth-orb--2" />
            <div className="auth-orb auth-orb--3" />

            <div className="auth-theme-controls"><ThemeSelector loginMode /></div>

            <div className="auth-container" style={{ maxWidth: "440px" }}>
                <div className="auth-card">

                    {/* Step indicator */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "1.5rem" }}>
                        {steps.map((label, i) => {
                            const idx    = i + 1;
                            const active = idx === step;
                            const done   = idx < step;
                            return (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{
                                        width: "28px", height: "28px", borderRadius: "50%",
                                        background: done ? "#10B981" : active ? "var(--pro-accent,#818cf8)" : "var(--pro-glass-border,rgba(255,255,255,0.15))",
                                        color: (done || active) ? "#fff" : "var(--text-muted,#6B7280)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.75rem", fontWeight: "700", transition: "all 0.3s"
                                    }}>
                                        {done ? "✓" : idx}
                                    </div>
                                    <span style={{ fontSize: "0.75rem", color: active ? "var(--pro-accent,#818cf8)" : "var(--text-muted,#6B7280)", fontWeight: active ? "600" : "400" }}>
                                        {label}
                                    </span>
                                    {i < steps.length - 1 && (
                                        <div style={{ width: "24px", height: "2px", background: done ? "#10B981" : "var(--pro-glass-border,rgba(255,255,255,0.15))", borderRadius: "2px", marginLeft: "2px" }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ── STEP 1: Email ── */}
                    {step === 1 && (
                        <>
                            <div className="auth-header">
                                <div className="auth-logo">🔒</div>
                                <h1 className="auth-title">Forgot Password</h1>
                                <p className="auth-subtitle">Enter your registered email to receive a reset OTP</p>
                            </div>

                            {error && (
                                <div className="auth-alert">
                                    <span className="auth-alert__icon">⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleEmailSubmit} className="auth-form">
                                <div className="auth-field">
                                    <label htmlFor="fp-email" className="auth-label">
                                        <span className="auth-label__icon">✉️</span> Email Address
                                    </label>
                                    <input
                                        id="fp-email"
                                        type="email"
                                        className="auth-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setError(""); }}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" className={`auth-submit${loading ? " auth-submit--loading" : ""}`} disabled={loading}>
                                    {loading ? <><span className="auth-spinner" /> Sending OTP...</> : <>📨 Send Reset OTP</>}
                                </button>
                            </form>

                            <div className="auth-footer">
                                <p className="auth-footer__text">
                                    Remember your password?{" "}
                                    <Link to="/login" className="auth-link">Sign in here</Link>
                                </p>
                            </div>
                        </>
                    )}

                    {/* ── STEP 2: OTP ── */}
                    {step === 2 && (
                        <>
                            <div className="auth-header">
                                <div className="auth-logo">✉️</div>
                                <h1 className="auth-title">Enter OTP</h1>
                                <p className="auth-subtitle">
                                    Check <strong>{email}</strong> for a 6-digit code
                                </p>
                                <p style={{ color: "var(--text-muted,#6B7280)", fontSize: "0.82rem", marginTop: "0.25rem" }}>
                                    Also check your spam/junk folder
                                </p>
                            </div>

                            {devOtp && (
                                <div style={{ background: "#FFF7ED", border: "1px solid #F59E0B", borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem", fontSize: "0.85rem", color: "#92400E" }}>
                                    🛠️ <strong>Dev Mode OTP:</strong>{" "}
                                    <span style={{ fontFamily: "monospace", fontSize: "1.1rem", letterSpacing: "3px" }}>{devOtp}</span>
                                </div>
                            )}

                            {error && (
                                <div className="auth-alert" style={{ marginBottom: "1rem" }}>
                                    <span className="auth-alert__icon">⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleOtpVerify}>
                                <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "1.25rem 0" }}>
                                    {otpDigits.map((d, i) => (
                                        <input
                                            key={i}
                                            ref={el => otpRefs.current[i] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={d}
                                            onChange={e => handleOtpDigit(i, e.target.value)}
                                            onKeyDown={e => handleOtpKeyDown(i, e)}
                                            onPaste={i === 0 ? handleOtpPaste : undefined}
                                            style={{
                                                width: "48px", height: "56px", textAlign: "center",
                                                fontSize: "1.5rem", fontWeight: "700",
                                                border: `2px solid ${d ? "#EF4444" : "var(--pro-glass-border,rgba(255,255,255,0.15))"}`,
                                                borderRadius: "10px",
                                                background: "var(--pro-glass-bg,rgba(255,255,255,0.05))",
                                                color: "var(--text-primary,#1f2937)",
                                                outline: "none", transition: "border-color 0.2s", cursor: "text"
                                            }}
                                        />
                                    ))}
                                </div>

                                <div style={{ textAlign: "center", marginBottom: "1.25rem", fontSize: "0.9rem", color: timer <= 60 ? "#EF4444" : "var(--text-muted,#6B7280)" }}>
                                    {timer > 0
                                        ? <>⏱ Code expires in <strong>{formatTime(timer)}</strong></>
                                        : <span style={{ color: "#EF4444" }}>⚠️ OTP expired — please resend</span>
                                    }
                                </div>

                                <button
                                    type="submit"
                                    className="auth-submit"
                                    disabled={otpDigits.join("").length !== 6}
                                >
                                    Next → Set New Password
                                </button>

                                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                    {resendCount < resendMax ? (
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={resendLoading || timer > 540}
                                            style={{
                                                background: "none", border: "none",
                                                color: "var(--pro-accent,#818cf8)",
                                                cursor: (resendLoading || timer > 540) ? "not-allowed" : "pointer",
                                                textDecoration: "underline", fontSize: "0.9rem", padding: "0.5rem",
                                                opacity: (resendLoading || timer > 540) ? 0.5 : 1
                                            }}
                                        >
                                            {resendLoading ? "Sending..." : `Resend OTP (${resendMax - resendCount} left)`}
                                        </button>
                                    ) : (
                                        <p style={{ color: "#EF4444", fontSize: "0.85rem" }}>
                                            Resend limit reached. Please{" "}
                                            <button type="button" onClick={() => setStep(1)}
                                                style={{ background: "none", border: "none", color: "inherit", textDecoration: "underline", cursor: "pointer", padding: 0 }}>
                                                start over
                                            </button>.
                                        </p>
                                    )}
                                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted,#6B7280)", marginTop: "0.5rem" }}>
                                        Used {resendCount}/{resendMax} resends
                                    </p>
                                </div>

                                <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
                                    <button type="button" onClick={() => { setStep(1); setError(""); setTimerActive(false); }}
                                        style={{ background: "none", border: "none", color: "var(--text-muted,#6B7280)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}>
                                        ← Back to email
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* ── STEP 3: New Password ── */}
                    {step === 3 && (
                        <>
                            <div className="auth-header">
                                <div className="auth-logo">🔐</div>
                                <h1 className="auth-title">Set New Password</h1>
                                <p className="auth-subtitle">Choose a strong password for your account</p>
                            </div>

                            {error && (
                                <div className="auth-alert">
                                    <span className="auth-alert__icon">⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handlePasswordReset} className="auth-form">
                                <div className="auth-field">
                                    <label className="auth-label">
                                        <span className="auth-label__icon">🔒</span> New Password
                                    </label>
                                    <div className="auth-input-wrap">
                                        <input
                                            type={showPass ? "text" : "password"}
                                            className="auth-input"
                                            placeholder="Min 8 characters"
                                            value={newPassword}
                                            onChange={e => { setNewPassword(e.target.value); setError(""); }}
                                            required
                                            autoFocus
                                        />
                                        <button type="button" className="auth-eye-btn"
                                            onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                                            {showPass ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">
                                        <span className="auth-label__icon">✅</span> Confirm Password
                                    </label>
                                    <div className="auth-input-wrap">
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            className="auth-input"
                                            placeholder="Repeat new password"
                                            value={confirmPassword}
                                            onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                                            required
                                        />
                                        <button type="button" className="auth-eye-btn"
                                            onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                                            {showConfirm ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>

                                {/* Password strength hint */}
                                {newPassword.length > 0 && newPassword.length < 8 && (
                                    <p style={{ fontSize: "0.8rem", color: "#EF4444", marginTop: "-0.5rem", marginBottom: "0.75rem" }}>
                                        Password must be at least 8 characters
                                    </p>
                                )}

                                <button type="submit"
                                    className={`auth-submit${loading ? " auth-submit--loading" : ""}`}
                                    disabled={loading}>
                                    {loading ? <><span className="auth-spinner" /> Resetting...</> : <>🔑 Reset Password</>}
                                </button>

                                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                                    <button type="button" onClick={() => { setStep(2); setError(""); }}
                                        style={{ background: "none", border: "none", color: "var(--text-muted,#6B7280)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}>
                                        ← Back to OTP
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
