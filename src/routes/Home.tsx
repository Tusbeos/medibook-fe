import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLE } from "../utils";
import { IRootState } from "../types";

const Home = () => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  let linkToRedirect = "/home";

  if (isLoggedIn) {
    if (userInfo?.roleId === USER_ROLE.DOCTOR) {
      linkToRedirect = "/doctor/manage-schedule";
    } else if (userInfo?.roleId === USER_ROLE.CLINIC_MANAGER) {
      linkToRedirect = "/system/clinic-manager";
    } else {
      linkToRedirect = "/system/user-management";
    }
  }

  return (
    <Navigate to={linkToRedirect} replace />
  );
};

export default Home;
