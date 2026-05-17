import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import UserRedux from "../containers/System/Admin/UserRedux";
import ManageDoctor from "../containers/System/Doctor/ManageDoctor";
import Header from "containers/Header/Header";
import Sidebar from "containers/Header/Sidebar";
import ManageSpecialty from "containers/System/Specialty/ManageSpecialty";
import ManageClinic from "containers/System/Clinic/ManageClinic";
import ManagePackage from "containers/System/Package/ManagePackage";
import ManageSchedule from "containers/System/Doctor/ManageSchedule";
import ClinicManagerDashboard from "containers/System/ClinicManager/ClinicManagerDashboard";
import ClinicManagerDoctors from "containers/System/ClinicManager/ClinicManagerDoctors";
import ClinicManagerBookings from "containers/System/ClinicManager/ClinicManagerBookings";
import ClinicManagerPackages from "containers/System/ClinicManager/ClinicManagerPackages";
import ClinicManagerApprovals from "containers/System/ClinicManager/ClinicManagerApprovals";
import ClinicManagerReviewDoctor from "containers/System/ClinicManager/ClinicManagerReviewDoctor";
import { IRootState } from "../types";
import { USER_ROLE } from "../utils";
import "./System.scss";

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
              {isClinicManager ? (
                <>
                  <Route
                    path="clinic-manager"
                    element={<ClinicManagerDashboard />}
                  />
                  <Route
                    path="clinic-manager/doctors"
                    element={<ClinicManagerDoctors />}
                  />
                  <Route
                    path="clinic-manager/schedules"
                    element={<ManageSchedule />}
                  />
                  <Route
                    path="clinic-manager/bookings"
                    element={<ClinicManagerBookings />}
                  />
                  <Route
                    path="clinic-manager/packages"
                    element={<ClinicManagerPackages />}
                  />
                  <Route
                    path="clinic-manager/approvals"
                    element={<ClinicManagerApprovals />}
                  />
                  <Route
                    path="clinic-manager/review-doctor/:doctorId"
                    element={<ClinicManagerReviewDoctor />}
                  />
                  <Route
                    path="dashboard"
                    element={<Navigate to="/system/clinic-manager" replace />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/system/clinic-manager" replace />}
                  />
                </>
              ) : (
                <>
                  <Route path="user-crud-redux" element={<UserRedux />} />
                  <Route path="user-management" element={<UserRedux />} />
                  <Route path="manage-doctor" element={<ManageDoctor />} />
                  <Route
                    path="manage-doctor/create"
                    element={<ManageDoctor initialMode="create" />}
                  />
                  <Route
                    path="manage-doctor/edit/:doctorId"
                    element={<ManageDoctor initialMode="edit" />}
                  />
                  <Route
                    path="manage-specialty"
                    element={<ManageSpecialty />}
                  />
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
