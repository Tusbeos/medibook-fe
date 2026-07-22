import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import HomeHeader from "layout/HomeHeader";
import HomeFooter from "layout/HomeFooter";
import {
  handleGetUserById,
  handleLogoutApi,
  handlePatientLoginApi,
  handlePatientRegisterApi,
} from "services/userService";
import { processLogout, userLoginSuccess } from "store/actions/userActions";
import { USER_ROLE } from "utils";
import type { IRootState } from "types";
import { getRoleHomePath } from "hoc/authentication";
import {
  clearPendingPatientAuthFlow,
  getPendingPatientAuthFlow,
  savePendingPatientAuthFlow,
} from "./patientAuthFlow";
import type { PendingPatientAuthFlow } from "./patientAuthFlow";
import "./PatientAuth.scss";

type AuthMode = "login" | "register";

type PatientAuthLocationState = {
  email?: string;
  returnTo?: string;
  pendingFlow?: PendingPatientAuthFlow;
};

const getRoleLabel = (roleId?: string) => {
  if (roleId === USER_ROLE.ADMIN) return "Quản trị viên";
  if (roleId === USER_ROLE.DOCTOR) return "Bác sĩ";
  if (roleId === USER_ROLE.CLINIC_MANAGER) return "Quản lý phòng khám";
  if (roleId === USER_ROLE.WRITER) return "Người viết bài";
  return "Tài khoản hệ thống";
};

const PatientAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const locationState = location.state as PatientAuthLocationState | null;
  const [pendingFlow, setPendingFlow] = useState<PendingPatientAuthFlow | null>(
    () => getPendingPatientAuthFlow(),
  );
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const currentUser = useSelector((state: IRootState) => state.user.userInfo);
  const currentRoleId =
    currentUser?.roleId || (currentUser as any)?.roleData?.keyMap;
  const isSystemAccount =
    isLoggedIn && currentRoleId !== USER_ROLE.PATIENT;
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
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

  useEffect(() => {
    const incomingFlow = locationState?.pendingFlow;
    if (!incomingFlow?.returnTo) return;

    const storedFlow = getPendingPatientAuthFlow();
    const isSameFlow =
      storedFlow?.returnTo === incomingFlow.returnTo &&
      storedFlow?.bookingKind === incomingFlow.bookingKind;
    const nextFlow: PendingPatientAuthFlow = {
      ...(isSameFlow ? storedFlow : {}),
      ...incomingFlow,
      returnTo: incomingFlow.returnTo,
      routeState: {
        ...(isSameFlow ? storedFlow?.routeState || {} : {}),
        ...(incomingFlow.routeState || {}),
      },
    };
    savePendingPatientAuthFlow(nextFlow);
    setPendingFlow(nextFlow);
    setEmail((current) => current || nextFlow.email || "");
  }, [locationState?.pendingFlow]);

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
        if (response.data.refreshToken) {
          try {
            await handleLogoutApi(response.data.refreshToken);
          } catch (_) {
            // The rejected role is never persisted locally even if revoke fails.
          }
        }
        throw new Error(
          `Đây là tài khoản ${getRoleLabel(userInfo.roleId).toLowerCase()}. ` +
            "Vui lòng sử dụng tài khoản bệnh nhân để tiếp tục đặt lịch.",
        );
      }

      // Make the freshly issued access token available before requesting the
      // protected user detail endpoint. Without this first synchronous Redux
      // update, every successful patient login produced an avoidable 401 and
      // silently fell back to the smaller auth response.
      dispatch(userLoginSuccess(userInfo, response.data.token));

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
            ...(pendingFlow.bookingDraft
              ? { bookingDraft: pendingFlow.bookingDraft }
              : {}),
            ...(pendingFlow.bookingKind
              ? { bookingKind: pendingFlow.bookingKind }
              : {}),
            authenticatedEmail: userInfo.email,
          },
        });
        return;
      }

      navigate(locationState?.returnTo || "/home", { replace: true });
    },
    [dispatch, locationState?.returnTo, navigate, pendingFlow],
  );

  const handleConfirmAccountSwitch = useCallback(async () => {
    if (isSwitchingAccount) return;

    setError("");
    setIsSwitchingAccount(true);
    let revokeFailed = false;
    try {
      const refreshToken = (currentUser as any)?.refreshToken;
      if (refreshToken) {
        await handleLogoutApi(refreshToken);
      }
    } catch (_) {
      revokeFailed = true;
    } finally {
      dispatch(processLogout());
      setSearchParams({ mode: "login" }, { replace: true });
      setIsSwitchingAccount(false);
      if (revokeFailed) {
        setError(
          "Đã xóa phiên trên trình duyệt nhưng máy chủ chưa xác nhận thu hồi phiên cũ. " +
            "Bạn vẫn có thể đăng nhập tài khoản bệnh nhân.",
        );
      }
    }
  }, [currentUser, dispatch, isSwitchingAccount, setSearchParams]);

  const handleReturnToWorkspace = useCallback(() => {
    clearPendingPatientAuthFlow();
    setPendingFlow(null);
    navigate(getRoleHomePath(currentRoleId), { replace: true });
  }, [currentRoleId, navigate]);

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
          {isSystemAccount ? (
            <div className="patient-account-switch" role="alert">
              <span className="patient-account-switch-icon" aria-hidden="true">
                <i className="fas fa-user-shield" />
              </span>
              <span className="patient-account-switch-eyebrow">
                Cần chuyển tài khoản
              </span>
              <h2>Bạn đang đăng nhập bằng tài khoản hệ thống</h2>
              <p>
                Chức năng đặt lịch chỉ dành cho tài khoản bệnh nhân. MediBook
                sẽ giữ lại bác sĩ, gói khám, ngày và giờ bạn đã chọn trong phiên
                trình duyệt này.
              </p>
              <div className="patient-account-current">
                <span>Phiên đang sử dụng</span>
                <strong>{getRoleLabel(currentRoleId)}</strong>
                <small>{currentUser?.email || "Không có thông tin email"}</small>
              </div>
              <div className="patient-account-switch-actions">
                <button
                  type="button"
                  className="patient-account-switch-primary"
                  disabled={isSwitchingAccount}
                  onClick={handleConfirmAccountSwitch}
                >
                  {isSwitchingAccount
                    ? "Đang chuyển tài khoản..."
                    : "Đăng xuất và dùng tài khoản bệnh nhân"}
                </button>
                <button
                  type="button"
                  className="patient-account-switch-secondary"
                  disabled={isSwitchingAccount}
                  onClick={handleReturnToWorkspace}
                >
                  Quay lại trang quản lý
                </button>
              </div>
            </div>
          ) : (
            <>
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
                  {pendingFlow?.email
                    ? "Email từ form đặt lịch đã được giữ lại cho bạn."
                    : pendingFlow?.returnTo
                      ? "Lựa chọn đặt lịch trước đó đã được giữ lại cho bạn."
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
            </>
          )}
        </section>
      </main>
      <HomeFooter />
    </div>
  );
};

export default PatientAuth;
