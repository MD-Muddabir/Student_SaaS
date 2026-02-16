/**
 * Super Admin Dashboard
 * Platform-wide analytics and management
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "../admin/Dashboard.css";

function SuperAdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalInstitutes: 0,
        activeInstitutes: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalStudents: 0,
        totalFaculty: 0,
    });

    const [recentInstitutes, setRecentInstitutes] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch analytics
            const analyticsRes = await api.get("/superadmin/analytics");
            setStats(analyticsRes.data.data);

            // Fetch recent institutes
            const institutesRes = await api.get("/institutes?limit=5");
            setRecentInstitutes(institutesRes.data.data || []);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="dashboard-container">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>👑 Super Admin Dashboard</h1>
                    <p>Platform-wide management and analytics</p>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-content">
                        <h3>{stats.totalInstitutes}</h3>
                        <p>Total Institutes</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.activeInstitutes}</h3>
                        <p>Active Institutes</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>₹{stats.totalRevenue?.toLocaleString()}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>₹{stats.monthlyRevenue?.toLocaleString()}</h3>
                        <p>Monthly Revenue</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👨‍🎓</div>
                    <div className="stat-content">
                        <h3>{stats.totalStudents}</h3>
                        <p>Total Students</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👩‍🏫</div>
                    <div className="stat-content">
                        <h3>{stats.totalFaculty}</h3>
                        <p>Total Faculty</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <Link to="/superadmin/institutes" className="action-card">
                        <div className="action-icon">🏢</div>
                        <h3>Manage Institutes</h3>
                        <p>View, suspend, or delete institutes</p>
                    </Link>

                    <Link to="/superadmin/plans" className="action-card">
                        <div className="action-icon">📋</div>
                        <h3>Manage Plans</h3>
                        <p>Create and update subscription plans</p>
                    </Link>

                    <Link to="/superadmin/analytics" className="action-card">
                        <div className="action-icon">📈</div>
                        <h3>Analytics</h3>
                        <p>View detailed platform analytics</p>
                    </Link>

                    <Link to="/superadmin/subscriptions" className="action-card">
                        <div className="action-icon">💳</div>
                        <h3>Subscriptions</h3>
                        <p>Manage all subscriptions</p>
                    </Link>

                    <Link to="/superadmin/revenue" className="action-card">
                        <div className="action-icon">💰</div>
                        <h3>Revenue</h3>
                        <p>View revenue reports</p>
                    </Link>

                    <Link to="/superadmin/settings" className="action-card">
                        <div className="action-icon">⚙️</div>
                        <h3>Settings</h3>
                        <p>Platform settings</p>
                    </Link>
                </div>
            </div>

            {/* Recent Institutes */}
            <div className="card" style={{ marginTop: "2rem" }}>
                <div className="card-header">
                    <h3 className="card-title">Recent Institutes</h3>
                    <Link to="/superadmin/institutes" className="btn btn-sm btn-primary">
                        View All
                    </Link>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Plan</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentInstitutes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                                        No institutes found
                                    </td>
                                </tr>
                            ) : (
                                recentInstitutes.map((institute) => (
                                    <tr key={institute.id}>
                                        <td>{institute.name}</td>
                                        <td>{institute.email}</td>
                                        <td>
                                            <span className={`badge badge-${institute.status === 'active' ? 'success' : 'danger'}`}>
                                                {institute.status}
                                            </span>
                                        </td>
                                        <td>{institute.Plan?.name || "No Plan"}</td>
                                        <td>{new Date(institute.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SuperAdminDashboard;
