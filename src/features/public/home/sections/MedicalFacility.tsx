import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getBase64FromBuffer } from "utils/CommonUtils";
import { useGetClinicsQuery } from "store/api/publicApi";

const MedicalFacility: React.FC = () => {
  const navigate = useNavigate();
  const { data: clinicsResponse } = useGetClinicsQuery(6);
  const clinics = useMemo(
    () => (clinicsResponse?.data || []).slice(0, 3),
    [clinicsResponse],
  );

  const handleViewDetailClinic = useCallback(
    (clinic: any) => {
      navigate(`/clinic/detail-clinic/${clinic.id}`);
    },
    [navigate],
  );

  return (
    <section className="section-share section-medical-facility">
      <div className="section-container">
        <div className="section-header">
          <div>
            <span className="title-section">Cơ sở y tế nổi bật</span>
            <div className="section-subtitle">
              Các bệnh viện và phòng khám uy tín với đội ngũ chuyên môn cao
            </div>
          </div>
          <button className="btn-section" type="button" onClick={() => navigate("/clinic")}>
            Xem tất cả <i className="fas fa-arrow-right" />
          </button>
        </div>

        <div className="facility-grid">
          {clinics.map((clinic: any, index: number) => {
            const image = getBase64FromBuffer(clinic.image);
            return (
              <article
                className="facility-card"
                key={clinic.id || index}
                onClick={() => handleViewDetailClinic(clinic)}
              >
                <div
                  className="facility-image"
                  style={{ backgroundImage: image ? `url(${image})` : undefined }}
                />
                <div className="facility-content">
                  <div className="facility-topline">
                    <h3>{clinic.name || "Trung tâm y tế MediBook"}</h3>
                    <span className="facility-badge">
                      {index === 0 ? "Uy tín" : index === 1 ? "Chuyên sâu" : "Nổi bật"}
                    </span>
                  </div>
                  <div className="facility-location">
                    <i className="fas fa-map-marker-alt" />
                    {clinic.address || "Việt Nam"}
                  </div>
                  <div className="facility-foot">
                    <span className="avatar-stack">
                      <span>DR</span>
                      <span>MD</span>
                      <span>+{index + 8}</span>
                    </span>
                    Bác sĩ đang hỗ trợ
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MedicalFacility;
