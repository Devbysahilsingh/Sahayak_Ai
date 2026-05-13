import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, getToken } from "../lib/api";

export default function RouteGuard({ allowedRoles, children }) {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith("/admin") || location.pathname.startsWith("/officer");
  const scope = isAdminArea ? "admin" : "citizen";
  const token = getToken(scope);
  const user = getCurrentUser(scope);

  if (!token || !user) {
    return <Navigate to={isAdminArea ? "/admin/login" : "/login"} replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={isAdminArea ? "/admin/login" : "/login"} replace />;
  }

  return children;
}
