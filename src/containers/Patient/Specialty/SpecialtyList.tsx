import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import { handleGetAllSpecialties } from "../../../services/specialtyService";
import "./SpecialtyList.scss";
import HomeHeader from "containers/HomePage/HomeHeader";
import HomeFooter from "containers/HomePage/HomeFooter";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import Breadcrumb from "../../../components/Breadcrumb";
import "../../../components/Breadcrumb.scss";
import { LANGUAGES } from "utils";
import { IRootState } from "../../../types";

interface ISpecialtyItemProps {
  name: string;
  imageUrl: string;
  isLast: boolean;
  onClick: () => void;
}

const SpecialtyItem = ({ name, imageUrl, isLast, onClick }: ISpecialtyItemProps) => {
  return (
    <li
      className={`specialty-item${isLast ? " last" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="specialty-item__icon">
        <img
          src={imageUrl}
          alt="icon"
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/60?text=No+Img";
          }}
        />
      </div>
      <span className="specialty-item__name">{name}</span>
    </li>
  );
};

const SpecialtyList = () => {
  const navigate = useNavigate();
  const language = useSelector((state: IRootState) => state.app.language);
  const [specialties, setSpecialties] = useState<any[]>([]);

  const fetchSpecialties = useCallback(async () => {
    try {
      const res = await handleGetAllSpecialties();
      if (res && res.errCode === 0 && res.data && Array.isArray(res.data)) {
        const dataArr = res.data;
        const specialtiesList = dataArr.map((item: any) => ({
          id: item.id,
          name: item.name,
          imageUrl:
            getBase64FromBuffer(item.image) ||
            "https://via.placeholder.com/60?text=No+Img",
        }));
        setSpecialties(specialtiesList);
      } else {
        setSpecialties([]);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  const handleViewDetailSpecialty = useCallback(
    (id: any) => {
      navigate(`/specialty/detail-specialty/${id}`);
    },
    [history]
  );

  const breadcrumbItems = [
    {
      label: language === LANGUAGES.VI ? "Trang chủ" : "Home",
      to: "/home",
    },
    {
      label: language === LANGUAGES.VI ? "Chuyên khoa" : "Specialty",
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
        <div className="specialty-list-container">
          <h1 className="specialty-list-title">
            <FormattedMessage id="specialty.special-list.title" />
          </h1>
          <ul className="specialty-list-items">
            {specialties && specialties.length > 0 ? (
              specialties.map((item, idx) => (
                <SpecialtyItem
                  key={item.id}
                  name={item.name}
                  imageUrl={item.imageUrl}
                  isLast={idx === specialties.length - 1}
                  onClick={() => handleViewDetailSpecialty(item.id)}
                />
              ))
            ) : (
              <li
                className="specialty-item"
                style={{ justifyContent: "center" }}
              >
                <span>
                  <FormattedMessage id="special-list.no-info" />
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

export default SpecialtyList;