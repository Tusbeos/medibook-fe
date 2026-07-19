import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useClinicContext } from "./useClinicContext";
import "./ClinicManagerDashboard.scss";
import {
  useGetClinicBookingsQuery,
  useGetClinicManagerPackagesQuery,
  useGetDoctorsByClinicIdQuery,
} from "../../../store/api/publicApi";
import { DataState } from "components/System/SystemShared";

const getStatusKey = (item: any) =>
  item.statusId || item.status_id || item.statusData?.keyMap || "";

const readList = (response: any) =>
  response?.errCode === 0 && Array.isArray(response.data) ? response.data : [];

const ClinicManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isClinicManager, selectedClinicId } = useClinicContext();
  const {
    data: doctorsResponse,
    isLoading: isDoctorsLoading,
    isError: isDoctorsError,
    refetch: refetchDoctors,
  } = useGetDoctorsByClinicIdQuery(selectedClinicId, {
    skip: !selectedClinicId,
  });
  const {
    data: packagesResponse,
    isLoading: isPackagesLoading,
    isError: isPackagesError,
    refetch: refetchPackages,
  } = useGetClinicManagerPackagesQuery(selectedClinicId, {
    skip: !selectedClinicId,
  });
  const {
    data: bookingsResponse,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
    refetch: refetchBookings,
  } = useGetClinicBookingsQuery(
    { clinicId: selectedClinicId, page: 0, size: 5 },
    {
      skip: !selectedClinicId,
      pollingInterval: 10_000,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
    },
  );
  const {
    data: pendingBookingsResponse,
    isLoading: isPendingBookingsLoading,
    isError: isPendingBookingsError,
    refetch: refetchPendingBookings,
  } = useGetClinicBookingsQuery(
    { clinicId: selectedClinicId, status: "S2", page: 0, size: 1 },
    {
      skip: !selectedClinicId,
      pollingInterval: 10_000,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
    },
  );

  const doctors = useMemo(() => readList(doctorsResponse), [doctorsResponse]);
  const packages = useMemo(() => readList(packagesResponse), [packagesResponse]);
  const isLoading =
    isDoctorsLoading ||
    isPackagesLoading ||
    isBookingsLoading ||
    isPendingBookingsLoading;

  const hasError =
    (isDoctorsError && !doctorsResponse) ||
    (isPackagesError && !packagesResponse) ||
    (isBookingsError && !bookingsResponse) ||
    (isPendingBookingsError && !pendingBookingsResponse);

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
  const totalPending = pendingDoctors.length + pendingPackages.length;
  const totalBookings = bookingsResponse?.pagination?.totalElements || 0;
  const pendingBookings = pendingBookingsResponse?.pagination?.totalElements || 0;

  if (!isClinicManager) {
    return (
      <div className="cm-dashboard">
        <div className="cm-dashboard-empty">
          <h2>Clinic Manager Dashboard</h2>
          <p>Màn hình này chỉ dành cho tài khoản Clinic Manager.</p>
        </div>
      </div>
    );
  }

  if (!selectedClinicId) {
    return (
      <div className="cm-dashboard">
        <div className="cm-dashboard-empty">
          <h2>Clinic Manager Dashboard</h2>
          <p>Tài khoản chưa được gán cơ sở y tế.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="cm-dashboard">
        <DataState variant="loading" text="Đang tải dữ liệu dashboard..." />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="cm-dashboard">
        <DataState
          variant="error"
          text="Không thể tải đầy đủ dữ liệu dashboard."
          onRetry={() => {
            void refetchDoctors();
            void refetchPackages();
            void refetchBookings();
            void refetchPendingBookings();
          }}
        />
      </div>
    );
  }

  return (
    <div className="cm-dashboard">
      <div className="cm-metrics">
        <div
          className="cm-metric-card"
          onClick={() => navigate("/system/clinic-manager/doctors")}
        >
          <div className="cm-metric-top">
            <span>Bác sĩ</span>
            <i className="fas fa-user-md" />
          </div>
          <div className="cm-metric-value">
            <strong>{isLoading ? "..." : doctors.length}</strong>
            {pendingDoctors.length > 0 && (
              <span className="cm-chip warning">
                {pendingDoctors.length} chờ duyệt
              </span>
            )}
          </div>
        </div>

        <div
          className="cm-metric-card"
          onClick={() => navigate("/system/clinic-manager/packages")}
        >
          <div className="cm-metric-top">
            <span>Gói khám</span>
            <i className="fas fa-briefcase-medical" />
          </div>
          <div className="cm-metric-value">
            <strong>{isLoading ? "..." : activePackages}</strong>
            <span className="cm-chip neutral">Active</span>
          </div>
        </div>

        <div
          className="cm-metric-card highlight"
          onClick={() => navigate("/system/clinic-manager/approvals")}
        >
          <div className="cm-metric-top">
            <span>
              <i className="fas fa-circle" /> Chờ duyệt
            </span>
            <i className="fas fa-clipboard-check" />
          </div>
          <div className="cm-metric-value">
            <strong>{isLoading ? "..." : totalPending}</strong>
            <span className="cm-chip peach">Cần xử lý</span>
          </div>
        </div>

        <div
          className="cm-metric-card"
          onClick={() => navigate("/system/clinic-manager/bookings")}
        >
          <div className="cm-metric-top">
            <span>Lịch hẹn</span>
            <i className="fas fa-calendar-check" />
          </div>
          <div className="cm-metric-value">
            <strong>{isLoading ? "..." : totalBookings}</strong>
            {pendingBookings > 0 && (
              <span className="cm-chip warning">
                {pendingBookings} chờ phòng khám
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="cm-quick-actions">
        <h2>Truy cập nhanh</h2>
        <div className="cm-quick-grid">
          <div
            className="cm-quick-card"
            onClick={() => navigate("/system/clinic-manager/doctors")}
          >
            <i className="fas fa-user-md" />
            <div>
              <strong>Quản lý Bác sĩ</strong>
              <p>Xem, duyệt và quản lý trạng thái bác sĩ</p>
            </div>
            <i className="fas fa-chevron-right" />
          </div>

          <div
            className="cm-quick-card"
            onClick={() => navigate("/system/clinic-manager/bookings")}
          >
            <i className="fas fa-calendar-check" />
            <div>
              <strong>Quản lý Lịch hẹn</strong>
              <p>Xác nhận hoặc từ chối lịch hẹn khám</p>
            </div>
            <i className="fas fa-chevron-right" />
          </div>

          <div
            className="cm-quick-card"
            onClick={() => navigate("/system/clinic-manager/packages")}
          >
            <i className="fas fa-briefcase-medical" />
            <div>
              <strong>Quản lý Gói khám</strong>
              <p>Xem và phê duyệt gói khám</p>
            </div>
            <i className="fas fa-chevron-right" />
          </div>

          <div
            className="cm-quick-card"
            onClick={() => navigate("/system/clinic-manager/approvals")}
          >
            <i className="fas fa-clipboard-check" />
            <div>
              <strong>Phê duyệt</strong>
              <p>Xử lý {totalPending} yêu cầu đang chờ</p>
            </div>
            <i className="fas fa-chevron-right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicManagerDashboard;
