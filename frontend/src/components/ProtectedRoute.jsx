import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "buyer") {
      return <Navigate to="/buyer" />;
    }

    if (user.role === "vendor") {
      return <Navigate to="/vendor" />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin" />;
    }

    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;