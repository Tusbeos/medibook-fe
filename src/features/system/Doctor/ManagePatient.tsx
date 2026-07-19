import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import "./ManagePatient.scss";
import { FormattedMessage } from "react-intl";
import DatePicker from "components/Input/DatePicker";
import { LANGUAGES, USER_ROLE } from "../../../utils";
import { IRootState } from "../../../types";
import {
  useGetAllDoctorsQuery,
  useGetPatientsByDoctorQuery,
} from "../../../store/api/publicApi";
import { DataState } from "components/System/SystemShared";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_OPTIONS,
  getBookingStatusMeta,
} from "../../../utils/bookingStatus";

const ManagePatient = () => {
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const language = useSelector((state: IRootState) => state.app.language);

  const navigate = useNavigate();
  const location = useLocation();
  const returnedDate = Number((location.state as any)?.selectedDateValue);

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    Number.isFinite(returnedDate) && returnedDate > 0
      ? new Date(returnedDate)
      : new Date(),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const roleKey = userInfo?.roleId || (userInfo as any)?.roleData?.keyMap || "";
  const isDoctorRole = roleKey === USER_ROLE.DOCTOR;
  const isAdmin = roleKey === USER_ROLE.ADMIN;
  const userDoctorId = userInfo?.id || userInfo?.userId || "";
  const shouldLoadDoctors =
    isAdmin || (isDoctorRole && !userDoctorId && !!userInfo?.email);

  const {
    data: doctorsResponse,
    isError: isDoctorsError,
    refetch: refetchDoctors,
  } = useGetAllDoctorsQuery(undefined, {
      skip: !shouldLoadDoctors,
    });

  const allDoctors = useMemo(
    () =>
      doctorsResponse?.errCode === 0 && Array.isArray(doctorsResponse.data)
        ? doctorsResponse.data
        : [],
    [doctorsResponse],
  );

  const matchedDoctorId = useMemo(() => {
    if (!isDoctorRole || userDoctorId || !userInfo?.email) return "";
    const matched = allDoctors.find(
      (item: any) => item && item.email === userInfo.email,
    );
    return matched?.id || "";
  }, [allDoctors, isDoctorRole, userDoctorId, userInfo?.email]);

  const doctors = useMemo(
    () =>
      isAdmin
        ? allDoctors.map((item: any) => ({
            id: item.id,
            firstName: item.firstName,
            lastName: item.lastName,
          }))
        : [],
    [allDoctors, isAdmin],
  );

  useEffect(() => {
    if (isDoctorRole) {
      const doctorId = userDoctorId || matchedDoctorId || "";
      setSelectedDoctorId((current) =>
        current === doctorId ? current : doctorId,
      );
      return;
    }

    if (isAdmin) {
      setSelectedDoctorId((current) => current || userInfo?.id || "");
    }
  }, [isAdmin, isDoctorRole, matchedDoctorId, userDoctorId, userInfo?.id]);

  const selectedDateValue = useMemo(
    () => new Date(selectedDate).setHours(0, 0, 0, 0),
    [selectedDate],
  );

  const activeDoctorId = useMemo(() => {
    if (isDoctorRole) return userDoctorId || matchedDoctorId || "";
    if (isAdmin) return selectedDoctorId || "";
    return userDoctorId || selectedDoctorId || "";
  }, [isAdmin, isDoctorRole, matchedDoctorId, selectedDoctorId, userDoctorId]);

  const shouldFetchPatients = !!activeDoctorId && !!selectedDateValue;

  const {
    data: patientsResponse,
    isLoading: isLoadingPatients,
    isFetching: isFetchingPatients,
    isError: isPatientsError,
    refetch: refetchPatients,
  } = useGetPatientsByDoctorQuery(
    { doctorId: activeDoctorId, date: selectedDateValue },
    {
      skip: !shouldFetchPatients,
      pollingInterval: 10_000,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
    },
  );

  const patients = useMemo(
    () =>
      patientsResponse?.errCode === 0 && Array.isArray(patientsResponse.data)
        ? patientsResponse.data
        : [],
    [patientsResponse],
  );

  const isLoading = isLoadingPatients && patients.length === 0;
  const errorMessage = useMemo(() => {
    if (isPatientsError && patients.length === 0) {
      return "Không thể tải danh sách bệnh nhân. Vui lòng thử lại.";
    }
    if (patientsResponse && patientsResponse.errCode !== 0) {
      return (
        (patientsResponse as any)?.message ||
        patientsResponse.errMessage ||
        "Không có dữ liệu"
      );
    }
    if (isDoctorsError && shouldLoadDoctors) {
      return "Không thể tải danh sách bác sĩ.";
    }
    return "";
  }, [
    isDoctorsError,
    isPatientsError,
    patients.length,
    patientsResponse,
    shouldLoadDoctors,
  ]);

  const handleChangeDate = useCallback((date: any) => {
    if (!date || !date[0]) return;
    setSelectedDate(date[0]);
  }, []);

  const handleChangeDoctor = useCallback((event: any) => {
    if (!event || !event.target) return;
    setSelectedDoctorId(event.target.value);
  }, []);

  const doctorDisplayName = userInfo
    ? `${userInfo.lastName || ""} ${userInfo.firstName || ""}`.trim()
    : "";

  const renderFullName = (item: any) => {
    // Nếu là booking đặt hộ, hiển thị tên bệnh nhân được đặt hộ
    if (item?.profileData) {
      const lastName = item.profileData.lastName || "";
      const firstName = item.profileData.firstName || "";
      return `${lastName} ${firstName}`.trim();
    }
    if (item && item.patientData) {
      const lastName = item.patientData.lastName || "";
      const firstName = item.patientData.firstName || "";
      return `${lastName} ${firstName}`.trim();
    }
    return item?.fullName || "";
  };

  const renderPhone = (item: any) => {
    if (item?.profileData?.phoneNumber) return item.profileData.phoneNumber;
    return item?.patientData?.phoneNumber || "";
  };

  const getStatusMeta = (statusId: string) => {
    const meta = getBookingStatusMeta(statusId);
    const classByTone = {
      warning: "badge badge-warning text-dark",
      info: "badge badge-info text-dark",
      primary: "badge badge-primary",
      success: "badge badge-success",
      danger: "badge badge-danger",
      neutral: "badge badge-secondary",
    };
    return {
      label: meta?.label || statusId || "Không rõ",
      className: meta ? classByTone[meta.tone] : classByTone.neutral,
    };
  };

  const statusTabs = useMemo(() => {
    const countByStatus = patients.reduce<Record<string, number>>((acc, item) => {
      const key = item?.statusId || "UNKNOWN";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return [
      { key: "ALL", label: "Tất cả", count: patients.length },
      ...BOOKING_STATUS_OPTIONS.map((status) => ({
        key: status.id,
        label: status.shortLabel,
        count: countByStatus[status.id] || 0,
      })),
    ];
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return patients.filter((item) => {
      const matchesStatus =
        statusFilter === "ALL" || item?.statusId === statusFilter;

      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;

      const searchableText = [
        renderFullName(item),
        item?.patientData?.email,
        renderPhone(item),
        item?.reason,
        item?.bookingTimeTypeData?.valueVi,
        item?.bookingTimeTypeData?.valueEn,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [patients, searchTerm, statusFilter]);

  return (
    <div className="manage-patient-container">
      <div className="ms-title">
        <FormattedMessage id="menu.doctor.patient-booking" />
      </div>
      <div className="row">
        <div className="col-12 mb-4">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-filter"></i> Bộ lọc tìm kiếm
              </span>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 form-group">
                  <label className="label-bold">
                    <FormattedMessage id="manage-schedule.select-date" />
                  </label>
                  <DatePicker
                    className="form-control"
                    onChange={handleChangeDate}
                    value={selectedDate}
                  />
                </div>
                {isAdmin ? (
                  <div className="col-md-6 form-group">
                    <label className="label-bold">
                      <FormattedMessage id="menu.manage-doctor.select-doctor" />
                    </label>
                    <select
                      className="form-control"
                      value={selectedDoctorId}
                      onChange={handleChangeDoctor}
                    >
                      <option value="">
                        {language === LANGUAGES.VI
                          ? "Chọn bác sĩ"
                          : "Select doctor"}
                      </option>
                      {doctors &&
                        doctors.length > 0 &&
                        doctors.map((item) => (
                          <option key={item.id} value={item.id}>
                            {language === LANGUAGES.VI
                              ? `${item.lastName || ""} ${item.firstName || ""}`.trim()
                              : `${item.firstName || ""} ${item.lastName || ""}`.trim()}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div className="col-md-6 form-group">
                    <label className="label-bold">
                      <FormattedMessage id="menu.manage-doctor.select-doctor" />
                    </label>
                    <input
                      className="form-control"
                      value={doctorDisplayName}
                      disabled
                      readOnly
                    />
                  </div>
                )}
                <div className="col-md-6 form-group">
                  <label className="label-bold">Tìm kiếm</label>
                  <input
                    className="form-control"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tên, email, số điện thoại, lý do khám..."
                  />
                </div>
                <div className="col-12 status-filter-row">
                  {statusTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`status-filter-button ${
                        statusFilter === tab.key ? "active" : ""
                      }`}
                      onClick={() => setStatusFilter(tab.key)}
                    >
                      {tab.label}
                      <span>{tab.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-list-alt"></i> Danh sách bệnh nhân đặt lịch
              </span>
              {isFetchingPatients && !isLoadingPatients && (
                <small className="text-muted">
                  <i className="fas fa-sync-alt fa-spin mr-1" /> Đang đồng bộ
                </small>
              )}
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped table-bordered mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "50px", textAlign: "center" }}>#</th>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>SĐT</th>
                      <th>Giờ khám</th>
                      <th>Lý do khám</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={8}>
                          <DataState
                            variant="loading"
                            text="Đang tải danh sách bệnh nhân..."
                          />
                        </td>
                      </tr>
                    ) : errorMessage ? (
                      <tr>
                        <td colSpan={8}>
                          <DataState
                            variant="error"
                            text={errorMessage}
                            onRetry={() => {
                              if (shouldFetchPatients) void refetchPatients();
                              if (isDoctorsError && shouldLoadDoctors) {
                                void refetchDoctors();
                              }
                            }}
                          />
                        </td>
                      </tr>
                    ) : (
                      <>
                        {filteredPatients && filteredPatients.length > 0 ? (
                          filteredPatients.map((item, index) => (
                            <tr key={item.id || index}>
                              <td className="text-center">{index + 1}</td>
                              <td>
                                {renderFullName(item)}
                                {item.profileData && (
                                  <span
                                    className="badge badge-secondary ml-1 text-muted"
                                    title={`Đặt hộ bởi: ${item.patientData?.email || ""} — Quan hệ: ${item.profileData.relationship || ""}`}
                                  >
                                    Đặt hộ
                                  </span>
                                )}
                              </td>
                              <td>{item.patientData?.email || ""}</td>
                              <td>{renderPhone(item)}</td>
                              <td>
                                {language === LANGUAGES.VI
                                  ? item.bookingTimeTypeData?.valueVi || ""
                                  : item.bookingTimeTypeData?.valueEn || ""}
                              </td>
                              <td>{item.reason || ""}</td>
                              <td>
                                <span className={getStatusMeta(item.statusId).className}>
                                  {getStatusMeta(item.statusId).label}
                                </span>
                              </td>
                              <td>
                                {item.statusId ===
                                  BOOKING_STATUS.PENDING_EMAIL_CONFIRMATION && (
                                  <span
                                    className="text-muted"
                                    style={{ fontSize: "12px" }}
                                  >
                                    Chờ xác nhận email
                                  </span>
                                )}
                                {item.statusId ===
                                  BOOKING_STATUS.PENDING_CLINIC_CONFIRMATION && (
                                  <span
                                    className="text-muted"
                                    style={{ fontSize: "12px" }}
                                  >
                                    Chờ phòng khám xác nhận
                                  </span>
                                )}
                                {item.statusId ===
                                  BOOKING_STATUS.READY_FOR_EXAMINATION &&
                                  isDoctorRole && (
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() =>
                                      navigate(
                                        `/doctor/prescription/${item.id}`,
                                        { state: { selectedDateValue } },
                                      )
                                    }
                                  >
                                    <i className="fas fa-notes-medical mr-1"></i>{" "}
                                    Khám &amp; kê đơn
                                  </button>
                                )}
                                {item.statusId ===
                                  BOOKING_STATUS.READY_FOR_EXAMINATION &&
                                  !isDoctorRole && (
                                  <span className="text-muted small">
                                    Chờ bác sĩ phụ trách khám
                                  </span>
                                )}
                                {item.statusId === BOOKING_STATUS.COMPLETED && (
                                  <span className="text-success small">
                                    <i className="fas fa-check-circle mr-1" />
                                    Đã lưu hồ sơ
                                  </span>
                                )}
                                {item.statusId ===
                                  BOOKING_STATUS.CANCELLED_OR_REJECTED && (
                                  <span className="text-danger small">
                                    Không còn hiệu lực
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8}>
                              <DataState
                                variant="empty"
                                text={
                                  !shouldFetchPatients
                                    ? "Vui lòng chọn bác sĩ để xem lịch hẹn."
                                    : patients.length > 0
                                      ? "Không có bệnh nhân phù hợp với bộ lọc."
                                      : "Chưa có bệnh nhân đặt lịch vào ngày này."
                                }
                              />
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePatient;
