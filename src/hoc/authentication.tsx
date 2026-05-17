import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { USER_ROLE } from "../utils";
import { IRootState } from "../types";

interface IGuardProps {
  children: React.ReactElement;
}

const getRoleHomePath = (roleId?: string) => {
  if (roleId === USER_ROLE.DOCTOR) return "/doctor/manage-schedule";
  if (roleId === USER_ROLE.CLINIC_MANAGER) return "/system/clinic-manager";
  if (roleId === USER_ROLE.ADMIN) return "/system/user-management";
  return "/home";
};

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
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  if (isLoggedIn) {
    return <Navigate to={getRoleHomePath(userInfo?.roleId)} replace />;
  }
  return children;
};

/**
 * Public screens are for guests and patients only.
 * System roles are sent back to their own workspace.
 */
export const PublicOnly: React.FC<IGuardProps> = ({ children }) => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  if (!isLoggedIn || userInfo?.roleId === USER_ROLE.PATIENT) {
    return children;
  }

  return <Navigate to={getRoleHomePath(userInfo?.roleId)} replace />;
};

/**
 * Patient-only guard.
 */
export const RequirePatient: React.FC<IGuardProps> = ({ children }) => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  if (!isLoggedIn) {
    return <Navigate to="/home?patientLogin=1" replace />;
  }

  if (userInfo?.roleId === USER_ROLE.PATIENT) {
    return children;
  }

  return <Navigate to={getRoleHomePath(userInfo?.roleId)} replace />;
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
  if (userInfo?.roleId === USER_ROLE.ADMIN || userInfo?.roleId === USER_ROLE.CLINIC_MANAGER) {
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
export const RequireDoctor: React.FC<IGuardProps> = ({ children }) => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  const role = userInfo?.roleId;
  if (role === USER_ROLE.DOCTOR) {
    return children;
  }
  return <Navigate to={getRoleHomePath(role)} replace />;
};

// Keep backward-compatible exports for gradual migration
// These are now used as wrapper components instead of HOCs
export const userIsAuthenticated = RequireAuth;
export const userIsNotAuthenticated = RedirectIfAuth;
export const userIsAdmin = RequireAdmin;
export const RequireDoctorOrAdmin = RequireDoctor;
export const userIsDoctorOrAdmin = RequireDoctor;
