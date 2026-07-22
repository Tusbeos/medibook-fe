import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import HomeHeader from "layout/HomeHeader";
import { IRootState } from "../../../types";
import { LANGUAGES } from "../../../utils";
import "./PatientHistory.scss";
import { useGetPatientHistoryQuery } from "../../../store/api/publicApi";
import { DataState } from "components/System/SystemShared";
import {
  BOOKING_STATUS_OPTIONS,
  BookingStatusId,
  getBookingStatusMeta,
} from "../../../utils/bookingStatus";

interface IHistoryRecord {
  id?: number;
  bookingId: number;
  bookingDate: string;
  timeType: string;
  timeTypeValueVi: string;
  timeTypeValueEn: string;
  statusId: string;
  statusValueVi?: string;
  statusValueEn?: string;
  doctorId: number;
  doctorFirstName: string;
  doctorLastName: string;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  reason: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  // Thông tin người thân (nếu đặt hộ)
  profileId?: number;
  profileFirstName?: string;
  profileLastName?: string;
  profileRelationship?: string;
  createdAt: string;
}

type TabType = "all" | "self" | "relative";

const PatientHistory: React.FC = () => {
  const language = useSelector((state: IRootState) => state.app.language);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatusId>(
    "all",
  );
  const [page, setPage] = useState(0);
  const userId = userInfo?.id || (userInfo as any)?.userId;
  const {
    data: historyResponse,
    isLoading: loading,
    isFetching,
    isError,
    refetch,
  } = useGetPatientHistoryQuery(
    {
      patientId: userId || "",
      page,
      size: 10,
      scope: activeTab,
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    {
      skip: !userId,
      pollingInterval: 30_000,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );
  const histories = useMemo<IHistoryRecord[]>(
    () =>
      historyResponse?.errCode === 0 && Array.isArray(historyResponse.data)
        ? historyResponse.data
        : [],
    [historyResponse],
  );
  const isInitialLoading = loading && histories.length === 0;
  const hasError =
    histories.length === 0 &&
    (isError || (historyResponse != null && historyResponse.errCode !== 0));

  // Chuyển timestamp sang ngày hiển thị
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const parsed = new Date(`${dateStr}T00:00:00`);
    return Number.isNaN(parsed.getTime())
      ? dateStr
      : parsed.toLocaleDateString(language === LANGUAGES.VI ? "vi-VN" : "en-US");
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <HomeHeader isShowBanner={false} />
      <div className="patient-history-container">
        <div className="history-card">
          <div className="history-header">
            <h2>
              <i className="fas fa-file-medical-alt" />
              <FormattedMessage
                id="patient.history.title"
                defaultMessage="Lịch sử khám bệnh"
              />
            </h2>
          </div>

          {/* Tabs lọc: Tất cả / Của tôi / Người thân */}
          <div className="history-tabs">
            <button
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("all");
                setPage(0);
              }}
            >
              <FormattedMessage
                id="patient.history.tab-all"
                defaultMessage="Tất cả"
              />
            </button>
            <button
              className={`tab-btn ${activeTab === "self" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("self");
                setPage(0);
              }}
            >
              <FormattedMessage
                id="patient.history.tab-self"
                defaultMessage="Của tôi"
              />
            </button>
            <button
              className={`tab-btn ${activeTab === "relative" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("relative");
                setPage(0);
              }}
            >
              <i className="fas fa-users" />{" "}
              <FormattedMessage
                id="patient.history.tab-relative"
                defaultMessage="Người thân"
              />
            </button>
          </div>

          <div className="history-filters">
            <label htmlFor="history-status-filter">Trạng thái lịch hẹn</label>
            <select
              id="history-status-filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as "all" | BookingStatusId);
                setPage(0);
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              {BOOKING_STATUS_OPTIONS.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
            {isFetching && !isInitialLoading && (
              <span className="filter-loading" aria-live="polite">
                <i className="fas fa-spinner fa-spin" /> Đang cập nhật
              </span>
            )}
          </div>

          <div className="history-body">
            {isInitialLoading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin" />
                <span>
                  <FormattedMessage
                    id="patient.history.loading"
                    defaultMessage="Đang tải..."
                  />
                </span>
              </div>
            ) : hasError ? (
              <DataState
                variant="error"
                text="Không thể tải lịch sử khám bệnh."
                onRetry={() => void refetch()}
              />
            ) : histories.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-clipboard-list" />
                <p>
                  <FormattedMessage
                    id="patient.history.empty"
                    defaultMessage="Bạn chưa có lịch sử khám bệnh nào"
                  />
                </p>
              </div>
            ) : (
              <div className="history-list">
                {histories.map((record) => {
                  const rowId = record.bookingId;
                  const isExpanded = expandedId === rowId;
                  const doctorName =
                    language === LANGUAGES.VI
                      ? `${record.doctorLastName || ""} ${record.doctorFirstName || ""}`.trim()
                      : `${record.doctorFirstName || ""} ${record.doctorLastName || ""}`.trim();
                  const timeLabel =
                    language === LANGUAGES.VI
                      ? record.timeTypeValueVi
                      : record.timeTypeValueEn;
                  const statusMeta = getBookingStatusMeta(record.statusId);
                  const statusLabel =
                    statusMeta?.label ||
                    (language === LANGUAGES.VI
                      ? record.statusValueVi
                      : record.statusValueEn) ||
                    record.statusId ||
                    "Không rõ";

                  // Tên người được khám (bản thân hoặc người thân)
                  const isForRelative = !!record.profileId;
                  const patientName = isForRelative
                    ? language === LANGUAGES.VI
                      ? `${record.profileLastName || ""} ${record.profileFirstName || ""}`.trim()
                      : `${record.profileFirstName || ""} ${record.profileLastName || ""}`.trim()
                    : language === LANGUAGES.VI
                      ? `${record.patientLastName || ""} ${record.patientFirstName || ""}`.trim()
                      : `${record.patientFirstName || ""} ${record.patientLastName || ""}`.trim();

                  return (
                    <div
                      key={record.bookingId}
                      className={`history-item ${isExpanded ? "expanded" : ""} ${isForRelative ? "for-relative" : ""}`}
                    >
                      <div
                        className="item-summary"
                        onClick={() => toggleExpand(rowId)}
                      >
                        <div className="summary-left">
                          <div className="date-badge">
                            <i className="far fa-calendar-alt" />
                            <span>{formatDate(record.bookingDate)}</span>
                          </div>
                          <div className="doctor-info">
                            <i className="fas fa-user-md" />
                            <span>{doctorName || "—"}</span>
                          </div>
                          {timeLabel && (
                            <div className="time-badge">
                              <i className="far fa-clock" />
                              <span>{timeLabel}</span>
                            </div>
                          )}
                          <div
                            className={`status-badge status-${statusMeta?.tone || "neutral"}`}
                          >
                            <span>{statusLabel}</span>
                          </div>
                          {/* Badge cho người thân */}
                          {isForRelative && (
                            <div className="relative-badge">
                              <i className="fas fa-user-friends" />
                              <span>
                                {patientName}
                                {record.profileRelationship
                                  ? ` (${record.profileRelationship})`
                                  : ""}
                              </span>
                            </div>
                          )}
                        </div>
                        <i
                          className={`fas fa-chevron-down expand-icon ${isExpanded ? "rotated" : ""}`}
                        />
                      </div>

                      {isExpanded && (
                        <div className="item-detail">
                          {/* Người được khám */}
                          <div className="detail-row">
                            <span className="detail-label">
                              <FormattedMessage
                                id="patient.history.patient-name"
                                defaultMessage="Người khám"
                              />
                            </span>
                            <span className="detail-value">
                              {patientName || "—"}
                              {isForRelative && record.profileRelationship && (
                                <span className="relationship-tag">
                                  {" "}
                                  ({record.profileRelationship})
                                </span>
                              )}
                            </span>
                          </div>
                          {record.reason && (
                            <div className="detail-row">
                              <span className="detail-label">
                                <FormattedMessage
                                  id="patient.history.reason"
                                  defaultMessage="Lý do khám"
                                />
                              </span>
                              <span className="detail-value">
                                {record.reason}
                              </span>
                            </div>
                          )}
                          {record.diagnosis && (
                            <div className="detail-row">
                              <span className="detail-label">
                                <FormattedMessage
                                  id="patient.history.diagnosis"
                                  defaultMessage="Chẩn đoán"
                                />
                              </span>
                              <span className="detail-value">
                                {record.diagnosis}
                              </span>
                            </div>
                          )}
                          {record.prescription && (
                            <div className="detail-row">
                              <span className="detail-label">
                                <FormattedMessage
                                  id="patient.history.prescription"
                                  defaultMessage="Đơn thuốc"
                                />
                              </span>
                              <span className="detail-value prescription">
                                {record.prescription}
                              </span>
                            </div>
                          )}
                          {record.notes && (
                            <div className="detail-row">
                              <span className="detail-label">
                                <FormattedMessage
                                  id="patient.history.notes"
                                  defaultMessage="Ghi chú"
                                />
                              </span>
                              <span className="detail-value">
                                {record.notes}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {(historyResponse?.pagination?.totalPages || 0) > 1 && (
                  <div className="history-pagination">
                    <button
                      type="button"
                      disabled={historyResponse?.pagination?.first || isFetching}
                      onClick={() => setPage((current) => Math.max(0, current - 1))}
                    >
                      Trang trước
                    </button>
                    <span>
                      Trang {page + 1}/
                      {historyResponse?.pagination?.totalPages || 1}
                    </span>
                    <button
                      type="button"
                      disabled={historyResponse?.pagination?.last || isFetching}
                      onClick={() => setPage((current) => current + 1)}
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientHistory;

