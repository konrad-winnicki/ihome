import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthorizationContext } from "./contexts/AuthorizationContext";

export const ProtectedRoute = () => {
  const authContext = useContext(AuthorizationContext);

  if (!authContext.isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};
