import React, { FormEvent, useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import HomeHeader from "layout/HomeHeader";
import HomeFooter from "layout/HomeFooter";
import {
  handleGetUserById,
  handlePatientLoginApi,
  handlePatientRegisterApi,
} from "services/userService";
import { userLoginSuccess } from "store/actions/userActions";
import { USER_ROLE } from "utils";
import {
  clearPendingPatientAuthFlow,
  getPendingPatientAuthFlow,
} from "./patientAuthFlow";
import "./PatientAuth.scss";

type AuthMode = "login" | "register";

const PatientAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const pendingFlow = useMemo(() => getPendingPatientAuthFlow(), []);
  const locationState = location.state as
    | { email?: string; returnTo?: string }
    | null;
  const initialEmail = pendingFlow?.email || locationState?.email || "";
  const mode: AuthMode = searchParams.get("mode") === "register"
    ? "register"
    : "login";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = useCallback(
    (nextMode: AuthMode) => {
      setError("");
      setPassword("");
      setConfirmPassword("");
      setSearchParams({ mode: nextMode });
    },
    [setSearchParams],
  );

  const finishAuthentication = useCallback(
    async (response: any) => {
      if (!response || (!response.success && response.errCode !== 0) || !response.data) {
        throw new Error(response?.message || response?.errMessage || "Xác thực thất bại.");
      }

      let userInfo = response.data;
      if (userInfo.roleId !== USER_ROLE.PATIENT) {
        throw new Error("Màn hình này chỉ dành cho tài khoản bệnh nhân.");
      }

      if (userInfo.id) {
        try {
          const detail = await handleGetUserById(userInfo.id);
          if (detail?.data && (detail.success || detail.errCode === 0)) {
            userInfo = {
              ...userInfo,
              ...detail.data,
              token: response.data.token,
              refreshToken: response.data.refreshToken,
              roleId: USER_ROLE.PATIENT,
            };
          }
        } catch (_) {
          // Auth response already contains the fields required to continue.
        }
      }

      dispatch(userLoginSuccess(userInfo, response.data.token));

      if (pendingFlow) {
        clearPendingPatientAuthFlow();
        navigate(pendingFlow.returnTo, {
          replace: true,
          state: {
            ...(pendingFlow.routeState || {}),
            bookingDraft: pendingFlow.bookingDraft,
            bookingKind: pendingFlow.bookingKind,
            authenticatedEmail: userInfo.email,
          },
        });
        return;
      }

      navigate(locationState?.returnTo || "/home", { replace: true });
    },
    [dispatch, locationState?.returnTo, navigate, pendingFlow],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Email không đúng định dạng.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (mode === "register" && !firstName.trim()) {
      setError("Vui lòng nhập tên bệnh nhân.");
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const response = mode === "login"
        ? await handlePatientLoginApi(normalizedEmail, password)
        : await handlePatientRegisterApi({
            email: normalizedEmail,
            password,
            firstName: firstName.trim(),
            lastName: lastName.trim() || undefined,
            phoneNumber: phoneNumber.trim() || undefined,
            address: address.trim() || undefined,
          });
      await finishAuthentication(response);
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.errMessage ||
          requestError?.response?.data?.message ||
          requestError?.message ||
          "Không thể xác thực. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="patient-auth-page">
      <HomeHeader isShowBanner={false} />
      <main className="patient-auth-main">
        <section className="patient-auth-intro">
          <span className="patient-auth-eyebrow">Tài khoản bệnh nhân MediBook</span>
          <h1>Đặt lịch và quản lý hành trình khám bệnh của bạn</h1>
          <p>
            Đăng nhập hoặc tạo tài khoản để lịch khám được liên kết đúng với
            hồ sơ bệnh nhân và được bảo vệ bằng phiên đăng nhập riêng.
          </p>
          <ul>
            <li><i className="fas fa-check-circle" /> Theo dõi lịch hẹn tập trung</li>
            <li><i className="fas fa-check-circle" /> Đặt lịch cho người thân</li>
            <li><i className="fas fa-check-circle" /> Xem lại lịch sử khám bệnh</li>
          </ul>
        </section>

        <section className="patient-auth-card">
          <div className="patient-auth-tabs" role="tablist">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => switchMode("register")}
            >
              Đăng ký
            </button>
          </div>

          <div className="patient-auth-heading">
            <h2>{mode === "login" ? "Chào mừng bạn quay lại" : "Tạo tài khoản bệnh nhân"}</h2>
            <p>
              {pendingFlow
                ? "Email từ form đặt lịch đã được giữ lại cho bạn."
                : "Sử dụng email cá nhân để quản lý các lịch khám."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="patient-auth-grid">
                <label>
                  <span>Họ</span>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </label>
                <label>
                  <span>Tên <strong>*</strong></span>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </label>
              </div>
            )}

            <label>
              <span>Email <strong>*</strong></span>
              <input
                type="email"
                value={email}
                readOnly={mode === "register" && Boolean(pendingFlow?.email)}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {mode === "register" && pendingFlow?.email && (
                <small>Email này được lấy từ form đặt lịch trước đó.</small>
              )}
            </label>

            {mode === "register" && (
              <>
                <label>
                  <span>Số điện thoại</span>
                  <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </label>
                <label>
                  <span>Địa chỉ</span>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} />
                </label>
              </>
            )}

            <label>
              <span>Mật khẩu <strong>*</strong></span>
              <div className="patient-auth-password">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)}>
                  <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
                </button>
              </div>
            </label>

            {mode === "register" && (
              <label>
                <span>Xác nhận mật khẩu <strong>*</strong></span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>
            )}

            {error && <div className="patient-auth-error" role="alert">{error}</div>}

            <button className="patient-auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Đang xử lý..."
                : mode === "login"
                  ? "Đăng nhập tài khoản bệnh nhân"
                  : "Đăng ký và tiếp tục đặt lịch"}
            </button>
          </form>

          <Link className="patient-auth-back" to="/home">Quay lại trang chủ</Link>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
};

export default PatientAuth;
