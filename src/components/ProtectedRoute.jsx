import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAppReady } = useAppContext();

  if (!isAppReady) {
    return null;
  }

  if (!user) {
    return <Navigate replace to="/register" />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate replace to="/topics" />;
  }

  return children;
}
