import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getBase64FromBuffer } from "utils/CommonUtils";
import { useGetSpecialtiesQuery } from "store/api/publicApi";

const fallbackNames = [
  "Tiêu hóa",
  "Thần kinh",
  "Cơ xương khớp",
  "Tim mạch",
  "Da liễu",
  "Nhi khoa",
];

const Specialty: React.FC = () => {
  const navigate = useNavigate();
  const { data: specialtiesResponse } = useGetSpecialtiesQuery(4);
  const specialties = useMemo(() => {
    const data = specialtiesResponse?.data || [];
    return data.length
      ? data.slice(0, 4)
      : fallbackNames.slice(0, 4).map((name, index) => ({ id: index + 1, name }));
  }, [specialtiesResponse]);

  const handleViewDetailSpecialty = useCallback(
    (item: any) => {
      if (item?.id) navigate(`/specialty/detail-specialty/${item.id}`);
    },
    [navigate],
  );

  return (
    <section className="section-share section-specialty">
      <div className="section-container">
        <div className="section-header">
          <div>
            <span className="title-section">Chuyên khoa phổ biến</span>
            <div className="section-subtitle">
              Tiếp cận nhanh các chuyên khoa được đặt lịch nhiều nhất
            </div>
          </div>
          <button className="btn-section" type="button" onClick={() => navigate("/specialty")}>
            Xem tất cả <i className="fas fa-arrow-right" />
          </button>
        </div>

        <div className="specialty-grid">
          {specialties.map((item: any, index: number) => {
            const image = getBase64FromBuffer(item.image);
            return (
              <button
                className="specialty-tile"
                type="button"
                key={item.id || index}
                onClick={() => handleViewDetailSpecialty(item)}
              >
                <span
                  className="tile-image"
                  style={{ backgroundImage: image ? `url(${image})` : undefined }}
                >
                  {!image && <i className="fas fa-stethoscope" />}
                </span>
                <span className="tile-name">
                  {item.name || fallbackNames[index]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Specialty;
