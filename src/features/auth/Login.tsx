import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import * as actions from "../../store/actions";
import "./Login.scss";
import systemLogo from "../../assets/Logo Medibook.png";
import {
  handleGetUserById,
  handleSystemLoginApi,
} from "../../services/userService";
import { USER_ROLE } from "../../utils";

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const openForgotPassword = () => {
    setErrMessage("");
    setShowPassword(false);
    setIsForgotPasswordOpen(true);
  };

  const closeForgotPassword = () => {
    setIsForgotPasswordOpen(false);
  };

  const handleLogin = useCallback(async () => {
    setErrMessage("");
    try {
      const data = await handleSystemLoginApi(username, password);
      if (!data || !data.success) {
        return setErrMessage(data?.message || "Login failed");
      }

      let userInfo = data.data;
      if (userInfo?.roleId === USER_ROLE.PATIENT) {
        return setErrMessage(
          "Tài khoản bệnh nhân vui lòng đăng nhập ở khu vực bệnh nhân.",
        );
      }

      dispatch(actions.userLoginSuccess(userInfo, data.data?.token));

      if (data.data?.id) {
        try {
          const userDetailRes = await handleGetUserById(data.data.id);
          if (
            userDetailRes?.data &&
            (userDetailRes.success || userDetailRes.errCode === 0)
          ) {
            userInfo = {
              ...data.data,
              ...userDetailRes.data,
              token: data.data.token,
              refreshToken: data.data.refreshToken,
            };
            dispatch(actions.userLoginSuccess(userInfo, data.data?.token));
          }
        } catch (e) {
          // Login vẫn thành công; avatar sẽ fallback nếu không lấy được profile.
        }
      }
      console.log("Login success");

      // System login supports Admin, Doctor, Clinic Manager, and Writer.
      const roleId = userInfo?.roleId;
      if (roleId === USER_ROLE.ADMIN) {
        navigate("/system");
      } else if (roleId === USER_ROLE.CLINIC_MANAGER) {
        navigate("/system/clinic-manager");
      } else if (roleId === USER_ROLE.DOCTOR) {
        navigate("/doctor/manage-schedule");
      } else if (roleId === USER_ROLE.WRITER) {
        navigate("/system/writer/articles");
      } else {
        navigate("/");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Something went wrong. Please try again.";
      setErrMessage(msg);
      console.log("login error:", e);
    }
  }, [username, password, dispatch, navigate]);

  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.key === "Enter" || event.keyCode === 13) {
        handleLogin();
      }
    },
    [handleLogin],
  );

  return (
    <div className="login_background">
      <section className="login-brand-panel">
        <div className="brand-content">
          <div className="brand-logo-row">
            <div className="brand-logo-icon">
              <img src={systemLogo} alt="MediBook" />
            </div>
            <span>MediBook</span>
          </div>

          <h1>Cổng quản trị MediBook</h1>
          <p>
            Không gian làm việc dành cho quản trị viên, bác sĩ và quản lý phòng
            khám.
          </p>

          <div className="brand-stats">
            <div>
              <strong>R1</strong>
              <span>Quản trị hệ thống</span>
            </div>
            <div>
              <strong>R2/R4</strong>
              <span>Vận hành phòng khám</span>
            </div>
            <div>
              <strong>R5</strong>
              <span>Người viết bài / Cộng tác viên nội dung</span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-container">
          <div
            className={`login-content${isForgotPasswordOpen ? " login-content--recovery" : ""}`}
          >
            {isForgotPasswordOpen ? (
              <div className="forgot-password-view">
                <button
                  type="button"
                  className="forgot-back-button"
                  onClick={closeForgotPassword}
                  autoFocus
                >
                  <i className="fas fa-arrow-left" aria-hidden="true" />
                  Quay lại đăng nhập
                </button>

                <div className="forgot-password-icon" aria-hidden="true">
                  <i className="fas fa-key" />
                </div>

                <div className="login-heading forgot-password-heading">
                  <span className="forgot-password-eyebrow">
                    Hỗ trợ tài khoản
                  </span>
                  <h2>Quên mật khẩu?</h2>
                  <p>
                    Tài khoản hệ thống được cấp và quản lý nội bộ. Hãy liên hệ
                    quản trị viên phụ trách để xác minh và khôi phục quyền truy
                    cập an toàn.
                  </p>
                </div>

                <div className="recovery-account-card">
                  <div className="recovery-account-icon" aria-hidden="true">
                    <i className="fas fa-envelope" />
                  </div>
                  <div>
                    <span>Email cần hỗ trợ</span>
                    <strong>
                      {username.trim() || "Email tài khoản nội bộ của bạn"}
                    </strong>
                  </div>
                </div>

                <div className="recovery-steps" aria-label="Các bước khôi phục">
                  <div className="recovery-step">
                    <span>1</span>
                    <p>
                      Cung cấp email nội bộ và vai trò tài khoản cho quản trị
                      viên.
                    </p>
                  </div>
                  <div className="recovery-step">
                    <span>2</span>
                    <p>
                      Xác minh danh tính theo quy trình của đơn vị hoặc phòng
                      khám.
                    </p>
                  </div>
                  <div className="recovery-step">
                    <span>3</span>
                    <p>
                      Nhận thông tin đăng nhập mới và đổi mật khẩu ngay sau khi
                      truy cập.
                    </p>
                  </div>
                </div>

                <div className="recovery-security-note">
                  <i className="fas fa-shield-alt" aria-hidden="true" />
                  <p>
                    <strong>Lưu ý bảo mật</strong>
                    Không cung cấp mật khẩu cũ, mã truy cập hoặc token đăng nhập
                    cho bất kỳ ai.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-login recovery-login-button"
                  onClick={closeForgotPassword}
                >
                  Quay lại nhập mật khẩu
                </button>
              </div>
            ) : (
              <>
                <div className="login-heading">
                  <h2>Đăng nhập hệ thống</h2>
                  <p>
                    Dành cho Admin, Bác sĩ, Quản lý phòng khám và Người viết bài
                  </p>
                </div>

                <div className="form-group input-login">
                  <label htmlFor="system-login-email">Email nội bộ</label>
                  <div className="input-shell">
                    <i className="fas fa-at" aria-hidden="true" />
                    <input
                      id="system-login-email"
                      type="email"
                      placeholder="admin@medibook.vn"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoComplete="username"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group input-login password-input-group">
                  <label htmlFor="system-login-password">Mật khẩu</label>
                  <div className="input-shell password-shell">
                    <i className="fas fa-lock" aria-hidden="true" />
                    <input
                      id="system-login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                      }
                      aria-pressed={showPassword}
                    >
                      <i
                        className={
                          showPassword ? "fas fa-eye-slash" : "fas fa-eye"
                        }
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div className="password-actions-row">
                    <button
                      type="button"
                      className="text-link"
                      onClick={openForgotPassword}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                </div>

                <label className="remember-row">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>

                {errMessage && <div className="login-error">{errMessage}</div>}

                <button className="btn-login" onClick={handleLogin}>
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
