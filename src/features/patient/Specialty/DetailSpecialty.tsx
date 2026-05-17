import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import HomeHeader from "layout/HomeHeader";
import HomeFooter from "layout/HomeFooter";
import Breadcrumb from "components/Breadcrumb";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import "./DetailSpecialty.scss";
import DoctorCard from "components/Patient/DoctorCard";
import { LANGUAGES } from "utils";
import { IRootState } from "../../../types";
import {
  useGetDoctorsBySpecialtyIdQuery,
  useGetSpecialtiesByIdsQuery,
} from "../../../store/api/publicApi";

const DetailSpecialty = () => {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const language = useSelector((state: IRootState) => state.app.language);
  const [isShowDetail, setIsShowDetail] = useState(false);
  const { data: specialtyResponse } = useGetSpecialtiesByIdsQuery(
    id ? [id] : [],
    { skip: !id },
  );
  const { data: doctorsResponse } = useGetDoctorsBySpecialtyIdQuery(id || "", {
    skip: !id,
  });
  const specialty = useMemo(() => {
    const found = Array.isArray(specialtyResponse?.data)
      ? specialtyResponse.data[0]
      : null;
    return found
      ? {
          ...found,
          imageUrl: getBase64FromBuffer(found.image) || "",
        }
      : null;
  }, [specialtyResponse]);
  const doctorIds = useMemo(() => {
    const data = Array.isArray(doctorsResponse?.data) ? doctorsResponse.data : [];
    return data
      .map((item: any) => item && (item.id || item.doctorId))
      .filter((value: any) => value);
  }, [doctorsResponse]);

  const handleShowHideDetail = useCallback(() => {
    setIsShowDetail((prev) => !prev);
  }, []);

  let backgroundImage = specialty ? `url(${specialty.imageUrl})` : "";

  const breadcrumbItems = [
    {
      label: language === LANGUAGES.VI ? "Trang chủ" : "Home",
      to: "/home",
    },
    {
      label: language === LANGUAGES.VI ? "Chuyên khoa" : "Specialty",
      to: "/specialty",
    },
    {
      label:
        specialty && specialty.name
          ? specialty.name
          : language === LANGUAGES.VI
            ? "Chi tiết chuyên khoa"
            : "Specialty Detail",
    },
  ];

  return (
    <>
      <HomeHeader />
      <div className="booking-container">
        <div className="detail-specialty-container">
          <div className="description-specialty">
            <Breadcrumb
              items={breadcrumbItems}
              containerClassName="booking-container"
            />
            {specialty && (
              <div className="description-content-up">
                <div
                  className="description-bg"
                  style={{ backgroundImage: backgroundImage }}
                ></div>

                <div className="description-content-text">
                  <div
                    className="specialty-desc-html"
                    style={
                      isShowDetail
                        ? {}
                        : { maxHeight: "150px", overflow: "hidden" }
                    }
                    dangerouslySetInnerHTML={{
                      __html:
                        specialty.descriptionHTML || "<i>Chưa có mô tả</i>",
                    }}
                  />

                  <div className="view-more-container">
                    <span
                      onClick={handleShowHideDetail}
                      className="view-more-btn"
                    >
                      {isShowDetail
                        ? intl.formatMessage({
                            id: "specialty.detail-specialty.hide-detail",
                          })
                        : intl.formatMessage({
                            id: "specialty.detail-specialty.see-more",
                          })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DoctorCard
            specialtyId={specialty ? specialty.id : null}
            doctorIds={doctorIds}
          />
        </div>
      </div>
      <HomeFooter />
    </>
  );
};

export default DetailSpecialty;
