import React from 'react';
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import ManageSchedule from "containers/System/Doctor/ManageSchedule";
import Header from "containers/Header/Header";
import ManagePatient from "containers/System/Doctor/ManagePatient";
import Prescription from "containers/System/Doctor/Prescription";
import { IRootState } from "../types";

const Doctor = () => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);

  return (
    <React.Fragment>
      {isLoggedIn && <Header />}
      <div className="Doctor-container">
        <div className="Doctor-list">
          <Routes>
            <Route path="manage-schedule" element={<ManageSchedule />} />
            <Route path="manage-patient" element={<ManagePatient />} />
            <Route path="prescription/:bookingId" element={<Prescription />} />
          </Routes>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Doctor;
