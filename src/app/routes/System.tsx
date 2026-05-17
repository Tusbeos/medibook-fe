import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import UserRedux from "features/system/Admin/UserRedux";
import ManageDoctor from "features/system/Doctor/ManageDoctor";
import Header from "layout/Header/Header";
import Sidebar from "layout/Header/Sidebar";
import ManageSpecialty from "features/system/Specialty/ManageSpecialty";
import ManageClinic from "features/system/Clinic/ManageClinic";
import ManagePackage from "features/system/Package/ManagePackage";
import ManageSchedule from "features/system/Doctor/ManageSchedule";
import ClinicManagerDashboard from "features/system/ClinicManager/ClinicManagerDashboard";
import ClinicManagerDoctors from "features/system/ClinicManager/ClinicManagerDoctors";
import ClinicManagerBookings from "features/system/ClinicManager/ClinicManagerBookings";
import ClinicManagerPackages from "features/system/ClinicManager/ClinicManagerPackages";
import ClinicManagerApprovals from "features/system/ClinicManager/ClinicManagerApprovals";
import ClinicManagerReviewDoctor from "features/system/ClinicManager/ClinicManagerReviewDoctor";
import { IRootState } from "types";
import { USER_ROLE } from "utils";
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
