import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { IRootState } from "../../types";
import { processLogout } from "../../store/actions/userActions";
import { normalizeImageSrc, USER_ROLE } from "../../utils";
import "./SidebarDrawer.scss";

interface ISidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestPatientLogin?: () => void;
}

const SidebarDrawer: React.FC<ISidebarDrawerProps> = ({
  isOpen,
  onClose,
  onRequestPatientLogin,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const isPatientLoggedIn =
    isLoggedIn && userInfo?.roleId === USER_ROLE.PATIENT;

  const handleNavigate = useCallback(
    (path: string) => {
      onClose();
      navigate(path);
    },
    [navigate, onClose],
  );

  const handleLogin = useCallback(() => {
    if (onRequestPatientLogin) {
      onRequestPatientLogin();
      return;
    }
    onClose();
    navigate("/home?patientLogin=1");
  }, [navigate, onClose, onRequestPatientLogin]);

  const handleLogout = useCallback(() => {
    dispatch(processLogout());
    onClose();
    navigate("/home");
  }, [dispatch, navigate, onClose]);

  const displayName = isPatientLoggedIn
    ? `${userInfo.lastName || ""} ${userInfo.firstName || ""}`.trim()
    : "";
  const avatarSrc = isPatientLoggedIn ? normalizeImageSrc(userInfo?.image) : "";

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />

      <div className={`sidebar-drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <span className="drawer-title">Danh mục</span>
          <button className="drawer-close" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="drawer-body">
          {!isPatientLoggedIn ? (
            <div className="drawer-section">
              <div className="guest-prompt">
                <i className="fas fa-user-circle guest-icon" />
                <p className="guest-text">
                  <FormattedMessage
                    id="sidebar.login-prompt"
                    defaultMessage="Đăng nhập để xem thông tin cá nhân và lịch sử khám bệnh"
                  />
                </p>
                <button className="btn-login" onClick={handleLogin}>
                  <i className="fas fa-sign-in-alt" />
                  <span>
                    <FormattedMessage
                      id="sidebar.login"
                      defaultMessage="Đăng nhập"
                    />
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="drawer-section user-info-section">
                <div className="user-avatar">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Ảnh đại diện" />
                  ) : (
                    <i className="fas fa-user-circle" />
                  )}
                </div>
                <div className="user-details">
                  <span className="user-name">
                    {displayName || userInfo?.email}
                  </span>
                  <span className="user-email">{userInfo?.email}</span>
                </div>
              </div>

              <div className="drawer-section menu-section">
                <div
                  className="menu-item"
                  onClick={() => handleNavigate("/patient/profile")}
                >
                  <i className="fas fa-id-card" />
                  <span>
                    <FormattedMessage
                      id="sidebar.profile"
                      defaultMessage="Thông tin cá nhân"
                    />
                  </span>
                  <i className="fas fa-chevron-right arrow" />
                </div>

                <div
                  className="menu-item"
                  onClick={() => handleNavigate("/patient/history")}
                >
                  <i className="fas fa-file-medical-alt" />
                  <span>
                    <FormattedMessage
                      id="sidebar.history"
                      defaultMessage="Lịch sử khám bệnh"
                    />
                  </span>
                  <i className="fas fa-chevron-right arrow" />
                </div>
              </div>

              <div className="drawer-section">
                <div className="menu-item logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt" />
                  <span>
                    <FormattedMessage
                      id="sidebar.logout"
                      defaultMessage="Đăng xuất"
                    />
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SidebarDrawer;
