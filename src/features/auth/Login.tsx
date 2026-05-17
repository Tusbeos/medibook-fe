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

      // System login is only for Admin, Doctor, and Clinic Manager.
      const roleId = userInfo?.roleId;
      if (roleId === USER_ROLE.ADMIN) {
        navigate("/system");
      } else if (roleId === USER_ROLE.CLINIC_MANAGER) {
        navigate("/system/clinic-manager");
      } else if (roleId === USER_ROLE.DOCTOR) {
        navigate("/doctor/manage-schedule");
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
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-container">
          <div className="login-content">
            <div className="login-heading">
              <h2>Đăng nhập hệ thống</h2>
              <p>Dành cho Admin, Bác sĩ và Quản lý phòng khám</p>
            </div>

            <div className="form-group input-login">
              <label>Email nội bộ</label>
              <div className="input-shell">
                <i className="fas fa-at" />
                <input
                  type="text"
                  placeholder="admin@medibook.vn"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            <div className="form-group input-login">
              <div className="password-label-row">
                <label>Mật khẩu</label>
                <button type="button" className="text-link">
                  Quên mật khẩu?
                </button>
              </div>
              <div className="input-shell password-shell">
                <i className="fas fa-lock" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                  />
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
