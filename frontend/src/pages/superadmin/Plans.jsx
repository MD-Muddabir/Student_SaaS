/**
 * Super Admin - Plans Management
 * Create and manage subscription plans
 */

import { useState, useEffect } from "react";
import api from "../../services/api";
import BackButton from "../../components/common/BackButton";
import "../admin/Dashboard.css";

function Plans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
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
                const { id, ...data } = formData; // Remove null id
                await api.post("/plans", data);
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
            id: null,
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
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <BackButton />
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
            </div>

            {/* Plans Grid */}
            <div className="stats-grid">
                {plans.length === 0 ? (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2rem" }}>
                        No plans found. Create one to get started.
                    </div>
                ) : (
                    plans.map((plan) => (
                        <div key={plan.id} className="card" style={{ padding: "1.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                                <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#6366f1" }}>{plan.name}</h3>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => handleEdit(plan)}
                                        style={{ padding: "0.25rem 0.5rem" }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(plan.id)}
                                        style={{ padding: "0.25rem 0.5rem" }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
                                ₹{plan.price}
                                <span style={{ fontSize: "0.875rem", fontWeight: "normal", color: "#6b7280" }}> / month</span>
                            </div>

                            <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #e5e7eb" }}>
                                <strong>Student Limit:</strong> {plan.student_limit}
                            </div>

                            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem" }}>
                                <li style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                                    Attendance System: <span>{plan.feature_attendance ? "✅" : "❌"}</span>
                                </li>
                                <li style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                                    Fees Management: <span>{plan.feature_fees ? "✅" : "❌"}</span>
                                </li>
                                <li style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                                    Reports & Analytics: <span>{plan.feature_reports ? "✅" : "❌"}</span>
                                </li>
                                <li style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                                    Parent Portal: <span>{plan.feature_parent_portal ? "✅" : "❌"}</span>
                                </li>
                            </ul>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: "500px" }}>
                        <h2>{editMode ? "Edit Plan" : "Create New Plan"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Plan Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="form-input"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Student Limit</label>
                                <input
                                    type="number"
                                    name="student_limit"
                                    className="form-input"
                                    value={formData.student_limit}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Razorpay Plan ID (Optional)</label>
                                <input
                                    type="text"
                                    name="razorpay_plan_id"
                                    className="form-input"
                                    value={formData.razorpay_plan_id || ""}
                                    onChange={handleChange}
                                    placeholder="plan_123456"
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: "block", marginBottom: "0.5rem" }}>Features</label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                    <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input
                                            type="checkbox"
                                            name="feature_attendance"
                                            checked={formData.feature_attendance}
                                            onChange={handleChange}
                                        /> Attendance
                                    </label>
                                    <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input
                                            type="checkbox"
                                            name="feature_fees"
                                            checked={formData.feature_fees}
                                            onChange={handleChange}
                                        /> Fees
                                    </label>
                                    <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input
                                            type="checkbox"
                                            name="feature_reports"
                                            checked={formData.feature_reports}
                                            onChange={handleChange}
                                        /> Reports
                                    </label>
                                    <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <input
                                            type="checkbox"
                                            name="feature_parent_portal"
                                            checked={formData.feature_parent_portal}
                                            onChange={handleChange}
                                        /> Parent Portal
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editMode ? "Save Changes" : "Create Plan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Plans;
