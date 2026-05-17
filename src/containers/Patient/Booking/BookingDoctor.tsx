import React, { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useIntl, FormattedMessage } from "react-intl";
import "./BookingDoctor.scss";
import { LANGUAGES, toImageCssUrl } from "utils";
import moment from "moment";
import { NumericFormat } from "react-number-format";
import HomeHeader from "containers/HomePage/HomeHeader";
import { postPatientBookAppointment } from "../../../services/bookingService";
import DatePicker from "../../../components/Input/DatePicker";
import { toast } from "react-toastify";
import { IRootState } from "../../../types";
import { useGetDoctorByIdQuery } from "../../../store/api/publicApi";

const BookingDoctor = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const intl = useIntl();
  const language = useSelector((state: IRootState) => state.app.language);

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

  const routeState = location.state as { dataTime?: any } | null;
  const timeBooking = useMemo(() => routeState?.dataTime || {}, [routeState]);
  const { data: doctorResponse } = useGetDoctorByIdQuery(id || "", { skip: !id });
  const detailDoctor = doctorResponse?.errCode === 0 && doctorResponse.data
    ? doctorResponse.data
    : {};
  const doctorInfo = detailDoctor?.DoctorInfo || {};
  const doctorId = id || "";
  const timeType = timeBooking?.timeType || "";

  const renderTimeBooking = useCallback(
    (tb: any) => {
      if (tb && tb.timeTypeData) {
        let time =
          language === LANGUAGES.VI
            ? tb.timeTypeData.valueVi
            : tb.timeTypeData.valueEn;
        let dateResult = "";
        if (tb.date) {
          let startTime = +tb.date;
          let dateFormatted = moment(startTime).format("DD/MM/YYYY");
          if (language === LANGUAGES.VI) {
            let dayNumber = moment(startTime).day();
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
            let dayNameEn = moment(startTime).locale("en").format("dddd");
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

  const handleConfirmBooking = useCallback(async () => {
    let timeString = renderTimeBooking(timeBooking);
    let doctorNameStr = buildDoctorName(detailDoctor);
    let appointmentDate = timeBooking?.date || "";
    let birthdayVal = birthday ? new Date(birthday).getTime() : "";
    let fullName = `${lastName || ""} ${firstName || ""}`.trim();

    // Chuẩn bị payload, bao gồm thông tin đặt hộ nếu có
    let payload: any = {
      fullName: fullName,
      lastName: lastName,
      firstName: firstName,
      gender: gender,
      phoneNumber: phoneNumber,
      email: email,
      date: appointmentDate,
      birthday: birthdayVal,
      address: address,
      reason: reason,
      doctorId: doctorId,
      timeType: timeType,
      language: language,
      timeString: timeString,
      doctorName: doctorNameStr,
    };

    if (isForOther) {
      let profileDobVal = profileDateOfBirth
        ? new Date(profileDateOfBirth).toISOString().split("T")[0]
        : "";
      payload = {
        ...payload,
        isForOther: true,
        profileLastName: profileLastName,
        profileFirstName: profileFirstName,
        profileGender: profileGender,
        profilePhoneNumber: profilePhoneNumber,
        profileDateOfBirth: profileDobVal,
        profileAddress: profileAddress,
        relationship: relationship,
        medicalHistory: medicalHistory,
      };
    }

    let res = await postPatientBookAppointment(payload);
    console.log("check data", res);

    if (res && res.errCode === 0) {
      toast.success("Booking a new appointment succeed!");
      navigate(`/detail-doctor/${doctorId}`);
    } else {
      toast.error("Booking a new appointment error!");
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
    navigate,
  ]);

  console.log("check props booking modal", {
    lastName,
    firstName,
    gender,
    phoneNumber,
    email,
    birthday,
    address,
    reason,
    doctorId,
    timeType,
    detailDoctor,
    timeBooking,
    doctorInfo,
    paymentMethod,
  });

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
                      onChange={(event) => handleOnChangeInput(event, "email")}
                    />
                  </div>
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
                      onChange={(e) => setIsForOther(e.target.checked)}
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
                          <div className="col-12 col-md-6 form-group">
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Họ bệnh nhân"
                              value={profileLastName}
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
                              onChange={(e) =>
                                setProfilePhoneNumber(e.target.value)
                              }
                            />
                          </div>
                          <div className="col-12 form-group">
                            <DatePicker
                              className="form-control"
                              value={profileDateOfBirth}
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
                              onChange={(e) => setRelationship(e.target.value)}
                            />
                          </div>
                          <div className="col-12 form-group">
                            <textarea
                              className="form-control"
                              rows={3}
                              placeholder="Tiền sử bệnh (nếu có)"
                              value={medicalHistory}
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
