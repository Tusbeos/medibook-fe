import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";

import "./SpecialtyList.scss";
import HomeHeader from "layout/HomeHeader";
import HomeFooter from "layout/HomeFooter";
import Breadcrumb from "components/Breadcrumb";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import { LANGUAGES } from "utils";
import { IRootState } from "../../../types";
import { useGetSpecialtiesQuery } from "../../../store/api/publicApi";

interface ISpecialtyItemProps {
  name: string;
  imageUrl: string;
  description: string;
  onClick: () => void;
}

const SpecialtyItem = ({
  name,
  imageUrl,
  description,
  onClick,
}: ISpecialtyItemProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <li className="specialty-item">
      <button type="button" className="specialty-card" onClick={onClick}>
        <span className="specialty-item__icon" aria-hidden="true">
          {!imageFailed && imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              onError={() => setImageFailed(true)}
            />
          ) : (
            <i className="fas fa-stethoscope" />
          )}
        </span>
        <span className="specialty-item__content">
          <strong className="specialty-item__name">{name}</strong>
          <span className="specialty-item__description">{description}</span>
          <span className="specialty-item__action">
            Xem bác sĩ <i className="fas fa-arrow-right" aria-hidden="true" />
          </span>
        </span>
      </button>
    </li>
  );
};

const getDescriptionPreview = (markdown?: string, html?: string) => {
  const source = markdown || html || "";
  const plainText = source
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`>[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plainText || "Xem thông tin chuyên khoa và đội ngũ bác sĩ phù hợp.";
};

const SpecialtyList = () => {
  const navigate = useNavigate();
  const language = useSelector((state: IRootState) => state.app.language);
  const {
    data: specialtiesResponse,
    isLoading,
    isError,
    refetch,
  } = useGetSpecialtiesQuery();
  const specialties = useMemo(() => {
    const dataArr = Array.isArray(specialtiesResponse?.data)
      ? specialtiesResponse.data
      : [];
    return dataArr.map((item: any) => ({
      id: item.id,
      name: item.name,
      imageUrl: getBase64FromBuffer(item.image) || "",
      description: getDescriptionPreview(
        item.descriptionMarkdown,
        item.descriptionHTML,
      ),
    }));
  }, [specialtiesResponse]);

  const handleViewDetailSpecialty = useCallback(
    (id: number) => {
      navigate(`/specialty/detail-specialty/${id}`);
    },
    [navigate],
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

          {isLoading ? (
            <div className="specialty-list-state" role="status">
              <i className="fas fa-spinner fa-spin" aria-hidden="true" />
              <span>Đang tải danh sách chuyên khoa...</span>
            </div>
          ) : isError ? (
            <div className="specialty-list-state specialty-list-state--error">
              <i className="fas fa-exclamation-circle" aria-hidden="true" />
              <span>Không thể tải danh sách chuyên khoa.</span>
              <button type="button" onClick={() => refetch()}>
                Thử lại
              </button>
            </div>
          ) : specialties.length > 0 ? (
            <ul className="specialty-list-items">
              {specialties.map((item) => (
                <SpecialtyItem
                  key={item.id}
                  name={item.name}
                  imageUrl={item.imageUrl}
                  description={item.description}
                  onClick={() => handleViewDetailSpecialty(item.id)}
                />
              ))}
            </ul>
          ) : (
            <div className="specialty-list-state">
              <i className="fas fa-notes-medical" aria-hidden="true" />
              <span>
                <FormattedMessage id="special-list.no-info" />
              </span>
            </div>
          )}
        </div>
      </div>
      <HomeFooter />
    </>
  );
};

export default SpecialtyList;
