import React, { useState, useEffect, useCallback } from 'react';
import Slider from "react-slick";
import { FormattedMessage } from "react-intl";
import { handleGetAllSpecialties } from "../../../services/specialtyService";
import { useNavigate } from "react-router-dom";
import SectionItem from "./SectionItem";

interface ISpecialtyProps {
  settings: any;
}

// Specialty chuyển sang Function Component + Hooks
const Specialty: React.FC<ISpecialtyProps> = ({ settings }) => {
  const navigate = useNavigate();
  const [dataSpecialty, setDataSpecialty] = useState<any[]>([]);

  useEffect(() => {
    const getAllSpecialties = async () => {
      let res = await handleGetAllSpecialties(6);
      if (res && res.errCode === 0) {
        setDataSpecialty(res.data ? res.data : []);
      }
    };
    getAllSpecialties();
  }, []);

  const handleViewDetailSpecialty = useCallback((item: any) => {
    navigate(`/specialty/detail-specialty/${item.id}`);
  }, [history]);

  const handleViewAllSpecialty = useCallback(() => {
    navigate(`/specialty`);
  }, [history]);

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