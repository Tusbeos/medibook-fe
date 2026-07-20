import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Breadcrumb from "components/Breadcrumb";
import HomeFooter from "layout/HomeFooter";
import HomeHeader from "layout/HomeHeader";
import type { IRootState } from "types";
import { USER_ROLE, getApiErrorMessage, normalizeImageSrc } from "utils";
import {
  useCreatePackageBookingMutation,
  useGetPackageByIdQuery,
  useGetPatientProfilesQuery,
} from "store/api/publicApi";
import type { PackageBookingRecord } from "store/api/publicApi";
import "./BookingPackage.scss";
import { savePendingPatientAuthFlow } from "features/auth/patientAuthFlow";

type FormValues = {
  email: string;
  fullName: string;
  phoneNumber: string;
  gender: string;
  birthday: string;
  address: string;
  desiredDate: string;
  reason: string;
};

type FormErrors = Partial<Record<keyof FormValues | "profile", string>>;

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatPrice = (price: unknown) => {
  const value = Number(price || 0);
  return value ? `${value.toLocaleString("vi-VN")}đ` : "Liên hệ";
};

const profileName = (profile: { firstName?: string; lastName?: string }) =>
  `${profile.lastName || ""} ${profile.firstName || ""}`.trim();

const BookingPackage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const packageId = Number(id);
  const isValidPackageId = Number.isInteger(packageId) && packageId > 0;
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const language = useSelector((state: IRootState) => state.app.language);
  const roleId = userInfo?.roleId || userInfo?.roleData?.keyMap;
  const isPatientAccount = isLoggedIn && roleId === USER_ROLE.PATIENT;
  const isSystemAccount = isLoggedIn && roleId !== USER_ROLE.PATIENT;
  const userId = Number(userInfo?.id || userInfo?.userId || 0);

  const {
    data: packageResponse,
    isLoading: isPackageLoading,
    isError: isPackageError,
  } = useGetPackageByIdQuery(id || "", { skip: !isValidPackageId });
  const packageInfo = packageResponse?.errCode === 0 ? packageResponse.data : null;
  const {
    data: profilesResponse,
    isError: isProfilesError,
  } = useGetPatientProfilesQuery(userId, {
    skip: !isPatientAccount || !userId,
  });
  const profiles = useMemo(
    () =>
      profilesResponse?.errCode === 0 && Array.isArray(profilesResponse.data)
        ? profilesResponse.data
        : [],
    [profilesResponse],
  );

  const [profileChoice, setProfileChoice] = useState("self");
  const [values, setValues] = useState<FormValues>({
    email: "",
    fullName: "",
    phoneNumber: "",
    gender: "",
    birthday: "",
    address: "",
    desiredDate: "",
    reason: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [createdBooking, setCreatedBooking] =
    useState<PackageBookingRecord | null>(null);
  const [createPackageBooking, { isLoading: isSubmitting }] =
    useCreatePackageBookingMutation();

  const restoredState = location.state as {
    bookingKind?: string;
    bookingDraft?: {
      values?: FormValues;
      profileChoice?: string;
    };
  } | null;

  const today = useMemo(() => formatLocalDate(new Date()), []);
  const maxDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 365);
    return formatLocalDate(date);
  }, []);
  const selectedProfile = useMemo(
    () => profiles.find((profile) => String(profile.id) === profileChoice),
    [profileChoice, profiles],
  );

  useEffect(() => {
    if (!isPatientAccount || !userInfo) return;
    setValues((current) => ({
      ...current,
      email: userInfo.email || current.email,
      fullName:
        current.fullName ||
        `${userInfo.lastName || ""} ${userInfo.firstName || ""}`.trim(),
      phoneNumber: current.phoneNumber || userInfo.phoneNumber || "",
      gender: current.gender || userInfo.gender || "",
      address: current.address || userInfo.address || "",
    }));
  }, [isPatientAccount, userInfo]);

  useEffect(() => {
    if (restoredState?.bookingKind !== "package") return;
    const draft = restoredState.bookingDraft;
    if (!draft?.values) return;
    setValues({
      ...draft.values,
      email: userInfo?.email || draft.values.email,
    });
    setProfileChoice(draft.profileChoice || "self");
  }, [restoredState?.bookingDraft, restoredState?.bookingKind, userInfo?.email]);

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const email = values.email.trim();
    if (!email) nextErrors.email = "Vui lòng nhập email xác nhận.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Email không đúng định dạng.";
    }

    if (selectedProfile) {
      if (!profileName(selectedProfile) || !selectedProfile.phoneNumber) {
        nextErrors.profile =
          "Hồ sơ này thiếu họ tên hoặc số điện thoại. Vui lòng cập nhật hồ sơ trước.";
      }
    } else {
      if (!values.fullName.trim()) nextErrors.fullName = "Vui lòng nhập họ tên người khám.";
      if (!values.phoneNumber.trim()) {
        nextErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
      } else if (!/^[0-9+().\s-]{8,20}$/.test(values.phoneNumber.trim())) {
        nextErrors.phoneNumber = "Số điện thoại không đúng định dạng.";
      }
      if (values.birthday && values.birthday > today) {
        nextErrors.birthday = "Ngày sinh không được ở tương lai.";
      }
    }

    if (!values.desiredDate) nextErrors.desiredDate = "Vui lòng chọn ngày mong muốn.";
    else if (values.desiredDate < today || values.desiredDate > maxDate) {
      nextErrors.desiredDate = "Ngày khám phải nằm trong 365 ngày tới.";
    }
    if (values.reason.length > 5000) {
      nextErrors.reason = "Lý do khám không được vượt quá 5.000 ký tự.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting || createdBooking || !validate()) return;

    if (!isLoggedIn) {
      const normalizedEmail = values.email.trim().toLowerCase();
      const returnTo = `/booking-package/${packageId}`;
      savePendingPatientAuthFlow({
        email: normalizedEmail,
        returnTo,
        bookingKind: "package",
        bookingDraft: { values: { ...values, email: normalizedEmail }, profileChoice },
      });
      navigate("/patient/auth?mode=register", {
        state: { email: normalizedEmail, returnTo },
      });
      return;
    }

    if (!isPatientAccount) {
      setSubmitError("Vui lòng sử dụng tài khoản bệnh nhân để đặt gói khám.");
      return;
    }

    setSubmitError("");
    try {
      const response = await createPackageBooking({
        packageId,
        ...(selectedProfile ? { profileId: selectedProfile.id } : {}),
        email: userInfo?.email || values.email.trim(),
        ...(!selectedProfile
          ? {
              fullName: values.fullName.trim(),
              phoneNumber: values.phoneNumber.trim(),
              gender: values.gender || undefined,
              birthday: values.birthday || undefined,
              address: values.address.trim() || undefined,
            }
          : {}),
        desiredDate: values.desiredDate,
        reason: values.reason.trim() || undefined,
        language: language === "en" ? "en" : "vi",
      }).unwrap();
      if (response.errCode !== 0 || !response.data) {
        throw response;
      }
      setCreatedBooking(response.data);
    } catch (error: any) {
      const serverFields = error?.data?.data;
      if (serverFields && typeof serverFields === "object" && !Array.isArray(serverFields)) {
        setErrors((current) => ({ ...current, ...serverFields }));
      }
      setSubmitError(
        getApiErrorMessage(error, "Không thể gửi yêu cầu đặt gói. Vui lòng thử lại."),
      );
    }
  };

  if (isPackageLoading) {
    return (
      <div className="booking-package-page">
        <HomeHeader isShowBanner={false} />
        <div className="booking-container package-booking-state">Đang tải gói khám...</div>
      </div>
    );
  }

  if (!isValidPackageId || isPackageError || !packageInfo) {
    return (
      <div className="booking-package-page">
        <HomeHeader isShowBanner={false} />
        <div className="booking-container package-booking-state">
          <h1>Không tìm thấy gói khám</h1>
          <Link to="/package">Quay lại danh sách gói khám</Link>
        </div>
      </div>
    );
  }

  const isBookable = !packageInfo.statusId || packageInfo.statusId === "SD2";
  const clinicName = packageInfo.clinicName || packageInfo.clinicData?.name || "Phòng khám";

  return (
    <div className="booking-package-page">
      <HomeHeader isShowBanner={false} />
      <Breadcrumb
        containerClassName="booking-container"
        items={[
          { label: "Trang chủ", to: "/home" },
          { label: "Gói khám", to: "/package" },
          { label: packageInfo.name, to: `/package/detail-package/${packageId}` },
          { label: "Đặt gói" },
        ]}
      />

      <main className="booking-container package-booking-layout">
        <aside className="package-booking-summary">
          <img
            src={normalizeImageSrc(packageInfo.image) || "https://via.placeholder.com/720x420?text=Goi+kham"}
            alt={packageInfo.name}
          />
          <div className="summary-body">
            <span>Gói khám đã chọn</span>
            <h2>{packageInfo.name}</h2>
            <p><i className="fas fa-clinic-medical" /> {clinicName}</p>
            <strong>{formatPrice(packageInfo.price)}</strong>
            <Link to={`/package/detail-package/${packageId}`}>Xem lại chi tiết</Link>
          </div>
        </aside>

        <section className="package-booking-card">
          {createdBooking ? (
            <div className="package-booking-success" role="status">
              <i className="fas fa-envelope-circle-check" />
              <h1>Yêu cầu đã được gửi</h1>
              <p>
                Chúng tôi đã gửi link xác nhận đến <strong>{createdBooking.email}</strong>.
                Vui lòng xác nhận trong 30 phút để phòng khám tiếp nhận yêu cầu.
              </p>
              <dl>
                <div><dt>Mã yêu cầu</dt><dd>#{createdBooking.id}</dd></div>
                <div><dt>Người khám</dt><dd>{createdBooking.patientName}</dd></div>
                <div><dt>Ngày mong muốn</dt><dd>{createdBooking.desiredDate}</dd></div>
              </dl>
              <Link to="/package">Xem các gói khám khác</Link>
            </div>
          ) : isSystemAccount ? (
            <div className="package-booking-blocked">
              <i className="fas fa-user-lock" />
              <h1>Không thể đặt bằng tài khoản hệ thống</h1>
              <p>Vui lòng đăng xuất và đặt với tư cách khách, hoặc dùng tài khoản bệnh nhân.</p>
              <Link to={`/package/detail-package/${packageId}`}>Quay lại gói khám</Link>
            </div>
          ) : !isBookable ? (
            <div className="package-booking-blocked">
              <i className="fas fa-calendar-xmark" />
              <h1>Gói khám chưa nhận đặt lịch</h1>
              <p>Gói khám này đang tạm ngừng tiếp nhận yêu cầu mới.</p>
              <Link to="/package">Chọn gói khám khác</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-heading">
                <span>Thông tin yêu cầu</span>
                <h1>Đặt gói khám</h1>
                <p>Phòng khám sẽ liên hệ sau khi bạn xác nhận email.</p>
              </div>

              {submitError && <div className="form-alert" role="alert">{submitError}</div>}

              {isPatientAccount && (
                <div className="form-group full-width">
                  <label htmlFor="package-profile">Người đi khám</label>
                  <select
                    id="package-profile"
                    value={profileChoice}
                    onChange={(event) => {
                      setProfileChoice(event.target.value);
                      setErrors((current) => ({ ...current, profile: undefined }));
                    }}
                  >
                    <option value="self">Bản thân tôi</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profileName(profile) || `Hồ sơ #${profile.id}`}
                        {profile.relationship ? ` (${profile.relationship})` : ""}
                      </option>
                    ))}
                  </select>
                  {isProfilesError && (
                    <small className="field-hint error">Không tải được hồ sơ người thân; bạn vẫn có thể đặt cho bản thân.</small>
                  )}
                  {errors.profile && <small className="field-error">{errors.profile}</small>}
                </div>
              )}

              {selectedProfile && (
                <div className="selected-profile full-width">
                  <strong>{profileName(selectedProfile) || "Hồ sơ chưa có tên"}</strong>
                  <span>{selectedProfile.phoneNumber || "Chưa có số điện thoại"}</span>
                  {selectedProfile.dateOfBirth && <span>Ngày sinh: {selectedProfile.dateOfBirth}</span>}
                  {selectedProfile.address && <span>{selectedProfile.address}</span>}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="package-email">Email nhận link xác nhận *</label>
                  <input
                    id="package-email"
                    type="email"
                    value={values.email}
                    readOnly={isPatientAccount}
                    aria-invalid={Boolean(errors.email)}
                    onChange={(event) => updateValue("email", event.target.value)}
                    placeholder="name@example.com"
                  />
                  {isPatientAccount && <small className="field-hint">Email phải trùng với tài khoản đang đăng nhập.</small>}
                  {errors.email && <small className="field-error">{errors.email}</small>}
                </div>

                {!selectedProfile && (
                  <>
                    <div className="form-group">
                      <label htmlFor="package-name">Họ và tên người khám *</label>
                      <input
                        id="package-name"
                        value={values.fullName}
                        maxLength={200}
                        aria-invalid={Boolean(errors.fullName)}
                        onChange={(event) => updateValue("fullName", event.target.value)}
                      />
                      {errors.fullName && <small className="field-error">{errors.fullName}</small>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="package-phone">Số điện thoại *</label>
                      <input
                        id="package-phone"
                        type="tel"
                        value={values.phoneNumber}
                        maxLength={30}
                        aria-invalid={Boolean(errors.phoneNumber)}
                        onChange={(event) => updateValue("phoneNumber", event.target.value)}
                      />
                      {errors.phoneNumber && <small className="field-error">{errors.phoneNumber}</small>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="package-gender">Giới tính</label>
                      <select
                        id="package-gender"
                        value={values.gender}
                        onChange={(event) => updateValue("gender", event.target.value)}
                      >
                        <option value="">Chưa chọn</option>
                        <option value="M">Nam</option>
                        <option value="F">Nữ</option>
                        <option value="O">Khác</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="package-birthday">Ngày sinh</label>
                      <input
                        id="package-birthday"
                        type="date"
                        max={today}
                        value={values.birthday}
                        aria-invalid={Boolean(errors.birthday)}
                        onChange={(event) => updateValue("birthday", event.target.value)}
                      />
                      {errors.birthday && <small className="field-error">{errors.birthday}</small>}
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="package-address">Địa chỉ</label>
                      <input
                        id="package-address"
                        value={values.address}
                        maxLength={2000}
                        onChange={(event) => updateValue("address", event.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="form-group full-width">
                  <label htmlFor="package-date">Ngày khám mong muốn *</label>
                  <input
                    id="package-date"
                    type="date"
                    min={today}
                    max={maxDate}
                    value={values.desiredDate}
                    aria-invalid={Boolean(errors.desiredDate)}
                    onChange={(event) => updateValue("desiredDate", event.target.value)}
                  />
                  <small className="field-hint">Đây là ngày mong muốn; phòng khám sẽ xác nhận lịch chính thức.</small>
                  {errors.desiredDate && <small className="field-error">{errors.desiredDate}</small>}
                </div>
                <div className="form-group full-width">
                  <label htmlFor="package-reason">Lý do khám / ghi chú</label>
                  <textarea
                    id="package-reason"
                    rows={5}
                    maxLength={5000}
                    value={values.reason}
                    aria-invalid={Boolean(errors.reason)}
                    onChange={(event) => updateValue("reason", event.target.value)}
                    placeholder="Mô tả ngắn tình trạng hoặc nhu cầu của bạn"
                  />
                  <small className="character-count">{values.reason.length}/5000</small>
                  {errors.reason && <small className="field-error">{errors.reason}</small>}
                </div>
              </div>

              <button className="package-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu và nhận email xác nhận"}
              </button>
              <p className="submit-note">Nút gửi sẽ bị khóa trong lúc xử lý để tránh tạo yêu cầu trùng.</p>
            </form>
          )}
        </section>
      </main>
      <HomeFooter />
    </div>
  );
};

export default BookingPackage;
