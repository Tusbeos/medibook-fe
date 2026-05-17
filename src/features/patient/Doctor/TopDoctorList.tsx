import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./TopDoctorList.scss";
import HomeHeader from "layout/HomeHeader";
import HomeFooter from "layout/HomeFooter";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import Breadcrumb from "components/Breadcrumb";
import { LANGUAGES } from "utils";
import { IRootState } from "../../../types";
import { useGetTopDoctorsQuery } from "../../../store/api/publicApi";

interface IDoctorItemProps {
  name: string;
  subTitle: string;
  imageUrl: string;
  isLast: boolean;
  onClick: () => void;
}

const DoctorItem = ({
  name,
  subTitle,
  imageUrl,
  isLast,
  onClick,
}: IDoctorItemProps) => {
  return (
    <li
      className={`top-doctor-item${isLast ? " last" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="top-doctor-item__icon">
        <img
          src={imageUrl}
          alt="icon"
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/60?text=No+Img";
          }}
        />
      </div>
      <div className="top-doctor-item__info">
        <span className="top-doctor-item__name">{name}</span>
        <span className="top-doctor-item__sub-title">{subTitle}</span>
      </div>
    </li>
  );
};

const TopDoctorList = () => {
  const navigate = useNavigate();
  const language = useSelector((state: IRootState) => state.app.language);
  const { data: doctorsResponse } = useGetTopDoctorsQuery(100);

  const buildDoctorName = useCallback(
    (doctor: any) => {
      if (doctor && doctor.positionData) {
        let nameVi = `${doctor.positionData.valueVi}, ${doctor.lastName} ${doctor.firstName}`;
        let nameEn = `${doctor.positionData.valueEn}, ${doctor.firstName} ${doctor.lastName}`;
        return language === LANGUAGES.VI ? nameVi : nameEn;
      }
      if (doctor && doctor.firstName && doctor.lastName) {
        return language === LANGUAGES.VI
          ? `${doctor.lastName} ${doctor.firstName}`
          : `${doctor.firstName} ${doctor.lastName}`;
      }
      return "";
    },
    [language],
  );

  const buildDoctorSubTitle = useCallback(
    (doctor: any) => {
      const count =
        (doctor && doctor.DoctorInfo && doctor.DoctorInfo.count) ||
        doctor.count ||
        null;
      if (count !== null && count !== undefined) {
        return language === LANGUAGES.VI
          ? `Lượt khám: ${count}`
          : `Visits: ${count}`;
      }
      return language === LANGUAGES.VI ? "Bác sĩ nổi bật" : "Top doctor";
    },
    [language],
  );

  const doctors = useMemo(() => {
    const dataArr = Array.isArray(doctorsResponse?.data) ? doctorsResponse.data : [];
    return dataArr.map((item: any) => ({
      id: item.id,
      name: buildDoctorName(item),
      subTitle: buildDoctorSubTitle(item),
      imageUrl:
        getBase64FromBuffer(item.image) ||
        "https://via.placeholder.com/60?text=No+Img",
    }));
  }, [doctorsResponse, buildDoctorName, buildDoctorSubTitle]);

  const handleViewDetailDoctor = useCallback(
    (id: any) => {
      navigate(`/detail-doctor/${id}`);
    },
    [navigate],
  );

  const breadcrumbItems = [
    {
      label: language === LANGUAGES.VI ? "Trang chủ" : "Home",
      to: "/home",
    },
    {
      label: language === LANGUAGES.VI ? "Bác sĩ" : "Doctor",
    },
  ];

  return (
    <>
      <HomeHeader />
      <Breadcrumb
        items={breadcrumbItems}
        containerClassName="booking-container"
      />
      <div className="booking-container">
        <div className="top-doctor-list-container">
          <h1 className="top-doctor-list-title">
            {language === LANGUAGES.VI
              ? "Bác sĩ nổi bật dành cho bạn"
              : "Top doctors for you"}
          </h1>
          <ul className="top-doctor-list-items">
            {doctors && doctors.length > 0 ? (
              doctors.map((item, idx) => (
                <DoctorItem
                  key={item.id}
                  name={item.name}
                  subTitle={item.subTitle}
                  imageUrl={item.imageUrl}
                  isLast={idx === doctors.length - 1}
                  onClick={() => handleViewDetailDoctor(item.id)}
                />
              ))
            ) : (
              <li
                className="top-doctor-item"
                style={{ justifyContent: "center" }}
              >
                <span>
                  {language === LANGUAGES.VI
                    ? "Không có dữ liệu bác sĩ"
                    : "No doctor data"}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <HomeFooter />
    </>
  );
};

export default TopDoctorList;
