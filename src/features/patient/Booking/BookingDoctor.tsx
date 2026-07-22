import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useIntl, FormattedMessage } from "react-intl";
import "./BookingDoctor.scss";
import {
  LANGUAGES,
  USER_ROLE,
  getApiErrorMessage,
  toImageCssUrl,
} from "utils";
import moment from "moment";
import { NumericFormat } from "react-number-format";
import HomeHeader from "layout/HomeHeader";
import DatePicker from "components/Input/DatePicker";
import { toast } from "react-toastify";
import { IRootState } from "../../../types";
import {
  useBookAppointmentMutation,
  useGetDoctorByIdQuery,
  useGetPatientProfilesQuery,
  useGetUserByIdQuery,
} from "../../../store/api/publicApi";
import type { PatientProfileRecord } from "../../../store/api/publicApi";

const toIsoCalendarDate = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  if (value instanceof Date) {
    const parsedDate = moment(value);
    return parsedDate.isValid() ? parsedDate.format("YYYY-MM-DD") : undefined;
  }
  if (moment.isMoment(value)) {
    return value.isValid() ? value.format("YYYY-MM-DD") : undefined;
  }
  const text = String(value);
  const parsed = /^\d+$/.test(text)
    ? moment(Number(text))
    : moment(text, "YYYY-MM-DD", true);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : undefined;
};

