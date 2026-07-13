import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetDoctorsByClinicIdQuery,
  useReviewClinicManagerDoctorMutation,
} from "../../../store/api/publicApi";
import { DataState } from "components/System/SystemShared";
import { useClinicContext } from "./useClinicContext";
import "./ClinicManagerShared.scss";

const ClinicManagerReviewDoctor: React.FC = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId: string }>();
  const { isClinicManager, selectedClinicId, displayClinicName } =
    useClinicContext();
  const [reviewNote, setReviewNote] = useState("");

  const {
    data: doctorsResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchDoctors,
  } = useGetDoctorsByClinicIdQuery(selectedClinicId, {
    skip: !selectedClinicId || !doctorId,
  });
  const [reviewDoctor] = useReviewClinicManagerDoctorMutation();

  const doctors = useMemo(
    () =>
      doctorsResponse?.errCode === 0 && Array.isArray(doctorsResponse.data)
        ? doctorsResponse.data
        : [],
    [doctorsResponse],
  );

  const doctor = useMemo(
    () => doctors.find((d: any) => String(d.id) === String(doctorId)) || null,
    [doctorId, doctors],
  );

  const handleApprove = async () => {
    try {
      await reviewDoctor({
        doctorId: doctorId!,
        decision: "approve",
        reviewNote: reviewNote || undefined,
      }).unwrap();
      toast.success("Phê duyệt bác sĩ thành công!");
      navigate("/system/clinic-manager/doctors");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Phê duyệt thất bại.");
    }
  };

  const handleReject = async () => {
    if (!reviewNote.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối.");
      return;
    }
    try {
      await reviewDoctor({
        doctorId: doctorId!,
        decision: "reject",
        reviewNote,
      }).unwrap();
      toast.success("Từ chối bác sĩ thành công!");
      navigate("/system/clinic-manager/doctors");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Từ chối thất bại.");
    }
  };

  if (!isClinicManager || !selectedClinicId) {
    return (
      <div className="cm-page">
        <div className="cm-empty">
          <i className="fas fa-lock" />
          Bạn không có quyền truy cập.
        </div>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="cm-page">
        <DataState variant="loading" text="Đang tải thông tin bác sĩ..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="cm-page">
        <DataState
          variant="error"
          text="Không thể tải thông tin bác sĩ."
          onRetry={() => void refetchDoctors()}
        />
        <button
          className="cm-action-btn review"
          onClick={() => navigate("/system/clinic-manager/doctors")}
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="cm-page">
        <DataState
          variant="empty"
          text="Không tìm thấy bác sĩ trong cơ sở y tế này."
        />
        <button
          className="cm-action-btn review"
          onClick={() => navigate("/system/clinic-manager/doctors")}
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  const name =
    `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() || "N/A";

  return (
    <div className="cm-page">
      <div style={{ marginBottom: 16 }}>
        <button
          className="cm-action-btn review"
          onClick={() => navigate("/system/clinic-manager/doctors")}
          style={{ padding: "8px 12px" }}
        >
          <i className="fas fa-arrow-left" /> Quay lại
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginTop: 24,
        }}
      >
        <div>
          {/* Info card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: 24,
              marginBottom: 20,
            }}
          >
            <h3 style={{ margin: "0 0 16px", color: "#1e293b" }}>
              <i
                className="far fa-user"
                style={{ marginRight: 8, color: "#6366f1" }}
              />
              Thông tin yêu cầu
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <small style={{ color: "#64748b" }}>Bác sĩ</small>
                <strong style={{ display: "block" }}>{name}</strong>
              </div>
              <div>
                <small style={{ color: "#64748b" }}>Cơ sở y tế</small>
                <strong style={{ display: "block" }}>
                  {doctor.clinicName || displayClinicName}
                </strong>
              </div>
              <div>
                <small style={{ color: "#64748b" }}>Email</small>
                <strong style={{ display: "block" }}>
                  {doctor.email || "Chưa cập nhật"}
                </strong>
              </div>
              <div>
                <small style={{ color: "#64748b" }}>Chuyên khoa</small>
                <strong style={{ display: "block" }}>
                  {doctor.specialtyName || "Chưa phân chuyên khoa"}
                </strong>
              </div>
            </div>
          </div>

          {/* Description */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: 24,
            }}
          >
            <h3 style={{ margin: "0 0 16px", color: "#1e293b" }}>
              <i
                className="far fa-file-alt"
                style={{ marginRight: 8, color: "#6366f1" }}
              />
              Nội dung đăng ký
            </h3>
            <p style={{ color: "#475569", lineHeight: 1.6 }}>
              Bác sĩ {name} đang chờ được phê duyệt để hoạt động tại{" "}
              {doctor.clinicName || displayClinicName}. Vui lòng kiểm tra thông
              tin chuyên khoa, tài khoản và trạng thái trước khi phê duyệt.
            </p>
          </div>
        </div>

        {/* Action panel */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: 24,
            height: "fit-content",
          }}
        >
          <h3 style={{ margin: "0 0 16px", color: "#1e293b" }}>Hành động</h3>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: "0.875rem",
              color: "#64748b",
            }}
          >
            Ghi chú phê duyệt
          </label>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Nhập lý do từ chối hoặc ghi chú (bắt buộc khi từ chối)..."
            style={{
              width: "100%",
              minHeight: 100,
              padding: 12,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: "0.875rem",
              resize: "vertical",
              marginBottom: 16,
            }}
          />
          <button
            className="cm-action-btn approve"
            onClick={handleApprove}
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 8,
              fontSize: "0.875rem",
            }}
          >
            <i className="far fa-check-circle" style={{ marginRight: 6 }} />
            Phê duyệt
          </button>
          <button
            className="cm-action-btn reject"
            onClick={handleReject}
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 8,
              fontSize: "0.875rem",
            }}
          >
            <i className="far fa-times-circle" style={{ marginRight: 6 }} />
            Từ chối
          </button>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 12 }}>
            Hành động này sẽ cập nhật trạng thái bác sĩ và làm mới danh sách yêu
            cầu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClinicManagerReviewDoctor;
