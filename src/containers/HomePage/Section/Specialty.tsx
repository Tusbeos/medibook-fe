import React, { useCallback, useMemo } from 'react';
import Slider from "react-slick";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router-dom";
import SectionItem from "./SectionItem";
import { useGetSpecialtiesQuery } from "../../../store/api/publicApi";

interface ISpecialtyProps {
  settings: any;
}

// Specialty chuyển sang Function Component + Hooks
const Specialty: React.FC<ISpecialtyProps> = ({ settings }) => {
  const navigate = useNavigate();
  const { data: specialtiesResponse } = useGetSpecialtiesQuery(6);
  const dataSpecialty = useMemo(
    () => specialtiesResponse?.data || [],
    [specialtiesResponse],
  );

  const handleViewDetailSpecialty = useCallback((item: any) => {
    navigate(`/specialty/detail-specialty/${item.id}`);
  }, [navigate]);

  const handleViewAllSpecialty = useCallback(() => {
    navigate(`/specialty`);
  }, [navigate]);

  return (
    <div className="section-share section-specialty">
      <div className="booking-container">
        <div className="section-container">
          <div className="section-header">
            <span className="title-section">
              <FormattedMessage id="home-header.popular-speciality" />
            </span>
            <button
              className="btn-section"
              onClick={handleViewAllSpecialty}
            >
              <FormattedMessage id="home-header.see-more" />
            </button>
          </div>
          <div className="section-body">
            <Slider {...settings}>
              {dataSpecialty &&
                dataSpecialty.length > 0 &&
                dataSpecialty.map((item, index) => (
                  <SectionItem
                    key={index}
                    item={item}
                    isCircular={false}
                    onClick={handleViewDetailSpecialty}
                  />
                ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Specialty;
