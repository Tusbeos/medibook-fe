import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import HomeHeader from "layout/HomeHeader";
import HomeFooter from "layout/HomeFooter";
import Breadcrumb from "components/Breadcrumb";
import "./DetailDoctor.scss";
import { LANGUAGES } from "utils";
import DoctorSchedules from "./DoctorSchedules";
import DoctorExtraInfo from "./DoctorExtraInfo";
import { IRootState } from "../../../types";
import { useGetDoctorByIdQuery } from "../../../store/api/publicApi";

const DetailDoctor = () => {
  const { id } = useParams<{ id: string }>();
  const language = useSelector((state: IRootState) => state.app.language);
  const { data: doctorResponse } = useGetDoctorByIdQuery(id || "", { skip: !id });
  const detailDoctor = doctorResponse?.errCode === 0 && doctorResponse.data
    ? doctorResponse.data
    : { image: "", positionData: {} };

  const buildDoctorName = useCallback(
    (doctor: any) => {
      if (doctor && doctor.positionData) {
        let nameVi = `${doctor.positionData.valueVi}, ${
          doctor.roleData?.valueVi || ""
        } ${doctor.lastName} ${doctor.firstName}`;
        let nameEn = `${doctor.positionData.valueEn}, ${
          doctor.roleData?.valueEn || ""
        } ${doctor.firstName} ${doctor.lastName}`;
        return language === LANGUAGES.VI ? nameVi : nameEn;
      }
      return "";
    },
    [language]
  );

  const breadcrumbItems = [
    {
      label: language === LANGUAGES.VI ? "Trang chủ" : "Home",
      to: "/home",
    },
    {
      label: language === LANGUAGES.VI ? "Bác sĩ" : "Doctor",
      to: "/top-doctor",
    },
    {
      label:
        buildDoctorName(detailDoctor) ||
        (language === LANGUAGES.VI ? "Chi tiết bác sĩ" : "Doctor Detail"),
    },
  ];

  return (
    <>
      <HomeHeader isShowBanner={false} />
      <Breadcrumb
        items={breadcrumbItems}
        containerClassName="booking-container"
      />
      <div className="detail-doctor-container">
        <div className="booking-container">
          <div className="intro-doctor">
            <div
              className="content-left"
              style={{
                backgroundImage: `url(data:image/jpeg;base64,${
                  detailDoctor.image ? detailDoctor.image : ""
                })`,
              }}
            ></div>
            <div className="content-right">
              <div className="up">{buildDoctorName(detailDoctor)}</div>
              <div className="down">
                {detailDoctor.Markdown &&
                  detailDoctor.Markdown.description && (
                    <span>{detailDoctor.Markdown.description}</span>
                  )}
              </div>
            </div>
          </div>
          <div className="schedule-doctor">
            <div className="content-left">
              <DoctorSchedules
                detailDoctorFromParent={
                  detailDoctor && detailDoctor.id ? detailDoctor.id : -1
                }
              />
            </div>
            <div className="content-right">
              <DoctorExtraInfo
                detailDoctorFromParent={
                  detailDoctor && detailDoctor.id ? detailDoctor.id : -1
                }
              />
            </div>
          </div>
          <div className="detail-info">
            {detailDoctor &&
              detailDoctor.Markdown &&
              detailDoctor.Markdown.contentHTML && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: detailDoctor.Markdown.contentHTML,
                  }}
                ></div>
              )}
          </div>
          <div className="comment-doctor"></div>
        </div>
      </div>
      <HomeFooter />
    </>
  );
};

export default DetailDoctor;
