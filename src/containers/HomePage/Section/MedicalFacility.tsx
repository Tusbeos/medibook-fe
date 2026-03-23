import React, { useState, useEffect, useCallback } from 'react';
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { handleGetAllClinics } from "../../../services/clinicService";
import SectionItem from "./SectionItem";

interface IMedicalFacilityProps {
  settings: any;
}

// MedicalFacility chuyển sang Function Component + Hooks
const MedicalFacility: React.FC<IMedicalFacilityProps> = ({ settings }) => {
  const navigate = useNavigate();
  const [dataClinics, setDataClinics] = useState<any[]>([]);

  useEffect(() => {
    const getAllClinics = async () => {
      let res = await handleGetAllClinics(6);
      if (res && res.errCode === 0) {
        setDataClinics(res.data ? res.data : []);
      }
    };
    getAllClinics();
  }, []);

  const handleViewDetailClinic = useCallback((clinic: any) => {
    navigate(`/clinic/detail-clinic/${clinic.id}`);
  }, [history]);

  const handleClinicClick = useCallback(() => {
    navigate("/clinic");
  }, [history]);

  return (
    <div className="section-share section-medical-facility">
      <div className="booking-container">
        <div className="section-container">
          <div className="section-header">
            <span className="title-section">
              <FormattedMessage id="home-header.medical-facility" />
            </span>
            <button className="btn-section" onClick={handleClinicClick}>
              <FormattedMessage id="home-header.see-more" />
            </button>
          </div>
          <div className="section-body">
            <Slider {...settings}>
              {dataClinics &&
                dataClinics.length > 0 &&
                dataClinics.map((item, index) => (
                  <SectionItem
                    key={index}
                    item={item}
                    isCircular={false}
                    onClick={handleViewDetailClinic}
                  />
                ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalFacility;