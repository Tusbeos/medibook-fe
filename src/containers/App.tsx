import React, { Fragment, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  RedirectIfAuth,
  RequireAdmin,
  RequireDoctor,
  RequirePatient,
} from "../hoc/authentication";
import Doctor from "../routes/Doctor";

import { path } from "../utils";
import { IRootState } from "../types";

import Home from "../routes/Home";
import Login from "./Auth/Login";
import System from "../routes/System";
import HomePage from "./HomePage/HomePage";
import CustomScrollbars from "../components/CustomScrollbars";
import DetailDoctor from "./Patient/Doctor/DetailDoctor";
import BookingDoctor from "./Patient/Booking/BookingDoctor";
import VerifyEmail from "./Patient/VerifyEmail";
import SpecialtyList from "./Patient/Specialty/SpecialtyList";
import DetailSpecialty from "./Patient/Specialty/DetailSpecialty";
import DetailClinic from "./Patient/Clinic/DetailClinic";
import ClinicList from "./Patient/Clinic/ClinicList";
import TopDoctorList from "./Patient/Doctor/TopDoctorList";
import PatientProfile from "./Patient/Profile/PatientProfile";
import PatientHistory from "./Patient/History/PatientHistory";
import PackageList from "./Patient/Package/PackageList";
import DetailPackage from "./Patient/Package/DetailPackage";

interface IAppProps {
  persistor: any;
  onBeforeLift?: () => Promise<void>;
}

// App chuyển sang Function Component + Hooks
const App: React.FC<IAppProps> = ({ persistor, onBeforeLift }) => {
  const started = useSelector((state: IRootState) => state.app.started);
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);

  return (
    <Fragment>
      <BrowserRouter>
        <div className="main-container">
          <div className="content-container">
            <CustomScrollbars style={{ height: "100vh", width: "100%" }}>
              <Routes>
                <Route path={path.HOME} element={<Home />} />
                <Route
                  path={path.LOGIN}
                  element={
                    <RedirectIfAuth>
                      <Login />
                    </RedirectIfAuth>
                  }
                />
                <Route
                  path={`${path.SYSTEM}/*`}
                  element={
                    <RequireAdmin>
                      <System />
                    </RequireAdmin>
                  }
                />
                <Route
                  path={path.DETAIL_SPECIALTY}
                  element={<DetailSpecialty />}
                />
                <Route
                  path={path.LIST_SPECIALTY}
                  element={<SpecialtyList />}
                />
                <Route
                  path="/doctor/*"
                  element={
                    <RequireDoctor>
                      <Doctor />
                    </RequireDoctor>
                  }
                />
                <Route
                  path={path.HOMEPAGE}
                  element={<HomePage />}
                />
                <Route
                  path={path.DETAIL_DOCTOR}
                  element={<DetailDoctor />}
                />
                <Route
                  path={path.BOOKING_DOCTOR}
                  element={<BookingDoctor />}
                />
                <Route
                  path={path.VERIFY_EMAIL_BOOKING}
                  element={<VerifyEmail />}
                />
                <Route
                  path={path.LIST_CLINIC}
                  element={<ClinicList />}
                />
                <Route
                  path={path.DETAIL_CLINIC}
                  element={<DetailClinic />}
                />
                <Route
                  path={path.LIST_PACKAGE}
                  element={<PackageList />}
                />
                <Route
                  path={path.DETAIL_PACKAGE}
                  element={<DetailPackage />}
                />
                <Route
                  path={path.LIST_TOP_DOCTOR}
                  element={<TopDoctorList />}
                />
                <Route
                  path={path.PATIENT_PROFILE}
                  element={
                    <RequirePatient>
                      <PatientProfile />
                    </RequirePatient>
                  }
                />
                <Route
                  path={path.PATIENT_HISTORY}
                  element={
                    <RequirePatient>
                      <PatientHistory />
                    </RequirePatient>
                  }
                />
              </Routes>
            </CustomScrollbars>
          </div>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </BrowserRouter>
    </Fragment>
  );
};

export default App;
