import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./DoctorExtraInfo.scss";
import {
  getExtraInfoDoctorById,
  getAllDoctorService,
} from "../../../services/doctorService";
import { LANGUAGES } from "utils";
import { NumericFormat } from "react-number-format";
import { FormattedMessage } from "react-intl";
import "moment/locale/vi";
import { IRootState } from "../../../types";

interface IDoctorExtraInfoProps {
  detailDoctorFromParent: number | string;
}

const DoctorExtraInfo = ({ detailDoctorFromParent }: IDoctorExtraInfoProps) => {
  const language = useSelector((state: IRootState) => state.app.language);
  const navigate = useNavigate();
  const [isShowDetailInfo, setIsShowDetailInfo] = useState(false);
  const [extraInfo, setExtraInfo] = useState<any>({});
  const [listDoctorServices, setListDoctorServices] = useState<any[]>([]);

  const fetchExtraInfo = useCallback(async (doctorId: number | string) => {
    try {
      let data = await getExtraInfoDoctorById(doctorId);
      let doctorServices = await getAllDoctorService(doctorId);
      if (data && data.errCode === 0) {
        setExtraInfo(data && data.data ? data.data : {});
        setListDoctorServices(doctorServices.data ? doctorServices.data : []);
      }
    } catch (e) {
      setExtraInfo({});
      setListDoctorServices([]);
    }
  }, []);

  useEffect(() => {
    if (detailDoctorFromParent) {
      fetchExtraInfo(detailDoctorFromParent);
    }
  }, [detailDoctorFromParent, fetchExtraInfo]);

  const showHideDetailInfo = useCallback((status: boolean) => {
    setIsShowDetailInfo(status);
  }, []);

  const handleViewDetailClinic = useCallback(() => {
    const clinicId =
      extraInfo && extraInfo.clinicId ? extraInfo.clinicId : null;
    if (clinicId) {
      navigate({
        pathname: `/clinic/detail-clinic/${clinicId}`,
        state: { clinicId },
      });
    }
  }, [extraInfo, history]);

  return (
    <div className="doctor-extra-info-container">
      <div className="content-up">
        <div className="text-address">
          <FormattedMessage id="patient.extra-info-doctor.clinic-address" />
        </div>
        <div
          className="name-clinic"
          style={{
            cursor: extraInfo && extraInfo.clinicId ? "pointer" : "default",
          }}
          onClick={handleViewDetailClinic}
        >
          {extraInfo && extraInfo.nameClinic ? extraInfo.nameClinic : ""}
        </div>
        <div className="detail-address">
          {extraInfo && extraInfo.addressClinic ? extraInfo.addressClinic : ""}
        </div>
      </div>
      <div className="content-down">
        {isShowDetailInfo === false && (
          <>
            <div className="price-title">
              <FormattedMessage id="patient.extra-info-doctor.price" />
              {extraInfo &&
                extraInfo.priceTypeData &&
                language === LANGUAGES.VI && (
                  <NumericFormat
                    className="currency"
                    value={extraInfo.priceTypeData.valueVi}
                    thousandsGroupStyle="thousand"
                    thousandSeparator=","
                    suffix="đ"
                    displayType="text"
                  />
                )}
              {extraInfo &&
                extraInfo.priceTypeData &&
                language === LANGUAGES.EN && (
                  <NumericFormat
                    className="currency"
                    value={extraInfo.priceTypeData.valueEn}
                    thousandsGroupStyle="thousand"
                    thousandSeparator=","
                    suffix="$"
                    displayType="text"
                  />
                )}
              <span
                className="short-info"
                onClick={() => showHideDetailInfo(true)}
              >
                <FormattedMessage id="patient.extra-info-doctor.detail" />
              </span>
            </div>
          </>
        )}
        {isShowDetailInfo === true && (
          <>
            <div className="tile-price">
              <FormattedMessage id="patient.extra-info-doctor.price" />
            </div>
            <div className="detail-price">
              <div className="price">
                <span className="left">
                  <FormattedMessage id="patient.extra-info-doctor.price" />
                </span>
                <span className="right">
                  {extraInfo &&
                    extraInfo.priceTypeData &&
                    language === LANGUAGES.VI && (
                      <NumericFormat
                        className="currency"
                        value={extraInfo.priceTypeData.valueVi}
                        thousandsGroupStyle="thousand"
                        thousandSeparator=","
                        suffix="đ"
                        displayType="text"
                      />
                    )}
                  {extraInfo &&
                    extraInfo.priceTypeData &&
                    language === LANGUAGES.EN && (
                      <NumericFormat
                        className="currency"
                        value={extraInfo.priceTypeData.valueEn}
                        thousandsGroupStyle="thousand"
                        thousandSeparator=","
                        suffix="$"
                        displayType="text"
                      />
                    )}
                </span>
                <div className="note">
                  {extraInfo && extraInfo.note ? extraInfo.note : ""}
                </div>
              </div>
              <div className="payment">
                <FormattedMessage id="patient.extra-info-doctor.payment" />
                {extraInfo && extraInfo.paymentTypeData
                  ? language === LANGUAGES.VI
                    ? extraInfo.paymentTypeData.valueVi
                    : extraInfo.paymentTypeData.valueEn
                  : ""}
              </div>
            </div>
            <div className="price-service">
              <div className="title-service">
                <FormattedMessage id="patient.extra-info-doctor.service-price" />
              </div>
              <div className="detail-service">
                {listDoctorServices && listDoctorServices.length > 0 ? (
                  listDoctorServices.map((item, index) => {
                    return (
                      <div key={index} className="service-item">
                        <span className="service-name">
                          {language === LANGUAGES.VI
                            ? item.nameVi
                            : item.nameEn}
                        </span>
                        <span className="service-price">
                          {language === LANGUAGES.VI ? (
                            <NumericFormat
                              className="currency"
                              value={item.price}
                              thousandsGroupStyle="thousand"
                              thousandSeparator=","
                              suffix="đ"
                              displayType="text"
                            />
                          ) : (
                            <NumericFormat
                              className="currency"
                              value={Math.ceil(item.price / 23000)}
                              thousandsGroupStyle="thousand"
                              thousandSeparator=","
                              suffix="$"
                              displayType="text"
                            />
                          )}
                        </span>
                        <div className="description">
                          {language === LANGUAGES.VI
                            ? item.descriptionVi
                            : item.descriptionEn}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-services">
                    <FormattedMessage id="patient.extra-info-doctor.no-services" />
                  </div>
                )}
              </div>
            </div>
            <div className="show-info">
              <span onClick={() => showHideDetailInfo(false)}>
                <FormattedMessage id="patient.extra-info-doctor.hide-price" />
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorExtraInfo;
