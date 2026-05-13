import React from 'react';
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import ManageSchedule from "containers/System/Doctor/ManageSchedule";
import Header from "containers/Header/Header";
import Sidebar from "containers/Header/Sidebar";
import ManagePatient from "containers/System/Doctor/ManagePatient";
import Prescription from "containers/System/Doctor/Prescription";
import { IRootState } from "../types";
import "./System.scss";

const Doctor = () => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);

  return (
    <div className="admin-layout">
      {isLoggedIn && <Sidebar />}
      <div className="admin-main">
        {isLoggedIn && <Header />}
        <div className="system-container">
          <div className="Doctor-list">
            <Routes>
              <Route path="manage-schedule" element={<ManageSchedule />} />
              <Route path="manage-patient" element={<ManagePatient />} />
              <Route path="prescription/:bookingId" element={<Prescription />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctor;
