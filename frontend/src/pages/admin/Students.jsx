/**
 * Students Management Page
 * CRUD operations for student management
 */

import { useState, useEffect } from "react";
import api from "../../services/api";
import "../admin/Dashboard.css";

function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        roll_number: "",
        class_id: "",
        date_of_birth: "",
        gender: "male",
        address: "",
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get("/students");
            setStudents(response.data.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/students", formData);
            setShowModal(false);
            fetchStudents();
            resetForm();
        } catch (error) {
            console.error("Error creating student:", error);
            alert(error.response?.data?.message || "Failed to create student");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            try {
                await api.delete(`/students/${id}`);
                fetchStudents();
            } catch (error) {
                console.error("Error deleting student:", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            roll_number: "",
            class_id: "",
            date_of_birth: "",
            gender: "male",
            address: "",
        });
    };

    if (loading) {
        return <div className="dashboard-container">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Student Management</h1>
                    <p>Manage all students in your institute</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    + Add Student
                </button>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Class</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                                    No students found. Click "Add Student" to create one.
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.roll_number}</td>
                                    <td>{student.User?.name || "N/A"}</td>
                                    <td>{student.User?.email || "N/A"}</td>
                                    <td>{student.User?.phone || "N/A"}</td>
                                    <td>{student.Class?.name || "N/A"}</td>
                                    <td>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(student.id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Student</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-sm">×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Roll Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.roll_number}
                                        onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select
                                        className="form-select"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Add Student
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

export default Students;
