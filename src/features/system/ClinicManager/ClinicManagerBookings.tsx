import React, { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useClinicContext } from "./useClinicContext";
import "./ClinicManagerShared.scss";
import {
  useGetClinicBookingsQuery,
  useUpdateClinicBookingStatusMutation,
} from "../../../store/api/publicApi";
import { DataState } from "components/System/SystemShared";

const ClinicManagerBookings: React.FC = () => {
  const { isClinicManager, selectedClinicId } = useClinicContext();
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const {
    data: bookingsResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchBookings,
  } = useGetClinicBookingsQuery(
    {
      clinicId: selectedClinicId,
      status: filter || undefined,
      page,
      size: 10,
    },
    { skip: !selectedClinicId },
  );
  const [updateBookingStatus] = useUpdateClinicBookingStatusMutation();

  const bookings = useMemo(
    () =>
      bookingsResponse?.errCode === 0 && Array.isArray(bookingsResponse.data)
        ? bookingsResponse.data
        : [],
    [bookingsResponse],
  );

  const filteredBookings = useMemo(() => {
    let list = bookings;
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
  }, [bookings, search]);

  const handleFilterChange = useCallback((status: string) => {
    setFilter(status);
    setPage(0);
  }, []);

  const handleConfirm = useCallback(
    async (bookingId: number) => {
      if (!selectedClinicId) return;

      try {
        await updateBookingStatus({
          bookingId,
          clinicId: selectedClinicId,
          decision: "confirm",
        }).unwrap();
        toast.success("Xác nhận lịch hẹn thành công!");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Xác nhận thất bại.");
      }
    },
    [selectedClinicId, updateBookingStatus],
  );

  const handleReject = useCallback(
    async (bookingId: number) => {
      if (!selectedClinicId) return;

      try {
        await updateBookingStatus({
          bookingId,
          clinicId: selectedClinicId,
          decision: "reject",
        }).unwrap();
        toast.success("Từ chối lịch hẹn thành công!");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Từ chối thất bại.");
      }
    },
    [selectedClinicId, updateBookingStatus],
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
            onClick={() => handleFilterChange("")}
          >
            Tất cả
          </button>
          <button
            className={filter === "S2" ? "active" : ""}
            onClick={() => handleFilterChange("S2")}
          >
            Chờ xác nhận
          </button>
          <button
            className={filter === "S3" ? "active" : ""}
            onClick={() => handleFilterChange("S3")}
          >
            Đã xác nhận
          </button>
          <button
            className={filter === "S1" ? "active" : ""}
            onClick={() => handleFilterChange("S1")}
          >
            Chờ email
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
          <DataState variant="loading" text="Đang tải danh sách lịch hẹn..." />
        ) : isError ? (
          <DataState
            variant="error"
            text="Không thể tải danh sách lịch hẹn."
            onRetry={() => void refetchBookings()}
          />
        ) : filteredBookings.length === 0 ? (
          <DataState
            variant="empty"
            text={
              bookings.length > 0
                ? "Không có lịch hẹn phù hợp với bộ lọc."
                : "Chưa có lịch hẹn nào."
            }
          />
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
      {(bookingsResponse?.pagination?.totalPages || 0) > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 py-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={bookingsResponse?.pagination?.first || isFetching}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Trang trước
          </button>
          <span>
            Trang {page + 1}/{bookingsResponse?.pagination?.totalPages || 1}
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={bookingsResponse?.pagination?.last || isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ClinicManagerBookings;
