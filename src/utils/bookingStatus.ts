export const BOOKING_STATUS = {
  PENDING_EMAIL_CONFIRMATION: "S1",
  PENDING_CLINIC_CONFIRMATION: "S2",
  READY_FOR_EXAMINATION: "S3",
  COMPLETED: "S4",
  CANCELLED_OR_REJECTED: "S5",
} as const;

export type BookingStatusId =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export type BookingStatusTone =
  | "warning"
  | "info"
  | "primary"
  | "success"
  | "danger"
  | "neutral";

export type BookingStatusMeta = {
  id: BookingStatusId;
  label: string;
  shortLabel: string;
  tone: BookingStatusTone;
};

export const BOOKING_STATUS_OPTIONS: BookingStatusMeta[] = [
  {
    id: BOOKING_STATUS.PENDING_EMAIL_CONFIRMATION,
    label: "Chờ xác nhận email",
    shortLabel: "Chờ email",
    tone: "warning",
  },
  {
    id: BOOKING_STATUS.PENDING_CLINIC_CONFIRMATION,
    label: "Chờ phòng khám xác nhận",
    shortLabel: "Chờ phòng khám",
    tone: "info",
  },
  {
    id: BOOKING_STATUS.READY_FOR_EXAMINATION,
    label: "Phòng khám đã xác nhận, chờ bác sĩ khám",
    shortLabel: "Chờ bác sĩ khám",
    tone: "primary",
  },
  {
    id: BOOKING_STATUS.COMPLETED,
    label: "Đã khám xong / đã lưu hồ sơ",
    shortLabel: "Đã hoàn tất",
    tone: "success",
  },
  {
    id: BOOKING_STATUS.CANCELLED_OR_REJECTED,
    label: "Đã hủy hoặc bị từ chối",
    shortLabel: "Đã hủy / từ chối",
    tone: "danger",
  },
];

const BOOKING_STATUS_BY_ID = new Map(
  BOOKING_STATUS_OPTIONS.map((status) => [status.id, status]),
);

export const getBookingStatusMeta = (
  statusId?: string | null,
): BookingStatusMeta | null =>
  statusId ? BOOKING_STATUS_BY_ID.get(statusId as BookingStatusId) || null : null;

export const getBookingStatusLabel = (statusId?: string | null) =>
  getBookingStatusMeta(statusId)?.label || statusId || "Không rõ";
