import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./VerifyEmail.scss";
import { useVerifyBookingMutation } from "../../store/api/publicApi";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [statusVerify, setStatusVerify] = useState(false);
  const [status, setStatus] = useState("LOADING");
  const [message, setMessage] = useState("");
  const [expiredDoctorId, setExpiredDoctorId] = useState<number>(0);
  const [verifyBooking] = useVerifyBookingMutation();

  useEffect(() => {
    const verifyEmail = async () => {
      if (location && location.search) {
        let urlParams = new URLSearchParams(location.search);
        let token = urlParams.get("token") || "";
        // doctorId từ URL params là string, cần parse sang number cho BE (VerifyBookingRequest.doctorId là Integer)
        let doctorIdRaw = urlParams.get("doctorId");
        let doctorId = doctorIdRaw ? Number(doctorIdRaw) : 0;
        try {
          let res = await verifyBooking({
            token: token,
            doctorId: doctorId,
          }).unwrap();
          if (res && res.errCode === 0) {
            setStatusVerify(true);
            setTimeout(() => {
              setStatus("SUCCEEDED");
            }, 1500);
          } else {
            setStatus("FAILED");
            setMessage("Lỗi xác thực. Vui lòng thử lại sau.");
          }
        } catch (err: any) {
          const serverMsg: string =
            err?.data?.message || err?.data?.errMessage || "";
          if (err?.status === 409 || serverMsg.includes("hết hạn")) {
            setExpiredDoctorId(doctorId);
            setStatus("EXPIRED");
          } else {
            setStatus("FAILED");
            setMessage("Lỗi xác thực. Vui lòng thử lại sau.");
          }
        }
      }
    };
    verifyEmail();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="verify-container">
      <div className="booking-container">
        <div className="verify-card">
          {status === "LOADING" && (
            <div className="status-box loading">
              <div className="spinner"></div>
              <div className="text">Đang xác thực lịch hẹn...</div>
            </div>
          )}
          {status === "SUCCEEDED" && (
            <div className="status-box success">
              <i className="fas fa-check-circle icon-success"></i>
              <div className="title">Xác nhận thành công!</div>
              <div className="text">
                Cảm ơn bạn đã xác nhận. Lịch hẹn của bạn đã được ghi nhận vào hệ
                thống.
              </div>
            </div>
          )}

          {status === "FAILED" && (
            <div className="status-box failed">
              <i className="fas fa-exclamation-triangle icon-failed"></i>
              <div className="title">Xác nhận thất bại!</div>
              <div className="text">
                {message
                  ? message
                  : "Token không hợp lệ hoặc lịch hẹn đã được xác nhận."}
              </div>
            </div>
          )}

          {status === "EXPIRED" && (
            <div className="status-box expired">
              <i className="fas fa-clock icon-expired"></i>
              <div className="title">Quá hạn xác nhận email!</div>
              <div className="text">
                Link xác nhận chỉ có hiệu lực trong <strong>5 phút</strong>.
                <br />
                Vui lòng đặt lịch lại với bác sĩ.
              </div>
              <button
                className="btn-rebook"
                onClick={() =>
                  navigate(`/detail-doctor/${expiredDoctorId}`)
                }
              >
                <i className="fas fa-calendar-plus"></i> Đặt lịch lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
