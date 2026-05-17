import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getBase64FromBuffer } from "utils/CommonUtils";
import { LANGUAGES } from "utils";
import { useSelector } from "react-redux";
import { IRootState } from "types";
import { useGetTopDoctorsQuery } from "store/api/publicApi";

const OutStandingDoctor: React.FC = () => {
  const navigate = useNavigate();
  const language = useSelector((state: IRootState) => state.app.language);
  const { data: topDoctorsResponse } = useGetTopDoctorsQuery(10);
  const doctors = useMemo(
    () => (topDoctorsResponse?.data || []).slice(0, 4),
    [topDoctorsResponse],
  );

  const handleViewDetailDoctor = useCallback(
    (doctor: any) => {
      navigate(`/detail-doctor/${doctor.id}`);
    },
    [navigate],
  );

  const getDoctorName = (doctor: any) => {
    const position =
      language === LANGUAGES.VI
        ? doctor.positionData?.valueVi
        : doctor.positionData?.valueEn;
    const firstName = doctor.firstName || "";
    const lastName = doctor.lastName || "";
    return `${position || "Dr."} ${lastName} ${firstName}`.trim();
  };

  return (
    <section className="section-share section-os-doctor">
      <div className="section-container">
        <div className="section-header">
          <div>
            <span className="title-section">Bác sĩ nổi bật</span>
            <div className="section-subtitle">
              Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm và luôn đặt người bệnh
              làm trung tâm.
            </div>
          </div>
        </div>

        <div className="doctor-grid">
          {doctors.map((doctor: any, index: number) => {
            const image = getBase64FromBuffer(doctor.image);
            return (
              <article
                className="doctor-profile-card"
                key={doctor.id || index}
                onClick={() => handleViewDetailDoctor(doctor)}
              >
                <div
                  className="doctor-photo"
                  style={{ backgroundImage: image ? `url(${image})` : undefined }}
                >
                  <span className="doctor-rating">
                    <i className="fas fa-star" />
                    {(4.8 + (index % 2) * 0.1).toFixed(1)} ({120 + index * 18} đánh giá)
                  </span>
                </div>
                <h3>{getDoctorName(doctor)}</h3>
                <div className="doctor-specialty">
                  {doctor.DoctorInfo?.specialtyData?.name || "Chuyên khoa"}
                </div>
                <div className="doctor-note">
                  {index === 0
                    ? "Hơn 15 năm kinh nghiệm"
                    : index === 1
                      ? "Đào tạo chuyên sâu"
                      : index === 2
                        ? "Chăm sóc chuyên biệt"
                        : "Chuyên gia điều trị"}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OutStandingDoctor;
