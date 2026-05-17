import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./ManagePatient.scss";
import { FormattedMessage } from "react-intl";
import DatePicker from "components/Input/DatePicker";
import {
  getPatientsByDoctor,
  confirmPatientBooking,
} from "../../../services/patientService";
import { LANGUAGES, USER_ROLE } from "../../../utils";
import { handleGetAllDoctors } from "../../../services/doctorService";
import { toast } from "react-toastify";
import { IRootState } from "../../../types";

const ManagePatient = () => {
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const language = useSelector((state: IRootState) => state.app.language);

  const navigate = useNavigate();

  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Dùng ref để tránh stale closure trong fetchPatients
  const selectedDoctorIdRef = useRef(selectedDoctorId);
  selectedDoctorIdRef.current = selectedDoctorId;
  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;

  const fetchDoctors = useCallback(async () => {
    try {
      // roleId có thể đến từ AuthResponse trực tiếp hoặc từ roleData.keyMap
      const roleKey =
        userInfo?.roleId || (userInfo as any)?.roleData?.keyMap || "";
      const isDoctorRole = roleKey === USER_ROLE.DOCTOR;
      if (isDoctorRole) {
        let doctorId = userInfo.id || userInfo.userId || "";
        if (!doctorId && userInfo.email) {
          try {
            const res = await handleGetAllDoctors();
            if (res && res.errCode === 0 && Array.isArray(res.data)) {
              const matched = res.data.find(
                (item: any) => item && item.email === userInfo.email,
              );
              doctorId = matched?.id || "";
            }
          } catch (e) {}
        }
        setDoctors([]);
        setSelectedDoctorId(doctorId);
        return;
      }

      const res = await handleGetAllDoctors();
      if (res && res.errCode === 0 && Array.isArray(res.data)) {
        const doctorsList = res.data.map((item: any) => ({
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
        }));

        let initDoctorId = selectedDoctorIdRef.current;
        if (!initDoctorId && userInfo?.id) {
          initDoctorId = userInfo.id;
        }

        setDoctors(doctorsList);
        setSelectedDoctorId(initDoctorId);
      }
    } catch (e) {}
  }, [userInfo]);

  const fetchPatients = useCallback(async () => {
    const roleKey =
      userInfo?.roleId || (userInfo as any)?.roleData?.keyMap || "";
    const isDoctorRole = roleKey === USER_ROLE.DOCTOR;
    const isAdmin = roleKey === USER_ROLE.ADMIN;
    const currentSelectedDoctorId = selectedDoctorIdRef.current;
    const currentSelectedDate = selectedDateRef.current;

    let doctorId = isDoctorRole
      ? userInfo?.id || userInfo?.userId || ""
      : isAdmin
        ? currentSelectedDoctorId
        : userInfo?.id || userInfo?.userId || currentSelectedDoctorId || "";

    if (isAdmin && !doctorId) {
      setPatients([]);
      setIsLoading(false);
      setErrorMessage("");
      return;
    }

    if (isDoctorRole && !doctorId && userInfo?.email) {
      try {
        const res = await handleGetAllDoctors();
        if (res && res.errCode === 0 && Array.isArray(res.data)) {
          const matched = res.data.find(
            (item: any) => item && item.email === userInfo.email,
          );
          doctorId = matched?.id || "";
        }
      } catch (e) {}
    }

    if (!doctorId || !currentSelectedDate) {
      setPatients([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      let dateValue = new Date(currentSelectedDate).setHours(0, 0, 0, 0);
      const res = await getPatientsByDoctor(doctorId, dateValue);

      if (res && res.errCode === 0 && Array.isArray(res.data)) {
        setPatients(res.data);
        setIsLoading(false);
      } else {
        setPatients([]);
        setIsLoading(false);
        setErrorMessage(res?.message || "Không có dữ liệu");
      }
    } catch (e) {
      setPatients([]);
      setIsLoading(false);
      setErrorMessage("Không thể tải danh sách bệnh nhân. Vui lòng thử lại.");
    }
  }, [userInfo]);

  // Lấy danh sách bác sĩ và bệnh nhân khi mount
  useEffect(() => {
    const init = async () => {
      await fetchDoctors();
      await fetchPatients();
    };
    init();
  }, [fetchDoctors, fetchPatients]);

  // Khi selectedDate, userInfo, hoặc selectedDoctorId thay đổi → fetch lại patients
  useEffect(() => {
    fetchPatients();
  }, [selectedDate, selectedDoctorId, userInfo, fetchPatients]);

  const handleChangeDate = useCallback((date: any) => {
    if (!date || !date[0]) return;
    setSelectedDate(date[0]);
  }, []);

  const handleChangeDoctor = useCallback((event: any) => {
    if (!event || !event.target) return;
    setSelectedDoctorId(event.target.value);
  }, []);

  const handleConfirmBooking = async (item: any) => {
    const bookingId = item?.id;
    if (!bookingId) return;

    const confirmed = window.confirm("Xác nhận bệnh nhân đã khám xong?");
    if (!confirmed) return;

    const doctorId =
      item?.doctorId ||
      userInfo?.id ||
      userInfo?.userId ||
      selectedDoctorId ||
      "";

    try {
      const res = await confirmPatientBooking(bookingId, doctorId, "S3");
      if (res && res.errCode === 0) {
        toast.success("Xác nhận thành công!");
        fetchPatients();
      } else {
        toast.error(res?.errMessage || "Xác nhận thất bại!");
      }
    } catch (e) {
      toast.error("Xác nhận thất bại!");
    }
  };

  const roleKey = userInfo?.roleId || (userInfo as any)?.roleData?.keyMap || "";
  const isAdmin = roleKey === USER_ROLE.ADMIN;
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
    switch (statusId) {
      case "S1":
        return { label: "Chờ xác nhận email", className: "badge badge-warning text-danger" };
      case "S2":
        return { label: "Chờ khám", className: "badge badge-info text-warning" };
      case "S3":
        return { label: "Đã khám", className: "badge badge-success text-primary" };
      case "S4":
      case "S5":
        return { label: "Đã hủy", className: "badge badge-secondary" };
      default:
        return { label: statusId || "Không rõ", className: "badge badge-secondary" };
    }
  };

  const statusTabs = useMemo(() => {
    const countByStatus = patients.reduce<Record<string, number>>((acc, item) => {
      const key = item?.statusId || "UNKNOWN";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return [
      { key: "ALL", label: "Tất cả", count: patients.length },
      { key: "S1", label: "Chờ email", count: countByStatus.S1 || 0 },
      { key: "S2", label: "Chờ khám", count: countByStatus.S2 || 0 },
      { key: "S3", label: "Đã khám", count: countByStatus.S3 || 0 },
      { key: "CANCELLED", label: "Đã hủy", count: (countByStatus.S4 || 0) + (countByStatus.S5 || 0) },
    ];
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return patients.filter((item) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        item?.statusId === statusFilter ||
        (statusFilter === "CANCELLED" && ["S4", "S5"].includes(item?.statusId));

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
            </div>
            <div className="card-body p-0">
              {errorMessage && (
                <div className="patient-error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {errorMessage}
                </div>
              )}
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
                        <td colSpan={8} className="text-center p-4">
                          <i className="fas fa-spinner fa-spin mr-2"></i> Đang
                          tải dữ liệu...
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
                                {/* S1: chờ xác nhận email → không hiện nút */}
                                {item.statusId === "S1" && (
                                  <span
                                    className="text-muted"
                                    style={{ fontSize: "12px" }}
                                  >
                                    Chờ xác nhận email
                                  </span>
                                )}
                                {/* S2: email đã xác nhận → hiện nút Xác nhận khám */}
                                {item.statusId === "S2" && (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleConfirmBooking(item)}
                                  >
                                    <i className="fas fa-check mr-1"></i> Xác
                                    nhận khám
                                  </button>
                                )}
                                {/* S3: đã khám → hiện nút Kê đơn */}
                                {item.statusId === "S3" && (
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() =>
                                      navigate(
                                        `/doctor/prescription/${item.id}`,
                                      )
                                    }
                                  >
                                    <i className="fas fa-notes-medical mr-1"></i>{" "}
                                    Kê đơn
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="text-center p-4">
                              {patients.length > 0
                                ? "Không có bệnh nhân phù hợp với bộ lọc."
                                : "Chưa có bệnh nhân đặt lịch vào ngày này."}
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
