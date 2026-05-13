import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, getToken } from "../lib/api";

export default function RouteGuard({ allowedRoles, children }) {
  const location = useLocation();
  const isOfficerArea = location.pathname.startsWith("/officer");
  const isAdminArea = location.pathname.startsWith("/admin");
  const scope = isOfficerArea ? "worker" : isAdminArea ? "admin" : "citizen";
  const token = getToken(scope);
  const user = getCurrentUser(scope);

  if (!token || !user) {
    return <Navigate to={isOfficerArea ? "/worker/login" : isAdminArea ? "/admin/login" : "/login"} replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={isOfficerArea ? "/worker/login" : isAdminArea ? "/admin/login" : "/login"} replace />;
  }

  return children;
}

