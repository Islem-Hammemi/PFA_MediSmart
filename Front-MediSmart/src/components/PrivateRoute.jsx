import { Navigate } from "react-router-dom";
import { isAuthenticated, getRole } from "../services/authService";

const PrivateRoute = ({ children, allowedRole }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && getRole() !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;