import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import HomeHeader from "containers/HomePage/HomeHeader";
import HomeFooter from "containers/HomePage/HomeFooter";
import "./DetailClinic.scss";
import { FormattedMessage } from "react-intl";
import { getDetailClinicById } from "../../../services/clinicService";
import { getDoctorsByClinicId } from "../../../services/doctorService";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import DoctorCard from "../../../components/Patient/DoctorCard";
import { IRootState } from "../../../types";
const HEADER_SELECTOR = "h2";

const normalizeString = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().trim().replace(/\s+/g, " ");
};

const DetailClinic = () => {
  const { id: idFromParams } = useParams<{ id: string }>();
  const location = useLocation<any>();
  const language = useSelector((state: IRootState) => state.app.language);

  const introRef = useRef<HTMLDivElement>(null);
  const doctorsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [clinic, setClinic] = useState<any>({});
  const [notFound, setNotFound] = useState(false);
  const [doctorIds, setDoctorIds] = useState<any[]>([]);
  const [tableOfContents, setTableOfContents] = useState<any[]>([]);

  const buildTableOfContents = useCallback(() => {
    const container = contentRef.current;
    if (!container) return;

    const headers = container.querySelectorAll(HEADER_SELECTOR);
    const toc: any[] = [];
    const ignoredKeywords = [
      "giới thiệu",
      "thế mạnh chuyên môn",
      "đặt lịch khám",
    ];

    headers.forEach((header: any, index: number) => {
      const originalText = header.innerText || "";
      const cleanText = normalizeString(originalText);

      if (cleanText.length === 0 || cleanText.length > 150) return;
      if (ignoredKeywords.some((keyword) => cleanText.includes(keyword)))
        return;

      toc.push({ title: originalText, originalIndex: index });
    });

    setTableOfContents(toc);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const idFromState = location?.state?.clinicId || null;
      const id = idFromParams || idFromState;

      if (id) {
        try {
          let res = await getDetailClinicById(id);
          if (res && res.errCode === 0 && res.data) {
            setClinic(res.data);
            setNotFound(false);
          } else {
            setNotFound(true);
          }

          const doctorRes = await getDoctorsByClinicId(id);
          if (
            doctorRes &&
            doctorRes.errCode === 0 &&
            Array.isArray(doctorRes.data)
          ) {
            setDoctorIds(doctorRes.data);
          } else {
            setDoctorIds([]);
          }
        } catch (e) {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    };
    fetchData();
  }, [idFromParams, location]);

  useEffect(() => {
    if (clinic && clinic.descriptionHTML) {
      setTimeout(() => buildTableOfContents(), 100);
    }
  }, [clinic, buildTableOfContents]);

  const handleScrollTo = useCallback(
    (key: string, originalIndex: number | null = null) => {
      let element: any = null;
      const container = contentRef.current;

      const findHeaderByKeywords = (keywords: string[] = []) => {
        if (!container) return null;
        const headers = container.querySelectorAll(HEADER_SELECTOR);
        const normalizedKeywords = keywords.map((kw) => normalizeString(kw));
        return Array.from(headers).find((header: any) => {
          const text = normalizeString(header.innerText || "");
          return normalizedKeywords.some((kw) => text.includes(kw));
        });
      };

      if (key === "intro") {
        element =
          findHeaderByKeywords(["giới thiệu"]) || introRef.current;
      } else if (key === "doctors") {
        element =
          findHeaderByKeywords(["thế mạnh", "chuyên môn"]) ||
          doctorsRef.current;
      } else if (key === "markdown" && originalIndex !== null) {
        if (container) {
          const headers = container.querySelectorAll(HEADER_SELECTOR);
          if (headers && headers[originalIndex])
            element = headers[originalIndex];
        }
      }

      if (element) {
        const wrapper = document.querySelector(".custom-scrollbar");
        let scrollContainer: any = document.documentElement;

        if (wrapper) {
          const innerDiv = wrapper.firstElementChild;
          if (innerDiv) {
            scrollContainer = innerDiv;
          }
        }
        const headerOffset = 100;
        const elementTop = element.getBoundingClientRect().top;
        const containerTop = scrollContainer.getBoundingClientRect
          ? scrollContainer.getBoundingClientRect().top
          : 0;
        const currentScroll = scrollContainer.scrollTop || 0;

        const targetScroll =
          currentScroll + (elementTop - containerTop) - headerOffset;

        if (scrollContainer && scrollContainer.scrollTo) {
          scrollContainer.scrollTo({ top: targetScroll, behavior: "smooth" });
        }
      }
    },
    []
  );

  if (notFound) {
    return (
      <div className="detail-clinic-wrapper">
        <HomeHeader />
        <div className="not-found-msg">
          <FormattedMessage id="clinic-detail.notFound" />
        </div>
      </div>
    );
  }

  let coverUrl = getBase64FromBuffer(clinic.imageCover);
  let logoUrl = getBase64FromBuffer(clinic.image);

  return (
    <div className="detail-clinic-wrapper">
      <HomeHeader />
      <div className="clinic-hero-container">
        <div
          className="hero-cover"
          style={{ backgroundImage: `url(${coverUrl})` }}
        >
          <div className="overlay-gradient"></div>
          <div className="hero-content booking-container">
            <div className="profile-box">
              <div
                className="clinic-logo"
                style={{ backgroundImage: `url(${logoUrl})` }}
              ></div>
              <div className="clinic-info-header">
                <h1 className="clinic-name-hero">{clinic.name}</h1>
                <p className="clinic-addr-hero">
                  <i className="fas fa-map-marker-alt"></i> {clinic.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="clinic-nav-tabs">
        <div className="booking-container">
          <div className="tab-list">
            <span className="tab-item" onClick={() => handleScrollTo("intro")}>
              Giới thiệu
            </span>
            <span
              className="tab-item"
              onClick={() => handleScrollTo("doctors")}
            >
              Thế mạnh chuyên môn
            </span>
            {tableOfContents &&
              tableOfContents.map((item, i) => (
                <span
                  key={i}
                  className="tab-item"
                  onClick={() => handleScrollTo("markdown", item.originalIndex)}
                >
                  {item.title}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="clinic-body-section">
        <div className="booking-container">
          <div className="intro-section" ref={introRef}>
            <div className="notice-box-yellow">
              <strong>MediBook</strong> là Nền tảng Y tế chăm sóc sức khỏe toàn
              diện...
            </div>
            <div className="info-box-blue">
              <p>
                Từ nay, người bệnh có thể đặt lịch tại{" "}
                <strong>{clinic.name}</strong>...
              </p>
              <ul>
                <li>
                  Được lựa chọn các giáo sư, tiến sĩ, bác sĩ chuyên khoa giàu
                  kinh nghiệm
                </li>
                <li>
                  Hỗ trợ đặt khám trực tuyến trước khi đi khám (miễn phí đặt
                  lịch)
                </li>
              </ul>
            </div>
          </div>
          <div ref={doctorsRef}>
            <DoctorCard
              clinicId={clinic && clinic.id ? clinic.id : null}
              doctorIds={doctorIds}
            />
          </div>
          <div className="clinic-html-content" ref={contentRef}>
            {clinic.descriptionHTML && (
              <div
                dangerouslySetInnerHTML={{ __html: clinic.descriptionHTML }}
              ></div>
            )}
          </div>
        </div>
      </div>
      <HomeFooter />
    </div>
  );
};

export default DetailClinic;