/**
 * Super Admin - Settings
 * Manage profile, security, and application settings
 */

import { useState, useEffect } from "react";
import api from "../../services/api";
import BackButton from "../../components/common/BackButton";
import "../admin/Dashboard.css"; // Reuse general styles

function Settings() {
    const [activeTab, setActiveTab] = useState("account");
    const [profile, setProfile] = useState({ name: "", email: "" });
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get("/auth/profile");
            setProfile(response.data.user);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        try {
            await api.put("/auth/profile", profile);
            setMessage({ type: "success", text: "Profile updated successfully" });

            // Should also update local storage user if needed, but not critical for now
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        try {
            await api.post("/auth/change-password", {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: "success", text: "Password changed successfully" });
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to change password" });
        }
    };

    if (loading) return <div className="dashboard-container">Loading...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>⚙️ Settings</h1>
                    <p>Manage your account and preferences</p>
                </div>
                <BackButton />
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid #e5e7eb" }}>
                <button
                    className={`tab-btn ${activeTab === "account" ? "active" : ""}`}
                    onClick={() => { setActiveTab("account"); setMessage({ type: "", text: "" }); }}
                    style={{
                        padding: "0.75rem 1.5rem",
                        border: "none",
                        background: "none",
                        borderBottom: activeTab === "account" ? "2px solid #6366f1" : "2px solid transparent",
                        color: activeTab === "account" ? "#6366f1" : "#6b7280",
                        fontWeight: activeTab === "account" ? "600" : "400",
                        cursor: "pointer",
                        fontSize: "1rem"
                    }}
                >
                    Account
                </button>
                <button
                    className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
                    onClick={() => { setActiveTab("security"); setMessage({ type: "", text: "" }); }}
                    style={{
                        padding: "0.75rem 1.5rem",
                        border: "none",
                        background: "none",
                        borderBottom: activeTab === "security" ? "2px solid #6366f1" : "2px solid transparent",
                        color: activeTab === "security" ? "#6366f1" : "#6b7280",
                        fontWeight: activeTab === "security" ? "600" : "400",
                        cursor: "pointer",
                        fontSize: "1rem"
                    }}
                >
                    Security
                </button>
                <button
                    className={`tab-btn ${activeTab === "system" ? "active" : ""}`}
                    onClick={() => { setActiveTab("system"); setMessage({ type: "", text: "" }); }}
                    style={{
                        padding: "0.75rem 1.5rem",
                        border: "none",
                        background: "none",
                        borderBottom: activeTab === "system" ? "2px solid #6366f1" : "2px solid transparent",
                        color: activeTab === "system" ? "#6366f1" : "#6b7280",
                        fontWeight: activeTab === "system" ? "600" : "400",
                        cursor: "pointer",
                        fontSize: "1rem"
                    }}
                >
                    System Info
                </button>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div style={{
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1.5rem",
                    backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2",
                    color: message.type === "success" ? "#166534" : "#991b1b",
                    border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Account Settings */}
            {activeTab === "account" && (
                <div className="card" style={{ maxWidth: "600px", padding: "2rem" }}>
                    <h3 style={{ marginBottom: "1.5rem" }}>Profile Information</h3>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                required
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                required
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                            Save Changes
                        </button>
                    </form>
                </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
                <div className="card" style={{ maxWidth: "600px", padding: "2rem" }}>
                    <h3 style={{ marginBottom: "1.5rem" }}>Change Password</h3>
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Current Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                required
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                                minLength="6"
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                                minLength="6"
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                            Update Password
                        </button>
                    </form>
                </div>
            )}

            {/* System Info */}
            {activeTab === "system" && (
                <div className="card" style={{ maxWidth: "600px", padding: "2rem" }}>
                    <h3 style={{ marginBottom: "1.5rem" }}>System Information</h3>
                    <div style={{ marginBottom: "1rem" }}>
                        <strong>Platform Version:</strong> 1.0.0
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <strong>Node Environment:</strong> {process.env.NODE_ENV || "development"}
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <strong>Database:</strong> MySQL + Sequelize
                    </div>
                    <div style={{ marginBottom: "1rem", color: "#6b7280", fontSize: "0.875rem" }}>
                        Simple Digital System © 2026. All rights reserved.
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;
