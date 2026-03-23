import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { USER_ROLE } from "../utils";
import { IRootState } from "../types";

interface IGuardProps {
  children: React.ReactElement;
}

/**
 * Redirect to login if not authenticated
 */
export const RequireAuth: React.FC<IGuardProps> = ({ children }) => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

/**
 * Redirect away from login if already authenticated
 */
export const RedirectIfAuth: React.FC<IGuardProps> = ({ children }) => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
};

/**
 * Admin-only guard — doctors go to /doctor/manage-schedule, others to /login
 */
export const RequireAdmin: React.FC<IGuardProps> = ({ children }) => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (userInfo?.roleId === USER_ROLE.ADMIN) {
    return children;
  }
  if (userInfo?.roleId === USER_ROLE.DOCTOR) {
    return <Navigate to="/doctor/manage-schedule" replace />;
  }
  return <Navigate to="/login" replace />;
};

/**
 * Doctor or Admin guard — others go to /login or /
 */
export const RequireDoctorOrAdmin: React.FC<IGuardProps> = ({ children }) => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  const role = userInfo?.roleId;
  if (role === USER_ROLE.DOCTOR || role === USER_ROLE.ADMIN) {
    return children;
  }
  return <Navigate to="/" replace />;
};

// Keep backward-compatible exports for gradual migration
// These are now used as wrapper components instead of HOCs
export const userIsAuthenticated = RequireAuth;
export const userIsNotAuthenticated = RedirectIfAuth;
export const userIsAdmin = RequireAdmin;
export const userIsDoctorOrAdmin = RequireDoctorOrAdmin;