const BookingDoctor = () => {
  const [bookAppointment, { isLoading: isBooking }] =
    useBookAppointmentMutation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const intl = useIntl();
  const language = useSelector((state: IRootState) => state.app.language);
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const roleId = userInfo?.roleId || userInfo?.roleData?.keyMap;
  const userId = Number(userInfo?.id || userInfo?.userId || 0);
  const isPatientAccount =
    isLoggedIn && roleId === USER_ROLE.PATIENT && userId > 0;
  const { data: userResponse } = useGetUserByIdQuery(userId, {
    skip: !isPatientAccount,
  });
  const profileUser = useMemo(
    () =>
      userResponse?.errCode === 0 && userResponse.data
        ? { ...userInfo, ...userResponse.data }
        : userInfo,
    [userInfo, userResponse],
  );
  const { data: patientProfilesResponse } = useGetPatientProfilesQuery(userId, {
    skip: !isPatientAccount,
  });
  const patientProfiles = useMemo<PatientProfileRecord[]>(
    () =>
      patientProfilesResponse?.errCode === 0 &&
      Array.isArray(patientProfilesResponse.data)
        ? patientProfilesResponse.data
        : [],
    [patientProfilesResponse],
  );

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState<any>("");
  const [address, setAddress] = useState("");
  const [reason, setReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // State cho tính năng đặt hộ
  const [isForOther, setIsForOther] = useState(false);
  const [profileLastName, setProfileLastName] = useState("");
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profilePhoneNumber, setProfilePhoneNumber] = useState("");
  const [profileDateOfBirth, setProfileDateOfBirth] = useState<any>("");
  const [profileAddress, setProfileAddress] = useState("");
  const [relationship, setRelationship] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("new");

  const routeState = location.state as {
    dataTime?: any;
    bookingDraft?: any;
    bookingKind?: string;
  } | null;
  const timeBooking = useMemo(() => routeState?.dataTime || {}, [routeState]);
  const { data: doctorResponse } = useGetDoctorByIdQuery(id || "", { skip: !id });
  const detailDoctor = doctorResponse?.errCode === 0 && doctorResponse.data
    ? doctorResponse.data
    : {};
  const doctorInfo = detailDoctor?.DoctorInfo || {};
  const doctorId = id || "";
  const timeType = timeBooking?.timeType || "";

  useEffect(() => {
    if (!isPatientAccount || !profileUser) return;
    setEmail(profileUser.email || "");
    if (isForOther) return;

    setLastName((current) => current || profileUser.lastName || "");
    setFirstName((current) => current || profileUser.firstName || "");
    setGender((current) => current || profileUser.gender || "");
    setPhoneNumber((current) => current || profileUser.phoneNumber || "");
    setAddress((current) => current || profileUser.address || "");
    const profileBirthday = toIsoCalendarDate(profileUser.dateOfBirth);
    if (profileBirthday) {
      setBirthday((current: any) =>
        current || moment(profileBirthday, "YYYY-MM-DD").toDate(),
      );
    }
  }, [isPatientAccount, profileUser, isForOther]);

  useEffect(() => {
    const draft = routeState?.bookingKind === "doctor"
      ? routeState.bookingDraft
      : null;
    if (!draft) return;
    setLastName(draft.lastName || "");
    setFirstName(draft.firstName || "");
    setGender(draft.gender || "");
    setPhoneNumber(draft.phoneNumber || "");
    setEmail(userInfo?.email || draft.email || "");
    const draftBirthday = toIsoCalendarDate(draft.birthday);
    setBirthday(draftBirthday ? moment(draftBirthday, "YYYY-MM-DD").toDate() : "");
    setAddress(draft.address || "");
    setReason(draft.reason || "");
    setIsForOther(Boolean(draft.isForOther));
    setProfileLastName(draft.profileLastName || "");
    setProfileFirstName(draft.profileFirstName || "");
    setProfileGender(draft.profileGender || "");
    setProfilePhoneNumber(draft.profilePhoneNumber || "");
    setProfileDateOfBirth(
      draft.profileDateOfBirth ? new Date(draft.profileDateOfBirth) : "",
    );
    setProfileAddress(draft.profileAddress || "");
    setRelationship(draft.relationship || "");
    setMedicalHistory(draft.medicalHistory || "");
  }, [routeState?.bookingDraft, routeState?.bookingKind, userInfo?.email]);

  const renderTimeBooking = useCallback(
    (tb: any) => {
      if (tb && tb.timeTypeData) {
        let time =
          language === LANGUAGES.VI
            ? tb.timeTypeData.valueVi
            : tb.timeTypeData.valueEn;
        let dateResult = "";
        if (tb.date) {
          let startTime = moment(toIsoCalendarDate(tb.date), "YYYY-MM-DD", true);
          let dateFormatted = startTime.format("DD/MM/YYYY");
          if (language === LANGUAGES.VI) {
            let dayNumber = startTime.day();
            let days = [
              "Chủ Nhật",
              "Thứ 2",
              "Thứ 3",
              "Thứ 4",
              "Thứ 5",
              "Thứ 6",
              "Thứ 7",
            ];
            let dayName = days[dayNumber];
            dateResult = `${dayName} - ${dateFormatted}`;
          } else {
            let dayNameEn = startTime.locale("en").format("dddd");
            dateResult = `${dayNameEn} - ${dateFormatted}`;
          }
        }
        let bookingTime = `${time} - ${dateResult}`;
        return bookingTime;
      }
      return "";
    },
    [language],
  );

  const getDoctorImage = useCallback((doctor: any) => {
    return toImageCssUrl(doctor?.image, "image/png") || "none";
  }, []);

  const buildDoctorName = useCallback(
    (doctor: any) => {
      if (doctor && doctor.positionData) {
        let nameVi = `${doctor.positionData.valueVi}, ${
          doctor.roleData?.valueVi || ""
        } ${doctor.lastName} ${doctor.firstName}`;
        let nameEn = `${doctor.positionData.valueEn}, ${
          doctor.roleData?.valueEn || ""
        } ${doctor.firstName} ${doctor.lastName}`;
        return language === LANGUAGES.VI ? nameVi : nameEn;
      }
      return "";
    },
    [language],
  );

  const handleOnChangeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
      let value = event.target.value;
      switch (field) {
        case "lastName":
          setLastName(value);
          break;
        case "firstName":
          setFirstName(value);
          break;
        case "gender":
          setGender(value);
          break;
        case "phoneNumber":
          setPhoneNumber(value);
          break;
        case "email":
          setEmail(value);
          break;
        case "address":
          setAddress(value);
          break;
        case "reason":
          setReason(value);
          break;
        default:
          break;
      }
    },
    [],
  );

  const handleChangeDatePicker = useCallback((date: any) => {
    setBirthday(date[0]);
  }, []);

  const clearOtherPatientForm = useCallback(() => {
    setProfileLastName("");
    setProfileFirstName("");
    setProfileGender("");
    setProfilePhoneNumber("");
    setProfileDateOfBirth("");
    setProfileAddress("");
    setRelationship("");
    setMedicalHistory("");
  }, []);

  const handleForOtherChange = useCallback(
    (checked: boolean) => {
      setIsForOther(checked);
      if (checked) {
        setSelectedProfileId("new");
        clearOtherPatientForm();
      }
    },
    [clearOtherPatientForm],
  );

  const handleProfileSelection = useCallback(
    (profileId: string) => {
      setSelectedProfileId(profileId);
      clearOtherPatientForm();
      if (profileId === "new") return;

      const selected = patientProfiles.find(
        (profile) => String(profile.id) === profileId,
      );
      if (!selected) return;
      setProfileLastName(selected.lastName || "");
      setProfileFirstName(selected.firstName || "");
      setProfileGender(selected.gender || "");
      setProfilePhoneNumber(selected.phoneNumber || "");
      setProfileDateOfBirth(
        selected.dateOfBirth
          ? moment(selected.dateOfBirth, "YYYY-MM-DD").toDate()
          : "",
      );
      setProfileAddress(selected.address || "");
      setRelationship(selected.relationship || "");
      setMedicalHistory(selected.medicalHistory || "");
    },
    [clearOtherPatientForm, patientProfiles],
  );

  const handleConfirmBooking = useCallback(async () => {
    const timeString = renderTimeBooking(timeBooking);
    const doctorNameStr = buildDoctorName(detailDoctor);
    const appointmentDate = toIsoCalendarDate(timeBooking?.date);
    const birthdayVal = toIsoCalendarDate(birthday);
    const fullName = `${lastName || ""} ${firstName || ""}`.trim();

    if (!appointmentDate) {
      toast.error("Ngày khám không hợp lệ. Vui lòng chọn lại khung giờ.");
      return;
    }

    if (!isLoggedIn) {
      const returnTo = `/booking-doctor/${doctorId}`;
      navigate("/patient/auth?mode=login", {
        state: { returnTo },
      });
      return;
    }

    if (roleId !== USER_ROLE.PATIENT) {
      toast.error("Vui lòng sử dụng tài khoản bệnh nhân để đặt lịch.");
      return;
    }

    if (!isForOther) {
      if (
        !lastName.trim() ||
        !firstName.trim() ||
        !gender ||
        !phoneNumber.trim() ||
        !birthdayVal ||
        !address.trim()
      ) {
        toast.error("Vui lòng điền đầy đủ thông tin người khám.");
        return;
      }
    } else if (
      selectedProfileId === "new" &&
      (!profileLastName.trim() ||
        !profileFirstName.trim() ||
        !profileGender ||
        !profilePhoneNumber.trim() ||
        !toIsoCalendarDate(profileDateOfBirth) ||
        !profileAddress.trim() ||
        !relationship.trim())
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin người được đặt hộ.");
      return;
    }

    let payload: any = {
      cachePatientId: userId,
      email: userInfo?.email || email.trim().toLowerCase(),
      date: appointmentDate,
      reason: reason.trim(),
      doctorId,
      timeType,
      language,
      timeString,
      doctorName: doctorNameStr,
    };

    if (isForOther) {
      payload = {
        ...payload,
        isForOther: true,
        ...(selectedProfileId !== "new"
          ? { profileId: Number(selectedProfileId) }
          : {
              profileLastName: profileLastName.trim(),
              profileFirstName: profileFirstName.trim(),
              profileGender,
              profilePhoneNumber: profilePhoneNumber.trim(),
              profileDateOfBirth: toIsoCalendarDate(profileDateOfBirth),
              profileAddress: profileAddress.trim(),
              relationship: relationship.trim(),
              medicalHistory: medicalHistory.trim(),
            }),
      };
    } else {
      payload = {
        ...payload,
        fullName,
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        gender,
        phoneNumber: phoneNumber.trim(),
        birthday: birthdayVal,
        address: address.trim(),
      };
    }

    try {
      const res = await bookAppointment(payload).unwrap();
      if (res?.errCode !== 0) {
        toast.error(res?.errMessage || "Booking a new appointment error!");
        return;
      }
      toast.success("Đặt lịch thành công. Vui lòng kiểm tra email xác nhận.");
      navigate(`/detail-doctor/${doctorId}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể đặt lịch. Vui lòng thử lại."),
      );
    }
  }, [
    renderTimeBooking,
    buildDoctorName,
    timeBooking,
    detailDoctor,
    birthday,
    lastName,
    firstName,
    gender,
    phoneNumber,
    email,
    address,
    reason,
    doctorId,
    timeType,
    language,
    isForOther,
    profileLastName,
    profileFirstName,
    profileGender,
    profilePhoneNumber,
    profileDateOfBirth,
    profileAddress,
    relationship,
    medicalHistory,
    selectedProfileId,
    isLoggedIn,
    roleId,
    userInfo?.email,
    userId,
    navigate,
    bookAppointment,
  ]);

  return (
    <>
      <HomeHeader isShowBanner={false} />
      <div className="booking-modal-container">
        <div className="booking-container">
          <div className="booking-modal-content">
            <div className="doctor-info-section">
              <div
                className="doctor-image"
                style={{
                  backgroundImage: getDoctorImage(detailDoctor),
                }}
              ></div>
              <div className="doctor-details">
                <div className="title-booking">
                  <FormattedMessage id="booking.booking-doctor.title-booking" />
                </div>
                <div className="doctor-name">
                  <div className="up">{buildDoctorName(detailDoctor)}</div>
                </div>
                <div className="time-booking">
                  <div>
                    <i className="fas fa-calendar-alt"></i>
                    {renderTimeBooking(timeBooking)}
                  </div>
                </div>
                <div className="name-clinic">
                  <i className="fas fa-clinic-medical"></i>
                  {doctorInfo && doctorInfo.nameClinic
                    ? doctorInfo.nameClinic
                    : ""}
                </div>
                <div className="address-clinic">
                  {doctorInfo && doctorInfo.addressClinic
                    ? doctorInfo.addressClinic
                    : ""}
                </div>
              </div>
            </div>

            <div className="price-section">
              <label className="price-box">
                <div>
                  <input
                    type="radio"
                    name="priceGroup"
                    value="fixedPrice"
                    defaultChecked={true}
                  />
                  &nbsp;
                  <FormattedMessage id="booking.booking-doctor.price" />:{""}
                </div>
                <div>
                  {doctorInfo &&
                    doctorInfo.priceTypeData &&
                    language === LANGUAGES.VI && (
                      <NumericFormat
                        className="currency"
                        value={doctorInfo.priceTypeData.valueVi}
                        thousandsGroupStyle="thousand"
                        thousandSeparator=","
                        suffix="đ"
                        displayType="text"
                      />
                    )}
                  {doctorInfo &&
                    doctorInfo.priceTypeData &&
                    language === LANGUAGES.EN && (
                      <NumericFormat
                        className="currency"
                        value={doctorInfo.priceTypeData.valueEn}
                        thousandsGroupStyle="thousand"
                        thousandSeparator=","
                        suffix="$"
                        displayType="text"
                      />
                    )}
                </div>
              </label>
            </div>

            <div className="booking-modal-body">
              <div className="row">
                {/* Các trường thông tin cá nhân — ẩn khi chọn đặt hộ */}
                {!isForOther && (
                  <>
                    <div className="col-12 col-md-6 form-group">
                      <div className="input-icon-group">
                        <i className="fas fa-user"></i>
                        <input
                          className="form-control"
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "booking.booking-doctor.last-name",
                          })}
                          value={lastName}
                          onChange={(event) =>
                            handleOnChangeInput(event, "lastName")
                          }
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6 form-group">
                      <div className="input-icon-group">
                        <i className="fas fa-user"></i>
                        <input
                          className="form-control"
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "booking.booking-doctor.first-name",
                          })}
                          value={firstName}
                          onChange={(event) =>
                            handleOnChangeInput(event, "firstName")
                          }
                        />
                      </div>
                    </div>

                    <div className="col-12 form-group">
                      <div className="gender-options">
                        <label>
                          <input
                            type="radio"
                            name="gender"
                            value="M"
                            checked={gender === "M"}
                            onChange={(event) =>
                              handleOnChangeInput(event, "gender")
                            }
                          />{" "}
                          <FormattedMessage id="booking.booking-doctor.male" />
                        </label>
                        <label style={{ marginLeft: "20px" }}>
                          <input
                            type="radio"
                            name="gender"
                            value="F"
                            checked={gender === "F"}
                            onChange={(event) =>
                              handleOnChangeInput(event, "gender")
                            }
                          />{" "}
                          <FormattedMessage id="booking.booking-doctor.female" />
                        </label>
                      </div>
                    </div>

                    <div className="col-12 form-group">
                      <div className="input-icon-group">
                        <i className="fas fa-phone"></i>
                        <input
                          className="form-control"
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "booking.booking-doctor.phone-number",
                          })}
                          value={phoneNumber}
                          onChange={(event) =>
                            handleOnChangeInput(event, "phoneNumber")
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email luôn hiển thị — dùng để xác minh tài khoản đặt lịch */}
                <div className="col-12 form-group">
                  {isForOther && (
                    <small className="text-muted d-block mb-1">
                      <i className="fas fa-info-circle mr-1"></i>
                      Email tài khoản của người đặt hộ (dùng để nhận xác nhận)
                    </small>
                  )}
                  <div className="input-icon-group">
                    <i className="fas fa-envelope"></i>
                    <input
                      className="form-control"
                      type="email"
                      placeholder={intl.formatMessage({
                        id: "booking.booking-doctor.email",
                      })}
                      value={email}
                      readOnly={isLoggedIn && roleId === USER_ROLE.PATIENT}
                      onChange={(event) => handleOnChangeInput(event, "email")}
                    />
                  </div>
                  {isLoggedIn && roleId === USER_ROLE.PATIENT && (
                    <small className="text-muted d-block mt-1">
                      Email được lấy từ tài khoản bệnh nhân đang đăng nhập.
                    </small>
                  )}
                </div>

                {/* Ngày sinh và địa chỉ — ẩn khi đặt hộ (dùng form riêng bên dưới) */}
                {!isForOther && (
                  <>
                    <div className="col-12 form-group">
                      <div className="input-icon-group">
                        <i className="fas fa-calendar-alt"></i>
                        <DatePicker
                          className="form-control"
                          value={birthday}
                          onChange={handleChangeDatePicker}
                          placeholder={intl.formatMessage({
                            id: "booking.booking-doctor.birthday",
                          })}
                        />
                      </div>
                    </div>

                    <div className="col-12 form-group">
                      <div className="input-icon-group">
                        <i className="fas fa-map-marker-alt"></i>
                        <input
                          className="form-control"
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "booking.booking-doctor.address",
                          })}
                          value={address}
                          onChange={(event) =>
                            handleOnChangeInput(event, "address")
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="col-12 form-group">
                  <div className="input-icon-group">
                    <i className="fas fa-plus-circle"></i>
                    <input
                      className="form-control"
                      type="text"
                      placeholder={intl.formatMessage({
                        id: "booking.booking-doctor.reason",
                      })}
                      value={reason}
                      onChange={(event) => handleOnChangeInput(event, "reason")}
                    />
                  </div>
                </div>

                {/* ===== ĐẶT HỘ CHO NGƯỜI KHÁC ===== */}
                <div className="col-12 form-group">
                  <label className="for-other-checkbox">
                    <input
                      type="checkbox"
                      checked={isForOther}
                      onChange={(e) => handleForOtherChange(e.target.checked)}
                      style={{ marginRight: "8px" }}
                    />
                    <strong>Đặt cho người khác</strong>
                  </label>
                </div>

                {isForOther && (
                  <>
                    <div className="col-12">
                      <div className="for-other-section">
                        <div className="for-other-title">
                          <i className="fas fa-user-friends mr-2"></i>
                          Thông tin bệnh nhân được đặt hộ
                        </div>
                        <div className="row">
                          <div className="col-12 form-group">
                            <label htmlFor="patient-profile-choice">
                              Chọn hồ sơ người thân đã lưu (không bắt buộc)
                            </label>
                            <select
                              id="patient-profile-choice"
                              className="form-control"
                              value={selectedProfileId}
                              onChange={(event) =>
                                handleProfileSelection(event.target.value)
                              }
                            >
                              <option value="new">Nhập thông tin mới</option>
                              {patientProfiles.map((profile) => (
                                <option key={profile.id} value={profile.id}>
                                  {`${profile.lastName || ""} ${profile.firstName || ""}`.trim() ||
                                    `Hồ sơ #${profile.id}`}
                                  {profile.relationship
                                    ? ` – ${profile.relationship}`
                                    : ""}
                                </option>
                              ))}
                            </select>
                            <small className="text-muted d-block mt-1">
                              Khi vừa bật “Đặt cho người khác”, form luôn trống.
                              Chỉ điền sẵn sau khi bạn chủ động chọn một hồ sơ.
                            </small>
                          </div>
                          <div className="col-12 col-md-6 form-group">
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Họ bệnh nhân"
                              value={profileLastName}
                              disabled={selectedProfileId !== "new"}
                              onChange={(e) =>
                                setProfileLastName(e.target.value)
                              }
                            />
                          </div>
                          <div className="col-12 col-md-6 form-group">
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Tên bệnh nhân"
                              value={profileFirstName}
                              disabled={selectedProfileId !== "new"}
                              onChange={(e) =>
                                setProfileFirstName(e.target.value)
                              }
                            />
                          </div>
                          <div className="col-12 form-group">
                            <div className="gender-options">
                              <label>
                                <input
                                  type="radio"
                                  name="profileGender"
                                  value="M"
                                  checked={profileGender === "M"}
                                  disabled={selectedProfileId !== "new"}
                                  onChange={() => setProfileGender("M")}
                                />{" "}
                                Nam
                              </label>
                              <label style={{ marginLeft: "20px" }}>
                                <input
                                  type="radio"
                                  name="profileGender"
                                  value="F"
                                  checked={profileGender === "F"}
                                  disabled={selectedProfileId !== "new"}
                                  onChange={() => setProfileGender("F")}
                                />{" "}
                                Nữ
                              </label>
                            </div>
                          </div>
                          <div className="col-12 form-group">
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Số điện thoại bệnh nhân"
                              value={profilePhoneNumber}
                              disabled={selectedProfileId !== "new"}
                              onChange={(e) =>
                                setProfilePhoneNumber(e.target.value)
                              }
                            />
                          </div>
                          <div className="col-12 form-group">
                            <DatePicker
                              className="form-control"
                              value={profileDateOfBirth}
                              disabled={selectedProfileId !== "new"}
                              onChange={(date: any) =>
                                setProfileDateOfBirth(date[0])
                              }
                              placeholder="Ngày sinh bệnh nhân"
                            />
                          </div>
                          <div className="col-12 form-group">
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Địa chỉ bệnh nhân"
                              value={profileAddress}
                              disabled={selectedProfileId !== "new"}
                              onChange={(e) =>
                                setProfileAddress(e.target.value)
                              }
                            />
                          </div>
                          <div className="col-12 form-group">
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Mối quan hệ (cha, mẹ, con, vợ, chồng...)"
                              value={relationship}
                              disabled={selectedProfileId !== "new"}
                              onChange={(e) => setRelationship(e.target.value)}
                            />
                          </div>
                          <div className="col-12 form-group">
                            <textarea
                              className="form-control"
                              rows={3}
                              placeholder="Tiền sử bệnh (nếu có)"
                              value={medicalHistory}
                              disabled={selectedProfileId !== "new"}
                              onChange={(e) =>
                                setMedicalHistory(e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {/* ===== KẾT THÚC ĐẶT HỘ ===== */}

                <div className="col-12">
                  <label className="payment">
                    <FormattedMessage id="booking.booking-doctor.payment-method" />
                  </label>
                  <div className="payment-options">
                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        readOnly
                      />{" "}
                      &nbsp;
                      <FormattedMessage id="booking.booking-doctor.payment-attention" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="more-info">
              <div className="tag-price">
                <span className="left">
                  <FormattedMessage id="booking.booking-doctor.price" />
                </span>
                <span className="right">
                  {" "}
                  <div>
                    {doctorInfo &&
                      doctorInfo.priceTypeData &&
                      language === LANGUAGES.VI && (
                        <NumericFormat
                          className="currency"
                          value={doctorInfo.priceTypeData.valueVi}
                          thousandsGroupStyle="thousand"
                          thousandSeparator=","
                          suffix="đ"
                          displayType="text"
                        />
                      )}
                    {doctorInfo &&
                      doctorInfo.priceTypeData &&
                      language === LANGUAGES.EN && (
                        <NumericFormat
                          className="currency"
                          value={doctorInfo.priceTypeData.valueEn}
                          thousandsGroupStyle="thousand"
                          thousandSeparator=","
                          suffix="$"
                          displayType="text"
                        />
                      )}
                  </div>
                </span>
              </div>
              <div className="tag-price">
                <span className="left">
                  <FormattedMessage id="booking.booking-doctor.booking-fee" />
                </span>
                <span className="right">
                  <FormattedMessage id="booking.booking-doctor.free" />
                </span>
              </div>
              <div className="tag-price">
                <span className="left">
                  <FormattedMessage id="booking.booking-doctor.total" />
                </span>
                <span className="right text-danger">
                  {" "}
                  <div>
                    {doctorInfo &&
                      doctorInfo.priceTypeData &&
                      language === LANGUAGES.VI && (
                        <NumericFormat
                          className="currency"
                          value={doctorInfo.priceTypeData.valueVi}
                          thousandsGroupStyle="thousand"
                          thousandSeparator=","
                          suffix="đ"
                          displayType="text"
                        />
                      )}
                    {doctorInfo &&
                      doctorInfo.priceTypeData &&
                      language === LANGUAGES.EN && (
                        <NumericFormat
                          className="currency"
                          value={doctorInfo.priceTypeData.valueEn}
                          thousandsGroupStyle="thousand"
                          thousandSeparator=","
                          suffix="$"
                          displayType="text"
                        />
                      )}
                  </div>
                </span>
              </div>
            </div>
            <div className="note-booking">
              <div className="note-title">
                <FormattedMessage id="booking.booking-doctor.note" />
              </div>

              <div className="note-table">
                <span className="note">
                  <FormattedMessage id="booking.booking-doctor.attention" />
                </span>
                <p className="note-desc">
                  <FormattedMessage id="booking.booking-doctor.note-info" />
                </p>
                <ul className="note-list">
                  <li>
                    <FormattedMessage id="booking.booking-doctor.info-1" />
                  </li>
                  <li>
                    <FormattedMessage id="booking.booking-doctor.info-2" />
                  </li>
                </ul>
              </div>
            </div>

            <div className="booking-modal-footer">
              <button
                className="btn-booking-confirm col-12"
                onClick={handleConfirmBooking}
                disabled={isBooking}
              >
                <FormattedMessage id="booking.booking-doctor.confirm-booking" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};;

export default BookingDoctor;
