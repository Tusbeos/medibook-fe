import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getDoctorsByClinicId } from "../../../services/doctorService";
import { getClinicManagerPackages } from "../../../services/packageService";
import { getClinicBookings } from "../../../services/bookingService";
import { useClinicContext } from "./useClinicContext";
import "./ClinicManagerDashboard.scss";

const getStatusKey = (item: any) =>
  item.statusId || item.status_id || item.statusData?.keyMap || "";

const ClinicManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isClinicManager, selectedClinicId, displayClinicName } =
    useClinicContext();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchData = useCallback(async () => {
    if (!selectedClinicId) return;
    setIsLoading(true);
    try {
      const [dRes, pRes, bRes] = await Promise.all([
        getDoctorsByClinicId(selectedClinicId),
        getClinicManagerPackages(selectedClinicId),
        getClinicBookings(selectedClinicId),
      ]);
      setDoctors(
        dRes?.errCode === 0 && Array.isArray(dRes.data) ? dRes.data : [],
      );
      setPackages(
        pRes?.errCode === 0 && Array.isArray(pRes.data) ? pRes.data : [],
      );
      setBookings(
        bRes?.errCode === 0 && Array.isArray(bRes.data) ? bRes.data : [],
      );
      setLastUpdated(
        new Intl.DateTimeFormat("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date()),
      );
    } catch {
      toast.error("Không thể tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedClinicId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingDoctors = useMemo(
    () => doctors.filter((d) => getStatusKey(d) === "SD1"),
    [doctors],
  );
  const pendingPackages = useMemo(
    () =>
      packages.filter((p) => {
        const sk = getStatusKey(p);
        return sk === "SD1" || !sk;
      }),
    [packages],
  );
  const activePackages = useMemo(
    () => packages.filter((p) => getStatusKey(p) === "SD2").length,
    [packages],
  );
  const totalPending = pendingDoctors.length + pendingPackages.length;
  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.statusId === "S2").length,
    [bookings],
  );

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

  return (
    <div className="cm-dashboard">
      {/* Metrics */}
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
            <strong>{isLoading ? "..." : bookings.length}</strong>
            {pendingBookings > 0 && (
              <span className="cm-chip warning">{pendingBookings} chờ XN</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
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
