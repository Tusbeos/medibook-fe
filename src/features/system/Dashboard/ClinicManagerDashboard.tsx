import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  approveClinicManagerDoctorReview,
  getDoctorsByClinicId,
  rejectClinicManagerDoctorReview,
  updateClinicManagerDoctorStatus,
} from "../../../services/doctorService";
import { handleGetAllClinics } from "../../../services/clinicService";
import {
  approveClinicManagerPackage,
  getClinicManagerPackages,
} from "../../../services/packageService";
import { getClinicBookings } from "../../../services/bookingService";
import { IAllCode, IClinic, IRootState } from "../../../types";
import { USER_ROLE } from "../../../utils";
import "./ClinicManagerDashboard.scss";

interface IDashboardDoctor {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  specialtyName?: string;
  clinicName?: string;
  statusId?: string;
  status_id?: string;
  statusData?: IAllCode;
}

interface IDashboardPackage {
  id?: number;
  name?: string;
  typeCode?: string;
  typeData?: IAllCode;
  clinicName?: string;
  price?: number;
  note?: string;
  statusId?: string;
  statusData?: IAllCode;
}

type QueueFilter = "all" | "doctors" | "packages";

const DOCTOR_STATUS_OPTIONS = [
  { key: "SD2", label: "Đang hoạt động", className: "active" },
  { key: "SD4", label: "Nghỉ phép", className: "leave" },
  { key: "SD3", label: "Ngưng hoạt động", className: "inactive" },
  { key: "SD5", label: "Bị khoá", className: "locked" },
];

interface IQueueItem {
  id: number | string;
  category: "doctor" | "package";
  requester: string;
  subtitle: string;
  typeLabel: string;
  typeClass: string;
  submitted: string;
  details: string;
  initials: string;
}

const getStatusKey = (item: IDashboardDoctor | IDashboardPackage) =>
  (item as IDashboardDoctor).statusId ||
  (item as IDashboardDoctor).status_id ||
  item.statusData?.keyMap ||
  "";

const getDoctorName = (doctor: IDashboardDoctor) => {
  const fullName = `${doctor.lastName || ""} ${doctor.firstName || ""}`.trim();
  return fullName || doctor.email || "Chưa có tên";
};

const getDoctorInitials = (doctor: IDashboardDoctor) => {
  const first = doctor.firstName?.trim()?.[0] || "";
  const last = doctor.lastName?.trim()?.[0] || "";
  const initials = `${last}${first}`.toUpperCase();
  return initials || (doctor.email?.slice(0, 2).toUpperCase() ?? "DR");
};

const getStatusLabel = (doctor: IDashboardDoctor) => {
  const statusKey = getStatusKey(doctor);
  if (doctor.statusData?.valueVi) return doctor.statusData.valueVi;
  if (doctor.statusData?.valueEn) return doctor.statusData.valueEn;
  if (statusKey === "SD1") return "Chờ duyệt";
  if (statusKey === "SD2") return "Đang hoạt động";
  if (statusKey === "SD3") return "Ngừng hoạt động";
  if (statusKey === "SD4") return "Nghỉ phép";
  return "Không rõ";
};

const getDoctorStatusClass = (statusKey: string) => {
  if (statusKey === "SD2") return "active";
  if (statusKey === "SD4") return "leave";
  if (statusKey === "SD3") return "inactive";
  if (statusKey === "SD5") return "locked";
  if (statusKey === "SD1") return "pending";
  return "neutral";
};

const getDoctorStatusDisplayLabel = (doctor: IDashboardDoctor) => {
  const statusKey = getStatusKey(doctor);
  return (
    DOCTOR_STATUS_OPTIONS.find((option) => option.key === statusKey)?.label ||
    getStatusLabel(doctor)
  );
};

const formatPrice = (price?: number) => {
  if (typeof price !== "number") return "";
  return new Intl.NumberFormat("vi-VN").format(price);
};

const ClinicManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { doctorId: reviewDoctorId } = useParams<{ doctorId?: string }>();
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const [clinics, setClinics] = useState<IClinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<number | string>("");
  const [doctors, setDoctors] = useState<IDashboardDoctor[]>([]);
  const [packages, setPackages] = useState<IDashboardPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [queueSearch, setQueueSearch] = useState("");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [openStatusDoctorId, setOpenStatusDoctorId] = useState<number | string>(
    "",
  );
  const [reviewNote, setReviewNote] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingFilter, setBookingFilter] = useState<string>("");

  const roleId = userInfo?.roleId || (userInfo as any)?.roleData?.keyMap;
  const isClinicManager = roleId === USER_ROLE.CLINIC_MANAGER;
  const userClinicId =
    (userInfo as any)?.clinicId ||
    (userInfo as any)?.clinic_id ||
    (userInfo as any)?.clinic?.id ||
    (userInfo as any)?.clinicData?.id ||
    "";
  const userClinicName =
    (userInfo as any)?.clinicName ||
    (userInfo as any)?.clinic_name ||
    (userInfo as any)?.clinic?.name ||
    (userInfo as any)?.clinicData?.name ||
    "";

  useEffect(() => {
    if (!isClinicManager) {
      setSelectedClinicId("");
      return;
    }

    setSelectedClinicId(userClinicId ? String(userClinicId) : "");
  }, [isClinicManager, userClinicId]);

  useEffect(() => {
    const loadClinics = async () => {
      if (!isClinicManager) {
        setClinics([]);
        return;
      }

      try {
        const res = await handleGetAllClinics();
        const clinicList =
          res?.errCode === 0 && Array.isArray(res.data) ? res.data : [];
        setClinics(clinicList);
      } catch (error) {
        setClinics([]);
      }
    };

    loadClinics();
  }, [isClinicManager]);

  const fetchDashboardData = useCallback(async () => {
    if (!isClinicManager || !selectedClinicId) {
      setDoctors([]);
      setPackages([]);
      return;
    }

    setIsLoading(true);
    try {
      const [doctorRes, packageRes, bookingRes] = await Promise.all([
        getDoctorsByClinicId(selectedClinicId),
        getClinicManagerPackages(selectedClinicId),
        getClinicBookings(selectedClinicId),
      ]);
      const doctorList =
        doctorRes?.errCode === 0 && Array.isArray(doctorRes.data)
          ? doctorRes.data
          : [];
      const packageList =
        packageRes?.errCode === 0 && Array.isArray(packageRes.data)
          ? packageRes.data
          : [];
      const bookingList =
        bookingRes?.errCode === 0 && Array.isArray(bookingRes.data)
          ? bookingRes.data
          : [];

      setDoctors(doctorList);
      setPackages(packageList);
      setBookings(bookingList);
      setLastUpdated(
        new Intl.DateTimeFormat("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date()),
      );
    } catch (error) {
      setDoctors([]);
      setPackages([]);
      setBookings([]);
      toast.error("Không thể tải dữ liệu của cơ sở y tế.");
    } finally {
      setIsLoading(false);
    }
  }, [isClinicManager, selectedClinicId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const selectedClinic = useMemo(
    () =>
      clinics.find((clinic) => String(clinic.id) === String(selectedClinicId)),
    [clinics, selectedClinicId],
  );
  const displayClinicName =
    selectedClinic?.name || userClinicName || "MediBook";

  const pendingDoctors = useMemo(
    () => doctors.filter((doctor) => getStatusKey(doctor) === "SD1"),
    [doctors],
  );

  const pendingPackages = useMemo(
    () =>
      packages.filter((pkg) => {
        const statusKey = getStatusKey(pkg);
        return statusKey === "SD1" || !statusKey;
      }),
    [packages],
  );

  const activePackages = useMemo(
    () => packages.filter((pkg) => getStatusKey(pkg) === "SD2").length,
    [packages],
  );

  const recentDoctors = useMemo(() => {
    const keyword = doctorSearch.trim().toLowerCase();
    const filteredDoctors = doctors.filter((doctor) => {
      if (!keyword) return true;

      return (
        getDoctorName(doctor).toLowerCase().includes(keyword) ||
        (doctor.email || "").toLowerCase().includes(keyword) ||
        (doctor.specialtyName || "").toLowerCase().includes(keyword) ||
        getDoctorStatusDisplayLabel(doctor).toLowerCase().includes(keyword)
      );
    });

    return filteredDoctors.slice(0, 5);
  }, [doctorSearch, doctors]);

  const queueItems = useMemo<IQueueItem[]>(() => {
    const doctorItems = pendingDoctors.map((doctor) => ({
      id: doctor.id || doctor.email || `doctor-${getDoctorName(doctor)}`,
      category: "doctor" as const,
      requester: getDoctorName(doctor),
      subtitle: doctor.specialtyName || "Chưa phân chuyên khoa",
      typeLabel: "Doctor Approval",
      typeClass: "doctor",
      submitted: "SD1",
      details: `${getDoctorName(doctor)} đang chờ duyệt để hoạt động tại ${displayClinicName}.`,
      initials: getDoctorInitials(doctor),
    }));

    const packageItems = pendingPackages.map((pkg) => ({
      id: pkg.id || `package-${pkg.name}`,
      category: "package" as const,
      requester: pkg.name || "Gói khám chưa có tên",
      subtitle: pkg.typeData?.valueVi || pkg.typeData?.valueEn || "Gói khám",
      typeLabel: "Package Approval",
      typeClass: "package",
      submitted: "SD1",
      details: `${pkg.name || "Gói khám"} đang chờ duyệt${pkg.price ? `, giá ${formatPrice(pkg.price)} VNĐ` : ""}.`,
      initials: "PK",
    }));

    return [...doctorItems, ...packageItems];
  }, [displayClinicName, pendingDoctors, pendingPackages]);

  const filteredQueueItems = useMemo(() => {
    const keyword = queueSearch.trim().toLowerCase();
    return queueItems.filter((item) => {
      const matchesFilter =
        queueFilter === "all" ||
        (queueFilter === "doctors" && item.category === "doctor") ||
        (queueFilter === "packages" && item.category === "package");
      const matchesSearch =
        !keyword ||
        item.requester.toLowerCase().includes(keyword) ||
        item.subtitle.toLowerCase().includes(keyword) ||
        item.typeLabel.toLowerCase().includes(keyword) ||
        item.details.toLowerCase().includes(keyword);

      return matchesFilter && matchesSearch;
    });
  }, [queueFilter, queueItems, queueSearch]);

  const reviewDoctor = useMemo(
    () =>
      doctors.find((doctor) => String(doctor.id) === String(reviewDoctorId)) ||
      null,
    [doctors, reviewDoctorId],
  );

  const handleApproveDoctor = async (doctorId?: number | string) => {
    if (!doctorId) return;

    try {
      const res = await approveClinicManagerDoctorReview(doctorId);
      if (res?.errCode === 0 || res?.success) {
        toast.success("Đã duyệt bác sĩ thành công.");
        fetchDashboardData();
        return;
      }
      toast.error(res?.message || "Duyệt bác sĩ thất bại.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Duyệt bác sĩ thất bại.");
    }
  };

  const handleApprovePackage = async (packageId?: number | string) => {
    if (!packageId) return;

    try {
      const res = await approveClinicManagerPackage(packageId);
      if (res?.errCode === 0 || res?.success) {
        toast.success("Đã duyệt gói khám thành công.");
        fetchDashboardData();
        return;
      }
      toast.error(res?.message || "Duyệt gói khám thất bại.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Duyệt gói khám thất bại.");
    }
  };

  const handleApproveQueueItem = (item: IQueueItem) => {
    if (item.category === "doctor") {
      handleApproveDoctor(item.id);
      return;
    }
    handleApprovePackage(item.id);
  };

  const handleUpdateDoctorStatus = async (
    doctorId: number | string | undefined,
    statusId: string,
  ) => {
    if (!doctorId) return;

    try {
      const res = await updateClinicManagerDoctorStatus(doctorId, statusId);
      if (res?.errCode === 0 || res?.success) {
        toast.success("Cập nhật trạng thái bác sĩ thành công.");
        setOpenStatusDoctorId("");
        fetchDashboardData();
        return;
      }
      toast.error(res?.message || "Cập nhật trạng thái bác sĩ thất bại.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Cập nhật trạng thái bác sĩ thất bại.",
      );
    }
  };

  const handleOpenDoctorReview = (doctorId: number | string) => {
    const doctor = doctors.find((item) => String(item.id) === String(doctorId));
    if (!doctor?.id) {
      toast.info("Không tìm thấy thông tin bác sĩ để review.");
      return;
    }

    setReviewNote("");
    setIsQueueOpen(false);
    navigate(`/system/clinic-manager/review-doctor/${doctor.id}`);
  };

  const handleReviewQueueItem = (item: IQueueItem) => {
    if (item.category === "doctor") {
      handleOpenDoctorReview(item.id);
      return;
    }

    toast.info("Review gói khám sẽ được bổ sung ở màn riêng.");
  };

  const handleApproveReviewDoctor = async () => {
    if (!reviewDoctor?.id) return;

    try {
      const res = await approveClinicManagerDoctorReview(
        reviewDoctor.id,
        reviewNote.trim() || undefined,
      );
      if (res?.errCode === 0 || res?.success) {
        toast.success("Đã phê duyệt và lưu thông tin yêu cầu.");
        setReviewNote("");
        navigate("/system/clinic-manager");
        fetchDashboardData();
        return;
      }
      toast.error(res?.message || "Phê duyệt bác sĩ thất bại.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Phê duyệt bác sĩ thất bại.",
      );
    }
  };

  const handleRejectReviewDoctor = async () => {
    if (!reviewDoctor?.id) return;

    if (!reviewNote.trim()) {
      toast.error("Vui lòng nhập ghi chú khi từ chối.");
      return;
    }

    try {
      const res = await rejectClinicManagerDoctorReview(
        reviewDoctor.id,
        reviewNote.trim(),
      );
      if (res?.errCode === 0 || res?.success) {
        toast.success("Đã từ chối và lưu lý do phê duyệt.");
        setReviewNote("");
        navigate("/system/clinic-manager");
        fetchDashboardData();
        return;
      }
      toast.error(res?.message || "Từ chối bác sĩ thất bại.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Từ chối bác sĩ thất bại.");
    }
  };

  const totalPending = queueItems.length;

  if (!isClinicManager) {
    return (
      <div className="clinic-manager-dashboard-container">
        <section className="dashboard-panel access-panel">
          <h2>Clinic Manager Dashboard</h2>
          <p>Màn hình này chỉ dành cho tài khoản Clinic Manager.</p>
        </section>
      </div>
    );
  }

  if (!selectedClinicId) {
    return (
      <div className="clinic-manager-dashboard-container">
        <section className="dashboard-panel access-panel">
          <h2>Clinic Manager Dashboard</h2>
          <p>
            Tài khoản Clinic Manager này chưa được gán cơ sở y tế. Vui lòng kiểm
            tra lại clinicId của tài khoản.
          </p>
        </section>
      </div>
    );
  }

  if (reviewDoctorId && !reviewDoctor) {
    return (
      <div className="clinic-manager-dashboard-container">
        <section className="dashboard-panel access-panel">
          <h2>Chi tiết phê duyệt bác sĩ</h2>
          <p>
            {isLoading
              ? "Đang tải thông tin bác sĩ..."
              : "Không tìm thấy bác sĩ trong cơ sở y tế này."}
          </p>
          <button
            type="button"
            className="review-back-button"
            onClick={() => navigate("/system/clinic-manager")}
          >
            Quay lại
          </button>
        </section>
      </div>
    );
  }

  if (reviewDoctor) {
    const reviewStatusKey = getStatusKey(reviewDoctor);
    const reviewStatusClass = getDoctorStatusClass(reviewStatusKey);

    return (
      <div className="clinic-manager-dashboard-container review-doctor-container">
        <div className="review-header">
          <button
            type="button"
            className="review-back-icon"
            onClick={() => navigate("/system/clinic-manager")}
          >
            <i className="fas fa-arrow-left" />
          </button>
          <div>
            <h1>Chi tiết phê duyệt bác sĩ</h1>
            <div className="review-subtitle">
              <span className={`review-status-badge ${reviewStatusClass}`}>
                {getDoctorStatusDisplayLabel(reviewDoctor)}
              </span>
              <span>•</span>
              <span>
                Yêu cầu phê duyệt bác sĩ: {getDoctorName(reviewDoctor)}
              </span>
            </div>
          </div>
        </div>

        <div className="review-content-grid">
          <main className="review-main-column">
            <section className="review-card">
              <div className="review-card-title">
                <i className="far fa-user" />
                <h2>Thông tin yêu cầu</h2>
              </div>

              <div className="review-info-grid">
                <div>
                  <span>Người yêu cầu (Bác sĩ)</span>
                  <strong>{getDoctorName(reviewDoctor)}</strong>
                </div>
                <div>
                  <span>Cơ sở y tế</span>
                  <strong>
                    {reviewDoctor.clinicName || displayClinicName}
                  </strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{reviewDoctor.email || "Chưa cập nhật"}</strong>
                </div>
                <div>
                  <span>Mã yêu cầu</span>
                  <strong>DR-{reviewDoctor.id || "NEW"}</strong>
                </div>
              </div>
            </section>

            <section className="review-card">
              <div className="review-card-title">
                <i className="far fa-file-alt" />
                <h2>Nội dung đăng ký</h2>
              </div>

              <div className="review-change-box">
                <h3>Đăng ký bác sĩ mới</h3>
                <div className="review-change-grid">
                  <div>
                    <span>Chuyên khoa</span>
                    <strong>
                      {reviewDoctor.specialtyName || "Chưa phân chuyên khoa"}
                    </strong>
                  </div>
                  <div>
                    <span>Trạng thái hiện tại</span>
                    <strong>{getDoctorStatusDisplayLabel(reviewDoctor)}</strong>
                  </div>
                </div>
                <div>
                  <span>Mô tả yêu cầu</span>
                  <p>
                    Bác sĩ {getDoctorName(reviewDoctor)} đang chờ được phê duyệt
                    để hoạt động tại{" "}
                    {reviewDoctor.clinicName || displayClinicName}. Vui lòng
                    kiểm tra thông tin chuyên khoa, tài khoản và trạng thái
                    trước khi phê duyệt.
                  </p>
                </div>
              </div>

              <div className="review-attachments">
                <h3>Tài liệu liên quan</h3>
                <div className="attachment-row">
                  <i className="far fa-id-card" />
                  <span>Thông tin hồ sơ bác sĩ</span>
                  <button type="button">Xem</button>
                </div>
                <div className="attachment-row">
                  <i className="far fa-hospital" />
                  <span>Thông tin cơ sở y tế quản lý</span>
                  <button type="button">Xem</button>
                </div>
              </div>
            </section>
          </main>

          <aside className="review-action-card">
            <h2>Hành động</h2>
            <label htmlFor="doctor-review-note">Ghi chú phê duyệt</label>
            <textarea
              id="doctor-review-note"
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              placeholder="Nhập lý do từ chối hoặc ghi chú thêm (bắt buộc khi từ chối)..."
            />
            <button
              type="button"
              className="review-approve-button"
              onClick={handleApproveReviewDoctor}
            >
              <i className="far fa-check-circle" />
              Phê duyệt
            </button>
            <button
              type="button"
              className="review-reject-button"
              onClick={handleRejectReviewDoctor}
            >
              <i className="far fa-times-circle" />
              Từ chối
            </button>
            <button
              type="button"
              className="review-back-button"
              onClick={() => navigate("/system/clinic-manager")}
            >
              Quay lại
            </button>
            <div className="review-action-note">
              Hành động này sẽ cập nhật trạng thái bác sĩ và làm mới danh sách
              yêu cầu.
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="clinic-manager-dashboard-container">
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            <i className="far fa-hospital" />
            Clinic Manager
          </span>
          <h1>{displayClinicName}</h1>
          <p>
            Trung tâm điều phối bác sĩ, gói khám và các yêu cầu phê duyệt của cơ
            sở y tế.
          </p>
        </div>
        <span>Last updated: {lastUpdated || "Đang cập nhật"}</span>
      </div>

      <div className="dashboard-heading-meta">
        <span>Clinic ID: {selectedClinicId}</span>
        <strong>Last updated: {lastUpdated || "Đang cập nhật"}</strong>
      </div>

      <div className="dashboard-metrics">
        <div className="metric-card">
          <div className="metric-topline">
            <span>Total Doctors</span>
            <i className="fas fa-users" />
          </div>
          <div className="metric-value-row">
            <strong>{isLoading ? "..." : doctors.length}</strong>
            <span className="metric-chip blue">{displayClinicName}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-topline">
            <span>Active Package</span>
            <i className="fas fa-briefcase-medical" />
          </div>
          <div className="metric-value-row">
            <strong>{isLoading ? "..." : activePackages}</strong>
            <span className="metric-chip neutral">Stable</span>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-topline">
            <span>
              <i className="fas fa-circle" />
              Pending Approvals
            </span>
            <i className="fas fa-clipboard-check" />
          </div>
          <div className="metric-value-row">
            <strong>{isLoading ? "..." : totalPending}</strong>
            <span className="metric-chip peach">Requires Action</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-topline">
            <span>Bookings</span>
            <i className="fas fa-calendar-check" />
          </div>
          <div className="metric-value-row">
            <strong>{isLoading ? "..." : bookings.length}</strong>
            <span className="metric-chip blue">
              {bookings.filter((b: any) => b.statusId === "S2").length} chờ xác nhận
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel recent-doctors-panel">
          <div className="panel-title-row recent-doctors-title-row">
            <h2>Recent Doctors</h2>
            <div className="recent-doctors-actions">
              <div className="recent-doctors-search">
                <i className="fas fa-search" />
                <input
                  value={doctorSearch}
                  onChange={(event) => setDoctorSearch(event.target.value)}
                  placeholder="Tìm kiếm bác sĩ..."
                />
              </div>
              <button type="button" onClick={fetchDashboardData}>
                Refresh
              </button>
            </div>
          </div>

          <div className="recent-doctors-table">
            <div className="table-header">
              <span>Doctor Name</span>
              <span>Specialty</span>
              <span>Status</span>
            </div>

            {recentDoctors.length > 0 ? (
              recentDoctors.map((doctor) => {
                const statusKey = getStatusKey(doctor);
                const statusClass = getDoctorStatusClass(statusKey);
                const doctorKey =
                  doctor.id || doctor.email || getDoctorName(doctor);

                return (
                  <div
                    className={`doctor-row ${openStatusDoctorId === doctorKey ? "status-open" : ""}`}
                    key={doctorKey}
                  >
                    <div className="doctor-name-cell">
                      <span className="doctor-avatar">
                        {getDoctorInitials(doctor)}
                      </span>
                      <span>{getDoctorName(doctor)}</span>
                    </div>
                    <span>
                      {doctor.specialtyName || "Chưa phân chuyên khoa"}
                    </span>
                    <div className="doctor-status-select">
                      <button
                        type="button"
                        className={`status-trigger ${statusClass}`}
                        disabled={statusKey === "SD1"}
                        onClick={() =>
                          statusKey !== "SD1" &&
                          setOpenStatusDoctorId((current) =>
                            current === doctorKey ? "" : doctorKey,
                          )
                        }
                      >
                        <span className="status-dot" />
                        <span>{getDoctorStatusDisplayLabel(doctor)}</span>
                        {statusKey !== "SD1" && (
                          <i className="fas fa-chevron-down" />
                        )}
                      </button>

                      {statusKey !== "SD1" &&
                        openStatusDoctorId === doctorKey && (
                          <div className="status-dropdown">
                            {DOCTOR_STATUS_OPTIONS.map((option) => (
                              <button
                                type="button"
                                key={option.key}
                                className={option.className}
                                onClick={() =>
                                  handleUpdateDoctorStatus(
                                    doctor.id,
                                    option.key,
                                  )
                                }
                              >
                                <span className="status-dot" />
                                <span>{option.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                Chưa có bác sĩ trong cơ sở y tế này.
              </div>
            )}
          </div>
        </section>

        <aside className="dashboard-panel action-required-panel">
          <div className="panel-title-row">
            <h2>Action Required</h2>
            <span className="new-count">{totalPending} New</span>
          </div>

          <div className="action-list">
            {queueItems.length > 0 ? (
              queueItems.slice(0, 3).map((item) => (
                <div
                  className="action-card"
                  key={`${item.category}-${item.id}`}
                >
                  <div className="action-card-heading">
                    <strong>{item.typeLabel}</strong>
                    <span>{item.submitted}</span>
                  </div>
                  <p>{item.details}</p>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="approve-button"
                      onClick={() => handleApproveQueueItem(item)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="review-button"
                      onClick={() => handleReviewQueueItem(item)}
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state compact">
                Không có yêu cầu đang chờ duyệt.
              </div>
            )}
          </div>

          <button
            type="button"
            className="view-queue-button"
            onClick={() => setIsQueueOpen(true)}
          >
            View All Queue ({totalPending})
          </button>
        </aside>
      </div>

      {/* Booking Management Section */}
      <section className="dashboard-panel bookings-panel">
        <div className="panel-title-row">
          <h2>
            <i className="fas fa-calendar-check" /> Lịch hẹn khám
          </h2>
          <div className="booking-filters">
            <button
              type="button"
              className={bookingFilter === "" ? "active" : ""}
              onClick={() => setBookingFilter("")}
            >
              Tất cả ({bookings.length})
            </button>
            <button
              type="button"
              className={bookingFilter === "S2" ? "active" : ""}
              onClick={() => setBookingFilter("S2")}
            >
              Chờ xác nhận (
              {bookings.filter((b: any) => b.statusId === "S2").length})
            </button>
            <button
              type="button"
              className={bookingFilter === "S3" ? "active" : ""}
              onClick={() => setBookingFilter("S3")}
            >
              Đã xác nhận (
              {bookings.filter((b: any) => b.statusId === "S3").length})
            </button>
            <button
              type="button"
              className={bookingFilter === "S1" ? "active" : ""}
              onClick={() => setBookingFilter("S1")}
            >
              Chờ email (
              {bookings.filter((b: any) => b.statusId === "S1").length})
            </button>
          </div>
        </div>

        <div className="bookings-table-wrap">
          <div className="bookings-table-header">
            <span>Bệnh nhân</span>
            <span>Bác sĩ</span>
            <span>Ngày khám</span>
            <span>Giờ khám</span>
            <span>Trạng thái</span>
            <span>Lý do khám</span>
          </div>
          {(() => {
            const filtered = bookingFilter
              ? bookings.filter((b: any) => b.statusId === bookingFilter)
              : bookings;
            if (filtered.length === 0) {
              return <div className="empty-state">Chưa có lịch hẹn nào.</div>;
            }
            return filtered.map((booking: any) => {
              const statusClass =
                booking.statusId === "S1"
                  ? "pending"
                  : booking.statusId === "S2"
                    ? "verified"
                    : booking.statusId === "S3"
                      ? "confirmed"
                      : "neutral";
              return (
                <div className="booking-row" key={booking.id}>
                  <div className="booking-patient">
                    <strong>
                      {booking.profileName || booking.patientName || "N/A"}
                    </strong>
                    <small>{booking.patientEmail}</small>
                  </div>
                  <span>{booking.doctorName || "N/A"}</span>
                  <span>{booking.date}</span>
                  <span>{booking.timeTypeValue || booking.timeType}</span>
                  <span className={`booking-status ${statusClass}`}>
                    {booking.statusValue || booking.statusId}
                  </span>
                  <span className="booking-reason">
                    {booking.reason || "—"}
                  </span>
                </div>
              );
            });
          })()}
        </div>
      </section>

      {isQueueOpen && (
        <div
          className="approval-modal-backdrop"
          onMouseDown={() => setIsQueueOpen(false)}
        >
          <section
            className="approval-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="approval-modal-header">
              <h2>Full Approval Queue</h2>
              <button
                type="button"
                aria-label="Close queue"
                onClick={() => setIsQueueOpen(false)}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="approval-modal-body">
              <div className="queue-toolbar">
                <div className="queue-search">
                  <i className="fas fa-search" />
                  <input
                    value={queueSearch}
                    onChange={(event) => setQueueSearch(event.target.value)}
                    placeholder="Search requests..."
                  />
                </div>

                <div className="queue-tabs">
                  <button
                    type="button"
                    className={queueFilter === "all" ? "active" : ""}
                    onClick={() => setQueueFilter("all")}
                  >
                    All Requests
                  </button>
                  <button
                    type="button"
                    className={queueFilter === "doctors" ? "active" : ""}
                    onClick={() => setQueueFilter("doctors")}
                  >
                    Doctors
                  </button>
                  <button
                    type="button"
                    className={queueFilter === "packages" ? "active" : ""}
                    onClick={() => setQueueFilter("packages")}
                  >
                    Packages
                  </button>
                </div>
              </div>

              <div className="queue-table">
                <div className="queue-table-header">
                  <span>Requester</span>
                  <span>Type</span>
                  <span>Submitted</span>
                  <span>Details</span>
                  <span>Actions</span>
                </div>

                {filteredQueueItems.length > 0 ? (
                  filteredQueueItems.map((item) => (
                    <div
                      className="queue-row"
                      key={`${item.category}-${item.id}`}
                    >
                      <div className="queue-requester">
                        <span className="queue-avatar">{item.initials}</span>
                        <div>
                          <strong>{item.requester}</strong>
                          <small>{item.subtitle}</small>
                        </div>
                      </div>
                      <span className={`queue-type ${item.typeClass}`}>
                        {item.typeLabel}
                      </span>
                      <span>{item.submitted}</span>
                      <p>{item.details}</p>
                      <div className="queue-actions">
                        <button
                          type="button"
                          className="queue-approve"
                          onClick={() => handleApproveQueueItem(item)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="queue-review"
                          onClick={() => handleReviewQueueItem(item)}
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">Không có yêu cầu phù hợp.</div>
                )}
              </div>
            </div>

            <div className="approval-modal-footer">
              <span>
                Showing {filteredQueueItems.length > 0 ? 1 : 0} to{" "}
                {filteredQueueItems.length} of {queueItems.length} entries
              </span>
              <div className="queue-pagination">
                <button type="button" disabled>
                  <i className="fas fa-chevron-left" />
                </button>
                <button type="button" className="active">
                  1
                </button>
                <button type="button" disabled>
                  <i className="fas fa-chevron-right" />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ClinicManagerDashboard;
