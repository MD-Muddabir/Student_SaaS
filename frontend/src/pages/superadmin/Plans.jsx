/**
 * Super Admin - Plans Management
 * Create and manage subscription plans
 */

import { useState, useEffect } from "react";
import api from "../../services/api";
import "../admin/Dashboard.css";

function Plans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        student_limit: "",
        feature_attendance: true,
        feature_fees: true,
        feature_reports: true,
        feature_parent_portal: false,
        razorpay_plan_id: "",
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get("/plans");
            setPlans(response.data.data || []);
        } catch (error) {
            console.error("Error fetching plans:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.put(`/plans/${formData.id}`, formData);
                alert("Plan updated successfully");
            } else {
                await api.post("/plans", formData);
                alert("Plan created successfully");
            }
            setShowModal(false);
            resetForm();
            fetchPlans();
        } catch (error) {
            alert("Error: " + error.response?.data?.message);
        }
    };

    const handleEdit = (plan) => {
        setFormData(plan);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return;

        try {
            await api.delete(`/plans/${id}`);
            alert("Plan deleted successfully");
            fetchPlans();
        } catch (error) {
            alert("Error deleting plan: " + error.response?.data?.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            price: "",
            student_limit: "",
            feature_attendance: true,
            feature_fees: true,
            feature_reports: true,
            feature_parent_portal: false,
            razorpay_plan_id: "",
        });
        setEditMode(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    if (loading) {
        return <div className="dashboard-container">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>📋 Plans Management</h1>
                    <p>Create and manage subscription plans</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn btn-primary"
                >
                    + Create Plan
                </button>
            </div>

            {/* Plans Grid */}
            <div className="stats-grid">
                {plans.map((plan) => (
                    <div key={plan.id} className="card" style={{ padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                            <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#6366f1" }}>{plan.name}</h3>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleEdit(plan)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(plan.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
                            ₹{plan.price}
                            <span style={{ fontSize: "1rem", fontWeight: "normal", color: "#6b7280" }}>/month</span>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <strong>Student Limit:</strong>{" "}
                            {plan.student_limit || "Unlimited"}
                        </div>

                        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
                            <strong style={{ display: "block", marginBottom: "0.5rem" }}>Features:</strong>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                <li style={{ padding: "0.25rem 0" }}>
                                    {plan.feature_attendance ? "✅" : "❌"} Attendance Management
                                </li>
                                <li style={{ padding: "0.25rem 0" }}>
                                    {plan.feature_fees ? "✅" : "❌"} Fees Management
                                </li>
                                <li style={{ padding: "0.25rem 0" }}>
                                    {plan.feature_reports ? "✅" : "❌"} Reports & Analytics
                                </li>
                                <li style={{ padding: "0.25rem 0" }}>
                                    {plan.feature_parent_portal ? "✅" : "❌"} Parent Portal
                                </li>
                            </ul>
                        </div>

                        {plan.razorpay_plan_id && (
                            <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                                <strong>Razorpay ID:</strong> {plan.razorpay_plan_id}
                            </div>
                        )}
                    </div>
                ))}

                {plans.length === 0 && (
                    <div className="card" style={{ padding: "2rem", textAlign: "center", gridColumn: "1 / -1" }}>
                        <p>No plans created yet. Click "Create Plan" to add one.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Plan Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
                        <div className="modal-header">
                            <h3>{editMode ? "Edit Plan" : "Create New Plan"}</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-sm">×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Plan Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        placeholder="e.g., Basic, Pro, Premium"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Price (₹) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        className="form-input"
                                        placeholder="e.g., 999"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Student Limit</label>
                                    <input
                                        type="number"
                                        name="student_limit"
                                        className="form-input"
                                        placeholder="Leave empty for unlimited"
                                        value={formData.student_limit}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Razorpay Plan ID</label>
                                    <input
                                        type="text"
                                        name="razorpay_plan_id"
                                        className="form-input"
                                        placeholder="plan_xxxxxxxxxxxxx"
                                        value={formData.razorpay_plan_id}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Features</label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <input
                                                type="checkbox"
                                                name="feature_attendance"
                                                checked={formData.feature_attendance}
                                                onChange={handleChange}
                                            />
                                            Attendance Management
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <input
                                                type="checkbox"
                                                name="feature_fees"
                                                checked={formData.feature_fees}
                                                onChange={handleChange}
                                            />
                                            Fees Management
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <input
                                                type="checkbox"
                                                name="feature_reports"
                                                checked={formData.feature_reports}
                                                onChange={handleChange}
                                            />
                                            Reports & Analytics
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <input
                                                type="checkbox"
                                                name="feature_parent_portal"
                                                checked={formData.feature_parent_portal}
                                                onChange={handleChange}
                                            />
                                            Parent Portal
                                        </label>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editMode ? "Update Plan" : "Create Plan"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Plans;
