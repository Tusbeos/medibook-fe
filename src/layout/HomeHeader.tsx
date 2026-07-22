import React, { useCallback, useEffect, useRef, useState } from "react";
import "./HomeHeader.scss";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarDrawer from "components/SidebarDrawer/SidebarDrawer";
import headerLogo from "assets/Header Logo 1.png";
import {
  SearchResult,
  useGetHomeStatsQuery,
  useLazySearchPublicQuery,
} from "store/api/publicApi";
import { normalizeImageSrc } from "utils/CommonUtils";

interface IHomeHeaderProps {
  isShowBanner?: boolean;
}

const HomeHeader: React.FC<IHomeHeaderProps> = ({ isShowBanner }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [triggerSearch, { data: searchResponse, isFetching: isSearching }] =
    useLazySearchPublicQuery();
  const { data: homeStatsResponse } = useGetHomeStatsQuery(undefined, {
    skip: !isShowBanner,
  });
  const homeStats = homeStatsResponse?.data;
  const searchItems = searchResponse?.data?.items || [];

  useEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return;

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--home-header-height",
        `${headerElement.getBoundingClientRect().height}px`,
      );
    };

    updateHeaderHeight();
    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(headerElement);

    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.removeProperty("--home-header-height");
    };
  }, []);

  const returnToHome = useCallback(() => navigate("/home"), [navigate]);
  const goSpecialty = useCallback(() => navigate("/specialty"), [navigate]);
  const goClinic = useCallback(() => navigate("/clinic"), [navigate]);
  const goDoctor = useCallback(() => navigate("/top-doctor"), [navigate]);
  const goPackage = useCallback(() => navigate("/package"), [navigate]);
  const goArticles = useCallback(() => navigate("/articles"), [navigate]);
  const goSearch = useCallback(() => {
    const query = searchTerm.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [navigate, searchTerm]);
  const formatStat = useCallback(
    (value?: number) => new Intl.NumberFormat("vi-VN").format(value || 0),
    [],
  );
  const getSearchTypeLabel = useCallback((type: SearchResult["type"]) => {
    switch (type) {
      case "doctor":
        return "Bác sĩ";
      case "clinic":
        return "Cơ sở y tế";
      case "specialty":
        return "Chuyên khoa";
      case "package":
        return "Gói khám";
      default:
        return "Kết quả";
    }
  }, []);

  const getSearchTypeIcon = useCallback((type: SearchResult["type"]) => {
    switch (type) {
      case "doctor":
        return "fas fa-user-md";
      case "clinic":
        return "fas fa-hospital";
      case "specialty":
        return "fas fa-stethoscope";
      case "package":
        return "fas fa-briefcase-medical";
      default:
        return "fas fa-search";
    }
  }, []);

  const handleOpenSearchResult = useCallback(
    (item: SearchResult) => {
      setIsSearchFocused(false);
      navigate(item.url);
    },
    [navigate],
  );

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        goSearch();
      }
      if (event.key === "Escape") {
        setIsSearchFocused(false);
      }
    },
    [goSearch],
  );

  const handleRequestPatientLogin = useCallback(() => {
    setIsSidebarOpen(false);
    navigate("/patient/auth?mode=login", {
      state: { returnTo: `${location.pathname}${location.search}` },
    });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("patientLogin") === "1") {
      navigate("/patient/auth?mode=login", {
        replace: true,
        state: { returnTo: location.pathname },
      });
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    const query = searchTerm.trim();
    if (!isShowBanner || query.length < 2) {
      return;
    }

    const timer = window.setTimeout(() => {
      triggerSearch({ q: query, size: 6 });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [isShowBanner, searchTerm, triggerSearch]);

  return (
    <>
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onRequestPatientLogin={handleRequestPatientLogin}
      />

      <header ref={headerRef} className="home-header-container">
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
            <button
              className={
                location.pathname.startsWith("/articles") ? "active" : ""
              }
              type="button"
              onClick={goArticles}
            >
              Cẩm nang
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
              Chăm sóc chính xác
              <span>Sức khỏe vững vàng</span>
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
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => setIsSearchFocused(false), 150);
                }}
                onKeyDown={handleSearchKeyDown}
              />
              <button type="button" onClick={goSearch}>
                Tìm kiếm
              </button>

              {isSearchFocused && searchTerm.trim().length >= 2 && (
                <div className="hero-search-results">
                  {isSearching && (
                    <div className="search-state">Đang tìm kiếm...</div>
                  )}

                  {!isSearching && searchItems.length === 0 && (
                    <div className="search-state">Không có kết quả phù hợp</div>
                  )}

                  {!isSearching &&
                    searchItems.map((item) => (
                      <button
                        key={`${item.type}-${item.id}`}
                        type="button"
                        className="search-result-item"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleOpenSearchResult(item)}
                      >
                        <span className="result-thumbnail">
                          {normalizeImageSrc(item.thumbnail) ? (
                            <img
                              src={normalizeImageSrc(item.thumbnail)}
                              alt={item.title}
                            />
                          ) : (
                            <i className={getSearchTypeIcon(item.type)} />
                          )}
                        </span>
                        <span className="result-type">
                          {getSearchTypeLabel(item.type)}
                        </span>
                        <span className="result-text">
                          <strong>{item.title}</strong>
                          {item.subtitle && <small>{item.subtitle}</small>}
                        </span>
                      </button>
                    ))}

                  {!isSearching && searchItems.length > 0 && (
                    <button
                      type="button"
                      className="search-view-all"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={goSearch}
                    >
                      Xem tất cả kết quả
                    </button>
                  )}
                </div>
              )}
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
