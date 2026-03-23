import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createHistory, getHistoryByBooking } from "../../../services/historyService";
import "./Prescription.scss";

interface RouteParams {
  bookingId: string;
}

const Prescription: React.FC = () => {
  const { bookingId } = useParams<RouteParams>();
  const routerHistory = useHistory();

  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [notes, setNotes] = useState("");
  const [examinationDate, setExaminationDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Load hồ sơ khám đã lưu trước đó (nếu có) để pre-fill form
  useEffect(() => {
    if (!bookingId) {
      setIsFetching(false);
      return;
    }
    const fetchExisting = async () => {
      try {
        const res = await getHistoryByBooking(bookingId);
        if (res && res.errCode === 0 && res.data) {
          const d = res.data;
          setDiagnosis(d.diagnosis || "");
          setPrescription(d.prescription || "");
          setNotes(d.notes || "");
          if (d.examinationDate) setExaminationDate(d.examinationDate);
        }
      } catch (e) {
        // Chưa có hồ sơ → dùng giá trị mặc định
      }
      setIsFetching(false);
    };
    fetchExisting();
  }, [bookingId]);

  const handleSubmit = async () => {
    if (!diagnosis.trim()) {
      toast.warn("Vui lòng nhập chẩn đoán!");
      return;
    }
    setIsLoading(true);
    try {
      const res = await createHistory({
        bookingId: parseInt(bookingId, 10),
        diagnosis,
        prescription,
        notes,
        examinationDate,
      });
      if (res && res.errCode === 0) {
        toast.success("Lưu hồ sơ khám thành công!");
        routerHistory.push("/doctor/manage-patient");
      } else {
        toast.error(res?.message || "Lưu thất bại!");
      }
    } catch (e) {
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại!");
    }
    setIsLoading(false);
  };

  return (
    <div className="prescription-container">
      {/* Header */}
      <div className="prescription-header">
        <button
          className="btn btn-outline-secondary btn-sm back-btn"
          onClick={() => routerHistory.push("/doctor/manage-patient")}
        >
          <i className="fas fa-arrow-left mr-1"></i> Quay lại
        </button>
        <div className="prescription-title">
          <i className="fas fa-notes-medical mr-2"></i>
          Kê đơn &amp; Chẩn đoán
          <span className="booking-id-badge">Lịch hẹn #{bookingId}</span>
        </div>
      </div>

      {isFetching ? (
        <div className="text-center p-5">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      ) : (
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
              onClick={() => routerHistory.push("/doctor/manage-patient")}
              disabled={isLoading}
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
                  <i className="fas fa-save mr-1"></i> Xác nhận hoàn tất
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescription;
