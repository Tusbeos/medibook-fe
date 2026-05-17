import React, { useCallback, useEffect, useState } from "react";
import "./HomeHeader.scss";
import { useLocation, useNavigate } from "react-router-dom";
import PatientLoginModal from "features/auth/PatientLoginModal";
import SidebarDrawer from "components/SidebarDrawer/SidebarDrawer";
import headerLogo from "assets/Header Logo.png";
import { useGetHomeStatsQuery } from "store/api/publicApi";

interface IHomeHeaderProps {
  isShowBanner?: boolean;
}

const HomeHeader: React.FC<IHomeHeaderProps> = ({ isShowBanner }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPatientLoginOpen, setIsPatientLoginOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: homeStatsResponse } = useGetHomeStatsQuery(undefined, {
    skip: !isShowBanner,
  });
  const homeStats = homeStatsResponse?.data;

  const returnToHome = useCallback(() => navigate("/home"), [navigate]);
  const goSpecialty = useCallback(() => navigate("/specialty"), [navigate]);
  const goClinic = useCallback(() => navigate("/clinic"), [navigate]);
  const goDoctor = useCallback(() => navigate("/top-doctor"), [navigate]);
  const goPackage = useCallback(() => navigate("/package"), [navigate]);
  const formatStat = useCallback(
    (value?: number) => new Intl.NumberFormat("vi-VN").format(value || 0),
    [],
  );

  const handleClosePatientLogin = useCallback(() => {
    setIsPatientLoginOpen(false);
    if (location.search.includes("patientLogin=1")) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  const handleRequestPatientLogin = useCallback(() => {
    setIsSidebarOpen(false);
    setIsPatientLoginOpen(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("patientLogin") === "1") {
      setIsPatientLoginOpen(true);
    }
  }, [location.search]);

  return (
    <>
      <PatientLoginModal
        isOpen={isPatientLoginOpen}
        onClose={handleClosePatientLogin}
      />
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onRequestPatientLogin={handleRequestPatientLogin}
      />

      <header className="home-header-container">
        <div className="home-header-content">
          <button className="brand" type="button" onClick={returnToHome}>
            <img src={headerLogo} alt="MediBook" />
          </button>

          <nav className="primary-nav" aria-label="Primary">
            <button
              className={
                location.pathname.startsWith("/specialty") ? "active" : ""
              }
              type="button"
              onClick={goSpecialty}
            >
              Chuyên khoa
            </button>
            <button
              className={
                location.pathname.startsWith("/clinic") ? "active" : ""
              }
              type="button"
              onClick={goClinic}
            >
              Cơ sở y tế
            </button>
            <button
              className={
                location.pathname.startsWith("/top-doctor") ||
                location.pathname.startsWith("/detail-doctor")
                  ? "active"
                  : ""
              }
              type="button"
              onClick={goDoctor}
            >
              Bác sĩ
            </button>
            <button
              className={
                location.pathname.startsWith("/package") ? "active" : ""
              }
              type="button"
              onClick={goPackage}
            >
              Gói khám
            </button>
          </nav>

          <div className="header-actions">
            <button type="button" className="type" aria-label="Thông báo">
              <i className="far fa-bell" />
            </button>
            <button type="button" className="type" aria-label="Hỗ trợ">
              <i className="far fa-question-circle" />
            </button>
            <button
              type="button"
              className="menu-toggle"
              aria-label="Mở menu"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fas fa-bars" />
            </button>
          </div>
        </div>
      </header>

      {isShowBanner && (
        <section className="home-hero">
          <div className="hero-content">
            <h1>
              Chăm sóc chính xác,
              <span>Sức khỏe vững vàng.</span>
            </h1>
            <p>
              Kết nối với bác sĩ chuyên khoa uy tín, cơ sở y tế chất lượng và hệ
              sinh thái đặt lịch khám liền mạch.
            </p>

            <div className="hero-search">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="Tìm chuyên khoa, bác sĩ hoặc cơ sở y tế..."
              />
              <button type="button" onClick={goSpecialty}>
                Tìm kiếm
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{formatStat(homeStats?.clinicCount)}</strong>
                <span>Cơ sở y tế</span>
              </div>
              <div>
                <strong>{formatStat(homeStats?.doctorCount)}</strong>
                <span>Bác sĩ</span>
              </div>
              <div>
                <strong>{formatStat(homeStats?.bookingCount)}</strong>
                <span>Lượt đặt</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HomeHeader;
