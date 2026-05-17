import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./ClinicList.scss";
import HomeHeader from "containers/HomePage/HomeHeader";
import HomeFooter from "containers/HomePage/HomeFooter";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import Breadcrumb from "../../../components/Breadcrumb";
import "../../../components/Breadcrumb.scss";
import { LANGUAGES } from "utils";
import { IRootState } from "../../../types";
import { useGetClinicsQuery } from "../../../store/api/publicApi";

interface IClinicItemProps {
  name: string;
  address: string;
  imageUrl: string;
  isLast: boolean;
  onClick: () => void;
}

const ClinicItem = ({ name, address, imageUrl, isLast, onClick }: IClinicItemProps) => {
  return (
    <li
      className={`clinic-item${isLast ? " last" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="clinic-item__icon">
        <img
          src={imageUrl}
          alt="icon"
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/60?text=No+Img";
          }}
        />
      </div>
      <div className="clinic-item__info">
        <span className="clinic-item__name">{name}</span>
        <span className="clinic-item__address">{address}</span>
      </div>
    </li>
  );
};

const ClinicList = () => {
  const navigate = useNavigate();
  const language = useSelector((state: IRootState) => state.app.language);
  const { data: clinicsResponse } = useGetClinicsQuery();
  const clinics = useMemo(() => {
    const dataArr = Array.isArray(clinicsResponse?.data) ? clinicsResponse.data : [];
    return dataArr.map((item: any) => ({
      id: item.id,
      name: item.name,
      address: item.address,
      imageUrl:
        getBase64FromBuffer(item.image) ||
        "https://via.placeholder.com/60?text=No+Img",
    }));
  }, [clinicsResponse]);

  const handleViewDetailClinic = useCallback(
    (id: any) => {
      navigate(`/clinic/detail-clinic/${id}`);
    },
    [navigate]
  );

  const breadcrumbItems = [
    {
      label: language === LANGUAGES.VI ? "Trang chủ" : "Home",
      to: "/home",
    },
    {
      label: language === LANGUAGES.VI ? "Phòng khám" : "Clinic",
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
        <div className="clinic-list-container">
          <h1 className="clinic-list-title">Phòng khám dành cho bạn</h1>
          <ul className="clinic-list-items">
            {clinics && clinics.length > 0 ? (
              clinics.map((item, idx) => (
                <ClinicItem
                  key={item.id}
                  name={item.name}
                  address={item.address}
                  imageUrl={item.imageUrl}
                  isLast={idx === clinics.length - 1}
                  onClick={() => handleViewDetailClinic(item.id)}
                />
              ))
            ) : (
              <li
                className="clinic-item"
                style={{ justifyContent: "center" }}
              >
                <span>Không có dữ liệu phòng khám</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <HomeFooter />
    </>
  );
};

export default ClinicList;
