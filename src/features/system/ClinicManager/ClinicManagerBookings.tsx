import React, { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { DataState } from "components/System/SystemShared";
import {
  useGetClinicBookingsQuery,
  useUpdateClinicBookingStatusMutation,
} from "../../../store/api/publicApi";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_OPTIONS,
  getBookingStatusMeta,
} from "../../../utils/bookingStatus";
import { getApiErrorMessage } from "../../../utils/apiError";
import { useClinicContext } from "./useClinicContext";
import "./ClinicManagerShared.scss";

const ClinicManagerBookings: React.FC = () => {
  const { isClinicManager, selectedClinicId } = useClinicContext();
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [updatingBookingId, setUpdatingBookingId] = useState<number | null>(
    null,
  );
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
    {
      skip: !selectedClinicId,
      pollingInterval: 10_000,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
    },
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
    if (!search.trim()) return bookings;

    const keyword = search.trim().toLowerCase();
    return bookings.filter(
      (booking) =>
        (booking.patientName || "").toLowerCase().includes(keyword) ||
        (booking.profileName || "").toLowerCase().includes(keyword) ||
        (booking.doctorName || "").toLowerCase().includes(keyword) ||
        (booking.patientEmail || "").toLowerCase().includes(keyword),
    );
  }, [bookings, search]);

  const handleFilterChange = useCallback((status: string) => {
    setFilter(status);
    setPage(0);
  }, []);

  const handleConfirm = useCallback(
    async (bookingId: number) => {
      if (!selectedClinicId) return;
      if (!window.confirm("Xác nhận tiếp nhận lịch hẹn này?")) return;

      setUpdatingBookingId(bookingId);
      try {
        await updateBookingStatus({
          bookingId,
          clinicId: selectedClinicId,
          decision: "confirm",
        }).unwrap();
        toast.success("Xác nhận lịch hẹn thành công!");
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Xác nhận lịch hẹn thất bại."),
        );
      } finally {
        setUpdatingBookingId(null);
      }
    },
    [selectedClinicId, updateBookingStatus],
  );

  const handleReject = useCallback(
    async (bookingId: number) => {
      if (!selectedClinicId) return;
      if (
        !window.confirm(
          "Từ chối lịch hẹn sẽ chuyển lịch sang trạng thái không còn hiệu lực. Tiếp tục?",
        )
      ) {
        return;
      }

      setUpdatingBookingId(bookingId);
      try {
        await updateBookingStatus({
          bookingId,
          clinicId: selectedClinicId,
          decision: "reject",
        }).unwrap();
        toast.success("Từ chối lịch hẹn thành công!");
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Từ chối lịch hẹn thất bại."));
      } finally {
        setUpdatingBookingId(null);
      }
    },
    [selectedClinicId, updateBookingStatus],
  );

  const getStatusView = (statusId: string) => {
    const meta = getBookingStatusMeta(statusId);
    const classByTone = {
      warning: "pending-email",
      info: "pending-clinic",
      primary: "ready",
      success: "completed",
      danger: "cancelled",
      neutral: "inactive",
    };

    return {
      label: meta?.label || statusId || "Không rõ",
      className: meta ? classByTone[meta.tone] : classByTone.neutral,
    };
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
            onChange={(event) => setSearch(event.target.value)}
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
          {BOOKING_STATUS_OPTIONS.map((status) => (
            <button
              key={status.id}
              className={filter === status.id ? "active" : ""}
              onClick={() => handleFilterChange(status.id)}
            >
              {status.shortLabel}
            </button>
          ))}
        </div>

        <button
          className="cm-refresh-btn"
          onClick={() => refetchBookings()}
          disabled={isFetching}
        >
          <i className={`fas fa-sync-alt ${isFetching ? "fa-spin" : ""}`} />
          Làm mới
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

        {isLoading && bookings.length === 0 ? (
          <DataState variant="loading" text="Đang tải danh sách lịch hẹn..." />
        ) : isError && bookings.length === 0 ? (
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
          filteredBookings.map((booking) => {
            const status = getStatusView(booking.statusId);
            const isUpdating = updatingBookingId === booking.id;

            return (
              <div
                className="cm-table-row"
                key={booking.id}
                style={{
                  gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1.5fr 1fr",
                }}
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
                <span className={`cm-status ${status.className}`}>
                  <span className="status-dot" />
                  {status.label}
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
                  {booking.statusId ===
                    BOOKING_STATUS.PENDING_CLINIC_CONFIRMATION && (
                    <>
                      <button
                        className="cm-action-btn confirm"
                        onClick={() => handleConfirm(booking.id)}
                        disabled={updatingBookingId !== null}
                        title="Xác nhận lịch hẹn"
                      >
                        <i
                          className={`fas ${
                            isUpdating ? "fa-spinner fa-spin" : "fa-check"
                          }`}
                        />
                      </button>
                      <button
                        className="cm-action-btn reject"
                        onClick={() => handleReject(booking.id)}
                        disabled={updatingBookingId !== null}
                        title="Từ chối lịch hẹn"
                      >
                        <i className="fas fa-times" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
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
