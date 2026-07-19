import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useCreateHistoryMutation,
  useGetHistoryByBookingQuery,
} from "../../../store/api/publicApi";
import { DataState } from "components/System/SystemShared";
import { getApiErrorMessage } from "../../../utils/apiError";
import "./Prescription.scss";

const Prescription: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDateValue = Number(
    (location.state as { selectedDateValue?: number } | null)
      ?.selectedDateValue,
  );

  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [notes, setNotes] = useState("");
  const [examinationDate, setExaminationDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useGetHistoryByBookingQuery(bookingId || "", {
    skip: !bookingId,
    refetchOnMountOrArgChange: true,
  });
  const [createHistory, { isLoading }] = useCreateHistoryMutation();

  // Load hồ sơ khám đã lưu trước đó (nếu có) để pre-fill form
  useEffect(() => {
    if (historyResponse?.errCode !== 0 || !historyResponse.data) return;

    const d = historyResponse.data;
    setDiagnosis(d.diagnosis || "");
    setPrescription(d.prescription || "");
    setNotes(d.notes || "");
    if (d.examinationDate) setExaminationDate(d.examinationDate);
  }, [historyResponse]);

  const hasExistingHistory =
    historyResponse?.errCode === 0 && !!historyResponse.data;
  const isInitialLoading = isHistoryLoading && !historyResponse;

  const navigateBack = () =>
    navigate("/doctor/manage-patient", {
      state: Number.isFinite(selectedDateValue)
        ? { selectedDateValue }
        : undefined,
    });

  const handleSubmit = async () => {
    const parsedBookingId = Number(bookingId);
    if (!Number.isFinite(parsedBookingId)) {
      toast.error("Lịch hẹn không hợp lệ!");
      return;
    }
    if (!diagnosis.trim()) {
      toast.warn("Vui lòng nhập chẩn đoán!");
      return;
    }
    try {
      const res = await createHistory({
        bookingId: parsedBookingId,
        diagnosis,
        prescription,
        notes,
        examinationDate,
      }).unwrap();
      if (res && res.errCode === 0) {
        toast.success("Lưu hồ sơ khám thành công!");
        navigateBack();
      } else {
        toast.error(res?.errMessage || "Lưu thất bại!");
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Đã có lỗi xảy ra, vui lòng thử lại!",
        ),
      );
    }
  };

  return (
    <div className="prescription-container">
      {/* Header */}
      <div className="prescription-header">
        <button
          className="btn btn-outline-secondary btn-sm back-btn"
          onClick={navigateBack}
        >
          <i className="fas fa-arrow-left mr-1"></i> Quay lại
        </button>
        <div className="prescription-title">
          <i className="fas fa-notes-medical mr-2"></i>
          Kê đơn &amp; Chẩn đoán
          <span className="booking-id-badge">Lịch hẹn #{bookingId}</span>
        </div>
      </div>

      {isInitialLoading ? (
        <DataState variant="loading" text="Đang tải hồ sơ khám..." />
      ) : (
        <>
          {isHistoryError && (
            <DataState
              variant="error"
              text="Không thể kiểm tra hồ sơ khám đã lưu. Hãy tải lại trước khi lưu để tránh ghi đè dữ liệu."
              onRetry={() => void refetchHistory()}
              compact
            />
          )}
          <div className="prescription-card">
          {/* Ngày khám */}
          <div className="form-group">
            <label className="prescription-label">
              <i className="fas fa-calendar-alt mr-2"></i>
              Ngày khám <span className="required-star">*</span>
            </label>
            <input
              type="date"
              className="form-control prescription-input"
              value={examinationDate}
              onChange={(e) => setExaminationDate(e.target.value)}
            />
          </div>

          {/* Chẩn đoán */}
          <div className="form-group">
            <label className="prescription-label">
              <i className="fas fa-stethoscope mr-2"></i>
              Chẩn đoán <span className="required-star">*</span>
            </label>
            <textarea
              className="form-control prescription-textarea"
              rows={4}
              placeholder="Nhập chẩn đoán bệnh của bệnh nhân..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          {/* Đơn thuốc */}
          <div className="form-group">
            <label className="prescription-label">
              <i className="fas fa-pills mr-2"></i>
              Đơn thuốc / Phác đồ điều trị
            </label>
            <textarea
              className="form-control prescription-textarea"
              rows={6}
              placeholder="Nhập đơn thuốc hoặc phác đồ điều trị (tên thuốc, liều lượng, số ngày dùng)..."
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
            />
          </div>

          {/* Ghi chú */}
          <div className="form-group">
            <label className="prescription-label">
              <i className="fas fa-sticky-note mr-2"></i>
              Ghi chú thêm
            </label>
            <textarea
              className="form-control prescription-textarea"
              rows={3}
              placeholder="VD: Tái khám sau 2 tuần, kiêng ăn đồ cay..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="prescription-actions">
            <button
              className="btn btn-secondary mr-3"
              onClick={navigateBack}
              disabled={isLoading || isHistoryError}
            >
              <i className="fas fa-times mr-1"></i> Hủy
            </button>
            <button
              className="btn btn-primary btn-confirm"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i> Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-1"></i>{" "}
                  {hasExistingHistory
                    ? "Cập nhật hồ sơ"
                    : "Xác nhận hoàn tất"}
                </>
              )}
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Prescription;
