import React from 'react';
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import UserRedux from "../containers/System/Admin/UserRedux";
import ManageDoctor from "../containers/System/Doctor/ManageDoctor";
import Header from "containers/Header/Header";
import Sidebar from "containers/Header/Sidebar";
import ManageSpecialty from "containers/System/Specialty/ManageSpecialty";
import ManageClinic from "containers/System/Clinic/ManageClinic";
import ManagePackage from "containers/System/Package/ManagePackage";
import ClinicManagerDashboard from "containers/System/Dashboard/ClinicManagerDashboard";
import { IRootState } from "../types";
import { USER_ROLE } from "../utils";
import './System.scss';

const System = () => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const isClinicManager = userInfo?.roleId === USER_ROLE.CLINIC_MANAGER;

  return (
    <div className="admin-layout">
      {isLoggedIn && <Sidebar />}
      <div className="admin-main">
        {isLoggedIn && <Header />}
        <div className="system-container">
          <div className="system-list">
            <Routes>
              <Route path="clinic-manager" element={<ClinicManagerDashboard />} />
              <Route path="clinic-manager/review-doctor/:doctorId" element={<ClinicManagerDashboard />} />
              <Route path="dashboard" element={<Navigate to="/system/clinic-manager" replace />} />
              {isClinicManager ? (
                <Route path="*" element={<Navigate to="/system/clinic-manager" replace />} />
              ) : (
                <>
                  <Route path="user-crud-redux" element={<UserRedux />} />
                  <Route path="user-management" element={<UserRedux />} />
                  <Route path="manage-doctor" element={<ManageDoctor />} />
                  <Route path="manage-doctor/create" element={<ManageDoctor initialMode="create" />} />
                  <Route path="manage-doctor/edit/:doctorId" element={<ManageDoctor initialMode="edit" />} />
                  <Route path="manage-specialty" element={<ManageSpecialty />} />
                  <Route path="manage-clinic" element={<ManageClinic />} />
                  <Route path="manage-package" element={<ManagePackage />} />
                  <Route path="*" element={<UserRedux />} />
                </>
              )}
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default System;
