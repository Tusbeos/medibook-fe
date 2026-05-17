import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { handleGetUserById, handlePatientLoginApi } from "../../services/userService";
import { userLoginSuccess } from "../../store/actions/userActions";
import { USER_ROLE } from "../../utils";
import "./PatientLoginModal.scss";

interface IPatientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PatientLoginModal: React.FC<IPatientLoginModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetAndClose = useCallback(() => {
    setErrMessage("");
    setPassword("");
    onClose();
  }, [onClose]);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setErrMessage("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setErrMessage("");
    setIsLoading(true);
    try {
      const data = await handlePatientLoginApi(email.trim(), password);
      if (!data || !data.success || !data.data) {
        setErrMessage(data?.message || "Đăng nhập thất bại.");
        return;
      }

      let userInfo = data.data;
      if (userInfo?.id) {
        try {
          const detailRes = await handleGetUserById(userInfo.id);
          if (detailRes?.data && (detailRes.success || detailRes.errCode === 0)) {
            userInfo = {
              ...userInfo,
              ...detailRes.data,
              token: data.data.token,
              refreshToken: data.data.refreshToken,
            };
          }
        } catch (e) {
          // Giữ dữ liệu đăng nhập nếu chưa lấy được hồ sơ chi tiết.
        }
      }

      if (userInfo?.roleId !== USER_ROLE.PATIENT) {
        setErrMessage(
          "Khu vực công khai chỉ hỗ trợ đăng nhập tài khoản bệnh nhân.",
        );
        return;
      }

      dispatch(userLoginSuccess(userInfo, data.data?.token));
      resetAndClose();
      navigate("/home");
    } catch (e: any) {
      setErrMessage(
        e?.response?.data?.message ||
          e?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, email, navigate, password, resetAndClose]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleLogin();
      }
    },
    [handleLogin],
  );

  if (!isOpen) return null;

  return (
    <div className="patient-login-modal">
      <div className="patient-login-backdrop" onClick={resetAndClose} />
      <div className="patient-login-card" role="dialog" aria-modal="true">
        <button
          type="button"
          className="patient-login-close"
          onClick={resetAndClose}
        >
          <i className="fas fa-times" />
        </button>

        <div className="patient-login-header">
          <div className="patient-login-icon">
            <i className="fas fa-user-injured" />
          </div>
          <h2>Đăng nhập bệnh nhân</h2>
          <p>Chỉ tài khoản bệnh nhân được dùng ở các màn công khai.</p>
        </div>

        <div className="patient-login-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập email bệnh nhân"
          />

          <label>Mật khẩu</label>
          <div className="patient-password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
            >
              <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
            </button>
          </div>

          {errMessage && <div className="patient-login-error">{errMessage}</div>}

          <button
            type="button"
            className="patient-login-submit"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientLoginModal;
