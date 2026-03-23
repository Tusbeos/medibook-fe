import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { IRootState } from "../../types";
import { processLogout } from "../../store/actions/userActions";
import "./SidebarDrawer.scss";

interface ISidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarDrawer: React.FC<ISidebarDrawerProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  const handleNavigate = useCallback(
    (path: string) => {
      onClose();
      navigate(path);
    },
    [history, onClose],
  );

  const handleLogin = useCallback(() => {
    onClose();
    navigate("/login");
  }, [history, onClose]);

  const handleLogout = useCallback(() => {
    dispatch(processLogout());
    onClose();
    navigate("/home");
  }, [dispatch, history, onClose]);

  const displayName = userInfo
    ? `${userInfo.lastName || ""} ${userInfo.firstName || ""}`.trim()
    : "";

  return (
    <>
      {/* Overlay mờ phía sau */}
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />

      {/* Drawer trượt từ trái */}
      <div className={`sidebar-drawer ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="drawer-header">
          <span className="drawer-title">Menu</span>
          <button className="drawer-close" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="drawer-body">
          {!isLoggedIn ? (
            /* === Chưa đăng nhập === */
            <div className="drawer-section">
              <div className="guest-prompt">
                <i className="fas fa-user-circle guest-icon" />
                <p className="guest-text">
                  <FormattedMessage id="sidebar.login-prompt" defaultMessage="Đăng nhập để xem thông tin cá nhân và lịch sử khám bệnh" />
                </p>
                <button className="btn-login" onClick={handleLogin}>
                  <i className="fas fa-sign-in-alt" />
                  <span>
                    <FormattedMessage id="sidebar.login" defaultMessage="Đăng nhập" />
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* === Đã đăng nhập === */
            <>
              {/* Thông tin user */}
              <div className="drawer-section user-info-section">
                <div className="user-avatar">
                  {userInfo?.image ? (
                    <img
                      src={
                        userInfo.image.startsWith("data:")
                          ? userInfo.image
                          : `data:image/jpeg;base64,${userInfo.image}`
                      }
                      alt="avatar"
                    />
                  ) : (
                    <i className="fas fa-user-circle" />
                  )}
                </div>
                <div className="user-details">
                  <span className="user-name">{displayName || userInfo?.email}</span>
                  <span className="user-email">{userInfo?.email}</span>
                </div>
              </div>

              {/* Menu items */}
              <div className="drawer-section menu-section">
                <div
                  className="menu-item"
                  onClick={() => handleNavigate("/patient/profile")}
                >
                  <i className="fas fa-id-card" />
                  <span>
                    <FormattedMessage id="sidebar.profile" defaultMessage="Thông tin cá nhân" />
                  </span>
                  <i className="fas fa-chevron-right arrow" />
                </div>

                <div
                  className="menu-item"
                  onClick={() => handleNavigate("/patient/history")}
                >
                  <i className="fas fa-file-medical-alt" />
                  <span>
                    <FormattedMessage id="sidebar.history" defaultMessage="Lịch sử khám bệnh" />
                  </span>
                  <i className="fas fa-chevron-right arrow" />
                </div>
              </div>

              {/* Đăng xuất */}
              <div className="drawer-section">
                <div className="menu-item logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt" />
                  <span>
                    <FormattedMessage id="sidebar.logout" defaultMessage="Đăng xuất" />
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
