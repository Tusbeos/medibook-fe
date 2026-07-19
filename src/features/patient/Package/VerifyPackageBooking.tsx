import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import HomeFooter from "layout/HomeFooter";
import HomeHeader from "layout/HomeHeader";
import { getApiErrorMessage } from "utils";
import { useVerifyPackageBookingMutation } from "store/api/publicApi";
import type { PackageBookingRecord } from "store/api/publicApi";
import "./VerifyPackageBooking.scss";

type VerifyStatus = "LOADING" | "SUCCESS" | "EXPIRED" | "FAILED";

const VerifyPackageBooking = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const packageId = Number(searchParams.get("packageId"));
  const validParams = Boolean(token) && Number.isInteger(packageId) && packageId > 0;
  const [status, setStatus] = useState<VerifyStatus>(validParams ? "LOADING" : "FAILED");
  const [message, setMessage] = useState(
    validParams ? "" : "Link xác nhận thiếu token hoặc mã gói khám.",
  );
  const [booking, setBooking] = useState<PackageBookingRecord | null>(null);
  const attemptedKeyRef = useRef("");
  const [verifyPackageBooking] = useVerifyPackageBookingMutation();

  useEffect(() => {
    if (!validParams) return;
    const requestKey = `${packageId}:${token}`;
    if (attemptedKeyRef.current === requestKey) return;
    attemptedKeyRef.current = requestKey;
    setStatus("LOADING");
    setMessage("");
    setBooking(null);

    const verify = async () => {
      try {
        const response = await verifyPackageBooking({ token, packageId }).unwrap();
        if (response.errCode !== 0 || !response.data) throw response;
        setBooking(response.data);
        setStatus("SUCCESS");
      } catch (error: any) {
        const serverMessage = getApiErrorMessage(
          error,
          "Không thể xác nhận yêu cầu đặt gói.",
        );
        const normalizedMessage = serverMessage.toLocaleLowerCase("vi");
        if (error?.status === 409 && normalizedMessage.includes("hết hạn")) {
          setStatus("EXPIRED");
          setMessage(serverMessage);
        } else {
          setStatus("FAILED");
          setMessage(serverMessage);
        }
      }
    };

    void verify();
  }, [packageId, token, validParams, verifyPackageBooking]);

  return (
    <div className="verify-package-page">
      <HomeHeader isShowBanner={false} />
      <main className="booking-container verify-package-main">
        <section className={`verify-package-card ${status.toLocaleLowerCase()}`}>
          {status === "LOADING" && (
            <>
              <div className="verify-spinner" aria-hidden="true" />
              <h1>Đang xác nhận yêu cầu</h1>
              <p>Vui lòng giữ nguyên trang trong giây lát.</p>
            </>
          )}

          {status === "SUCCESS" && (
            <>
              <i className="fas fa-check-circle status-icon" />
              <h1>Xác nhận email thành công</h1>
              <p>
                Yêu cầu đặt gói của bạn đã được chuyển tới phòng khám. Phòng khám sẽ
                liên hệ để xác nhận lịch chính thức.
              </p>
              {booking && (
                <dl>
                  <div><dt>Mã yêu cầu</dt><dd>#{booking.id}</dd></div>
                  <div><dt>Gói khám</dt><dd>{booking.packageName}</dd></div>
                  <div><dt>Phòng khám</dt><dd>{booking.clinicName}</dd></div>
                  <div><dt>Ngày mong muốn</dt><dd>{booking.desiredDate}</dd></div>
                </dl>
              )}
              <div className="verify-actions">
                <Link to={`/package/detail-package/${packageId}`}>Xem lại gói khám</Link>
                <Link className="secondary" to="/home">Về trang chủ</Link>
              </div>
            </>
          )}

          {status === "EXPIRED" && (
            <>
              <i className="fas fa-clock status-icon" />
              <h1>Link xác nhận đã hết hạn</h1>
              <p>{message || "Link chỉ có hiệu lực trong 30 phút."}</p>
              <Link to={`/booking-package/${packageId}`}>Tạo yêu cầu đặt gói mới</Link>
            </>
          )}

          {status === "FAILED" && (
            <>
              <i className="fas fa-exclamation-triangle status-icon" />
              <h1>Không thể xác nhận</h1>
              <p>{message || "Link không hợp lệ hoặc yêu cầu đã được xác nhận trước đó."}</p>
              <div className="verify-actions">
                {Number.isInteger(packageId) && packageId > 0 && (
                  <Link to={`/package/detail-package/${packageId}`}>Xem gói khám</Link>
                )}
                <Link className="secondary" to="/package">Danh sách gói khám</Link>
              </div>
            </>
          )}
        </section>
      </main>
      <HomeFooter />
    </div>
  );
};

export default VerifyPackageBooking;
