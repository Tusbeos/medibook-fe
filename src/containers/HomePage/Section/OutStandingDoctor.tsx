import React, { useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";

import SectionItem from "./SectionItem";
import { FormattedMessage } from "react-intl";
import { path } from "utils";
import { useGetTopDoctorsQuery } from "../../../store/api/publicApi";

interface IOutStandingDoctorProps {
  settings: any;
}

const OutStandingDoctor: React.FC<IOutStandingDoctorProps> = ({ settings }) => {
  const navigate = useNavigate();
  const { data: topDoctorsResponse } = useGetTopDoctorsQuery(10);
  const topDoctors = useMemo(
    () => topDoctorsResponse?.data || [],
    [topDoctorsResponse],
  );

  const handleViewDetailDoctor = useCallback((doctor: any) => {
    navigate(`/detail-doctor/${doctor.id}`);
  }, [navigate]);

  const handleViewAllDoctors = useCallback(() => {
    navigate(path.LIST_TOP_DOCTOR);
  }, [navigate]);

  return (
    <div className="section-share section-os-doctor">
      <div className="booking-container">
        <div className="section-container">
          <div className="section-header">
            <span className="title-section">
              <FormattedMessage id="home-header.top-doctor" />
            </span>
            <button
              className="btn-section"
              onClick={handleViewAllDoctors}
            >
              <FormattedMessage id="home-header.see-more" />
            </button>
          </div>

          <div className="section-body">
            <Slider {...settings}>
              {topDoctors &&
                topDoctors.length > 0 &&
                topDoctors.map((item, index) => (
                  <SectionItem
                    key={index}
                    item={item}
                    onClick={handleViewDetailDoctor}
                    isCircular={true}
                    subTitle="Chuyên khoa"
                  />
                ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutStandingDoctor;
