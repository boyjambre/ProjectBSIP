import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect ke halaman login jika tidak ada token
    return <Navigate to="/login" />;
  }

  // Render konten jika ada token
  return children;
};

export default PrivateRoute;
