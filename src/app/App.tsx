import React, { Fragment, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, useLocation } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars-2";
import { ToastContainer } from "react-toastify";
import {
  RedirectIfAuth,
  RequireAdmin,
  RequireDoctor,
  RequirePatient,
} from "hoc/authentication";
import Doctor from "app/routes/Doctor";

import { path } from "utils";
import { IRootState } from "types";

import Home from "app/routes/Home";
import Login from "features/auth/Login";
import System from "app/routes/System";
import HomePage from "features/public/home/HomePage";
import CustomScrollbars from "components/CustomScrollbars";
import DetailDoctor from "features/patient/Doctor/DetailDoctor";
import BookingDoctor from "features/patient/Booking/BookingDoctor";
import VerifyEmail from "features/patient/VerifyEmail";
import SpecialtyList from "features/patient/Specialty/SpecialtyList";
import DetailSpecialty from "features/patient/Specialty/DetailSpecialty";
import DetailClinic from "features/patient/Clinic/DetailClinic";
import ClinicList from "features/patient/Clinic/ClinicList";
import TopDoctorList from "features/patient/Doctor/TopDoctorList";
import PatientProfile from "features/patient/Profile/PatientProfile";
import PatientHistory from "features/patient/History/PatientHistory";
import PackageList from "features/patient/Package/PackageList";
import DetailPackage from "features/patient/Package/DetailPackage";
import SearchPage from "features/public/search/SearchPage";

const ScrollToTopOnRouteChange: React.FC<{
  scrollbarsRef: React.RefObject<Scrollbars>;
}> = ({ scrollbarsRef }) => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    scrollbarsRef.current?.scrollToTop();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search, scrollbarsRef]);

  return null;
};

interface IAppProps {
  persistor: any;
  onBeforeLift?: () => Promise<void>;
}

// App chuyển sang Function Component + Hooks
const App: React.FC<IAppProps> = ({ persistor, onBeforeLift }) => {
  const started = useSelector((state: IRootState) => state.app.started);
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const scrollbarsRef = useRef<Scrollbars>(null);

  return (
    <Fragment>
      <BrowserRouter>
        <div className="main-container">
          <div className="content-container">
            <CustomScrollbars
              ref={scrollbarsRef}
              style={{ height: "100vh", width: "100%" }}
            >
              <ScrollToTopOnRouteChange scrollbarsRef={scrollbarsRef} />
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
                  path={path.SEARCH}
                  element={<SearchPage />}
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
