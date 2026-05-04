import React from 'react';
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import UserRedux from "../containers/System/Admin/UserRedux";
import ManageDoctor from "../containers/System/Doctor/ManageDoctor";
import Header from "containers/Header/Header";
import Sidebar from "containers/Header/Sidebar";
import ManageSpecialty from "containers/System/Specialty/ManageSpecialty";
import ManageClinic from "containers/System/Clinic/ManageClinic";
import ManagePackage from "containers/System/Package/ManagePackage";
import { IRootState } from "../types";
import './System.scss';

const System = () => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);

  return (
    <div className="admin-layout">
      {isLoggedIn && <Sidebar />}
      <div className="admin-main">
        {isLoggedIn && <Header />}
        <div className="system-container">
          <div className="system-list">
            <Routes>
              <Route path="user-crud-redux" element={<UserRedux />} />
              <Route path="manage-doctor" element={<ManageDoctor />} />
              <Route path="manage-doctor/create" element={<ManageDoctor initialMode="create" />} />
              <Route path="manage-doctor/edit/:doctorId" element={<ManageDoctor initialMode="edit" />} />
              <Route path="manage-specialty" element={<ManageSpecialty />} />
              <Route path="manage-clinic" element={<ManageClinic />} />
              <Route path="manage-package" element={<ManagePackage />} />
              <Route path="*" element={<UserRedux />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default System;
