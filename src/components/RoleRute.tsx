import { Navigate, Outlet } from "react-router-dom";

type RoleRouteProps = {
  allowedRoles: string[];
};

function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user.role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;