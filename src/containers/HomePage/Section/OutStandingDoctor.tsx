import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";

import * as actions from "../../../store/actions";
import SectionItem from "./SectionItem";
import { FormattedMessage } from "react-intl";
import { path } from "utils";
import { IRootState } from "../../../types";

interface IOutStandingDoctorProps {
  settings: any;
}

const OutStandingDoctor: React.FC<IOutStandingDoctorProps> = ({ settings }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const topDoctors = useSelector((state: IRootState) => state.admin.topDoctors);

  useEffect(() => {
    dispatch(actions.fetchTopDoctorStart());
  }, [dispatch]);

  const handleViewDetailDoctor = useCallback((doctor: any) => {
    navigate(`/detail-doctor/${doctor.id}`);
  }, [history]);

  const handleViewAllDoctors = useCallback(() => {
    navigate(path.LIST_TOP_DOCTOR);
  }, [history]);

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