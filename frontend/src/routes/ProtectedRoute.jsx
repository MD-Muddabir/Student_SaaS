/**
 * Protected Route Component
 * Handles authentication and role-based authorization
 * Redirects unauthorized users to appropriate pages
 */

import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * ProtectedRoute wrapper component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @returns {React.ReactElement} Protected content or redirect
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  // Check if user is authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return children;
}

export default ProtectedRoute;
