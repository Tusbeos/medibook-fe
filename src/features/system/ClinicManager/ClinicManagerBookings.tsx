import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  confirmClinicBooking,
  rejectClinicBooking,
} from "../../../services/bookingService";
import { useClinicContext } from "./useClinicContext";
import "./ClinicManagerShared.scss";
import { useGetClinicBookingsQuery } from "../../../store/api/publicApi";

const ClinicManagerBookings: React.FC = () => {
  const { isClinicManager, selectedClinicId } = useClinicContext();
  const {
    data: bookingsResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchBookings,
  } = useGetClinicBookingsQuery(
    { clinicId: selectedClinicId },
    { skip: !selectedClinicId },
  );
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const bookings = useMemo(
    () =>
      bookingsResponse?.errCode === 0 && Array.isArray(bookingsResponse.data)
        ? bookingsResponse.data
        : [],
    [bookingsResponse],
  );

  useEffect(() => {
    if (isError) {
      toast.error("Không thể tải danh sách lịch hẹn.");
    }
  }, [isError]);

  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (filter) {
      list = list.filter((b) => b.statusId === filter);
    }
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          (b.patientName || "").toLowerCase().includes(kw) ||
          (b.profileName || "").toLowerCase().includes(kw) ||
          (b.doctorName || "").toLowerCase().includes(kw) ||
          (b.patientEmail || "").toLowerCase().includes(kw),
      );
    }
    return list;
  }, [bookings, filter, search]);

  const handleConfirm = useCallback(
    async (bookingId: number) => {
      if (!selectedClinicId) return;

      try {
        await confirmClinicBooking(bookingId, selectedClinicId);
        toast.success("Xác nhận lịch hẹn thành công!");
        refetchBookings();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Xác nhận thất bại.");
      }
    },
    [refetchBookings, selectedClinicId],
  );

  const handleReject = useCallback(
    async (bookingId: number) => {
      if (!selectedClinicId) return;

      try {
        await rejectClinicBooking(bookingId, selectedClinicId);
        toast.success("Từ chối lịch hẹn thành công!");
        refetchBookings();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Từ chối thất bại.");
      }
    },
    [refetchBookings, selectedClinicId],
  );

  const getStatusClass = (statusId: string) => {
    switch (statusId) {
      case "S1":
        return "pending";
      case "S2":
        return "verified";
      case "S3":
        return "confirmed";
      case "S5":
        return "rejected";
      default:
        return "inactive";
    }
  };

  const counts = useMemo(
    () => ({
      all: bookings.length,
      S1: bookings.filter((b) => b.statusId === "S1").length,
      S2: bookings.filter((b) => b.statusId === "S2").length,
      S3: bookings.filter((b) => b.statusId === "S3").length,
    }),
    [bookings],
  );

  if (!isClinicManager || !selectedClinicId) {
    return (
      <div className="cm-page">
        <div className="cm-empty">
          <i className="fas fa-lock" />
          Bạn không có quyền truy cập trang này.
        </div>
      </div>
    );
  }

  return (
    <div className="cm-page">
      <div className="cm-toolbar">
        <div className="cm-search">
          <i className="fas fa-search" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bệnh nhân, bác sĩ, email..."
          />
        </div>

        <div className="cm-filter-tabs">
          <button
            className={filter === "" ? "active" : ""}
            onClick={() => setFilter("")}
          >
            Tất cả ({counts.all})
          </button>
          <button
            className={filter === "S2" ? "active" : ""}
            onClick={() => setFilter("S2")}
          >
            Chờ xác nhận ({counts.S2})
          </button>
          <button
            className={filter === "S3" ? "active" : ""}
            onClick={() => setFilter("S3")}
          >
            Đã xác nhận ({counts.S3})
          </button>
          <button
            className={filter === "S1" ? "active" : ""}
            onClick={() => setFilter("S1")}
          >
            Chờ email ({counts.S1})
          </button>
        </div>

        <button
          className="cm-refresh-btn"
          onClick={() => refetchBookings()}
          disabled={isFetching}
        >
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>

      <div className="cm-table">
        <div
          className="cm-table-header"
          style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1.5fr 1fr" }}
        >
          <span>Bệnh nhân</span>
          <span>Bác sĩ</span>
          <span>Ngày khám</span>
          <span>Giờ khám</span>
          <span>Trạng thái</span>
          <span>Lý do</span>
          <span>Hành động</span>
        </div>

        {isLoading || isFetching ? (
          <div className="cm-empty">Đang tải...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="cm-empty">
            <i className="fas fa-calendar-times" />
            Chưa có lịch hẹn nào.
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              className="cm-table-row"
              key={booking.id}
              style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1.5fr 1fr" }}
            >
              <div className="cm-name-cell">
                <div className="cm-avatar">
                  {(booking.profileName || booking.patientName || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="cm-name-info">
                  <strong>
                    {booking.profileName || booking.patientName || "N/A"}
                  </strong>
                  <small>{booking.patientEmail}</small>
                </div>
              </div>
              <span>{booking.doctorName || "N/A"}</span>
              <span>{booking.date}</span>
              <span>{booking.timeTypeValue || booking.timeType}</span>
              <span className={`cm-status ${getStatusClass(booking.statusId)}`}>
                <span className="status-dot" />
                {booking.statusValue || booking.statusId}
              </span>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {booking.reason || "-"}
              </span>
              <div className="cm-actions-cell">
                {booking.statusId === "S2" && (
                  <>
                    <button
                      className="cm-action-btn confirm"
                      onClick={() => handleConfirm(booking.id)}
                    >
                      <i className="fas fa-check" />
                    </button>
                    <button
                      className="cm-action-btn reject"
                      onClick={() => handleReject(booking.id)}
                    >
                      <i className="fas fa-times" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClinicManagerBookings;
