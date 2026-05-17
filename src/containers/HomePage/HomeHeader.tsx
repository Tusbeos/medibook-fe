import React, { useCallback, useEffect, useState } from "react";
import "./HomeHeader.scss";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarDrawer from "../../components/SidebarDrawer/SidebarDrawer";
import PatientLoginModal from "../Auth/PatientLoginModal";

interface IHomeHeaderProps {
  isShowBanner?: boolean;
}

const HomeHeader: React.FC<IHomeHeaderProps> = ({ isShowBanner }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPatientLoginOpen, setIsPatientLoginOpen] = useState(false);

  const returnToHome = useCallback(() => {
    navigate("/home");
  }, [navigate]);

  const handleSpecialtyClick = useCallback(() => {
    navigate("/specialty");
  }, [navigate]);

  const handleClinicClick = useCallback(() => {
    navigate("/clinic");
  }, [navigate]);

  const handleViewTopDoctors = useCallback(() => {
    navigate("/top-doctor");
  }, [navigate]);

  const handlePackageClick = useCallback(() => {
    navigate("/package");
  }, [navigate]);

  const handleOpenPatientLogin = useCallback(() => {
    setIsSidebarOpen(false);
    setIsPatientLoginOpen(true);
  }, []);

  const handleClosePatientLogin = useCallback(() => {
    setIsPatientLoginOpen(false);
    if (location.search.includes("patientLogin=1")) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("patientLogin") === "1") {
      setIsPatientLoginOpen(true);
    }
  }, [location.search]);

  return (
    <React.Fragment>
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onRequestPatientLogin={handleOpenPatientLogin}
      />
      <PatientLoginModal
        isOpen={isPatientLoginOpen}
        onClose={handleClosePatientLogin}
      />
      <div className="home-header-container">
        <div className="home-header-content">
          <div className="left-content">
            <i
              className="fas fa-bars"
              onClick={() => setIsSidebarOpen(true)}
            ></i>
            <div className="header-logo" onClick={returnToHome}></div>
          </div>
          <div className="center-content">
            <div
              className={`child-content${
                location.pathname.startsWith("/specialty") ? " active" : ""
              }`}
              onClick={handleSpecialtyClick}
              style={{ cursor: "pointer" }}
            >
              <div className="title">Chuyên khoa</div>
              <div className="sub-title">Tìm bác sĩ theo chuyên môn</div>
            </div>
            <div
              className={`child-content${
                location.pathname.startsWith("/clinic") ? " active" : ""
              }`}
              onClick={handleClinicClick}
              style={{ cursor: "pointer" }}
            >
              <div className="title">Cơ sở y tế</div>
              <div className="sub-title">Chọn bệnh viện, phòng khám</div>
            </div>
            <div
              className={`child-content${
                location.pathname.startsWith("/top-doctor") ||
                location.pathname.startsWith("/detail-doctor")
                  ? " active"
                  : ""
              }`}
              onClick={handleViewTopDoctors}
              style={{ cursor: "pointer" }}
            >
              <div className="title">Bác sĩ</div>
              <div className="sub-title">Đặt lịch với chuyên gia</div>
            </div>
            <div
              className={`child-content${
                location.pathname.startsWith("/package") ? " active" : ""
              }`}
              onClick={handlePackageClick}
              style={{ cursor: "pointer" }}
            >
              <div className="title">Gói khám</div>
              <div className="sub-title">Dịch vụ khám trọn gói</div>
            </div>
          </div>
          <div className="right-content">
            <div className="header-icon-button">
              <i className="far fa-bell"></i>
            </div>
            <div className="header-icon-button">
              <i className="far fa-question-circle"></i>
            </div>
          </div>
        </div>
      </div>
      {isShowBanner === true && (
        <div className="home-header-banner">
          <div className="content-up">
            <div className="title1">Nền tảng đặt lịch y tế</div>
            <div className="title2">Chăm sóc sức khỏe toàn diện</div>
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tìm chuyên khoa, bác sĩ, bệnh viện..."
              />
            </div>
          </div>
          <div className="content-down">
            <div className="stats-glass-bar">
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-hospital"></i>
                </div>
                <div className="stat-text">
                  <span className="stat-number">150+</span>
                  <span className="stat-label">Cơ sở y tế</span>
                </div>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-user-md"></i>
                </div>
                <div className="stat-text">
                  <span className="stat-number">1,500+</span>
                  <span className="stat-label">Bác sĩ</span>
                </div>
              </div>

              <div className="stat-divider"></div>

              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-file-medical"></i>
                </div>
                <div className="stat-text">
                  <span className="stat-number">10k+</span>
                  <span className="stat-label">Lượt đặt lịch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default HomeHeader;
