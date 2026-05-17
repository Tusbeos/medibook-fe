import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import HomeHeader from "layout/HomeHeader";
import HomeFooter from "layout/HomeFooter";
import Breadcrumb from "components/Breadcrumb";
import { normalizeImageSrc } from "../../../utils";
import "./DetailPackage.scss";
import { useGetPackageByIdQuery } from "../../../store/api/publicApi";

const getPackageTypeName = (item: any) => {
  return item?.typeData?.valueVi || item?.typeData?.valueEn || item?.typeCode || "Gói khám";
};

const getClinicName = (item: any) => {
  return item?.clinicData?.name || item?.clinicName || "Phòng khám";
};

const getClinicAddress = (item: any) => {
  return item?.clinicData?.address || item?.clinicAddress || "";
};

const formatPrice = (price: any) => {
  const value = Number(price || 0);
  if (!value) return "Liên hệ";
  return value.toLocaleString("vi-VN") + "đ";
};

const groupPackageServices = (services: any[] = []) => {
  const map = new Map<string, any[]>();
  services.forEach((service) => {
    const groupName =
      service?.groupServiceData?.valueVi ||
      service?.groupServiceData?.valueEn ||
      service?.groupServiceCode ||
      "Dịch vụ";
    if (!map.has(groupName)) map.set(groupName, []);
    map.get(groupName)?.push(service);
  });
  return Array.from(map.entries()).map(([groupName, items]) => ({ groupName, items }));
};

const DetailPackage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: packageResponse,
    isLoading: loading,
    isError,
  } = useGetPackageByIdQuery(id || "", { skip: !id });
  const packageInfo = packageResponse?.errCode === 0 ? packageResponse.data : null;
  const notFound = !loading && (!id || isError || !packageInfo);

  const serviceGroups = useMemo(
    () => groupPackageServices(packageInfo?.packageServices || []),
    [packageInfo],
  );

  const imageUrl =
    normalizeImageSrc(packageInfo?.image) ||
    "https://via.placeholder.com/900x520?text=Goi+kham";

  const clinicId = packageInfo?.clinicId || packageInfo?.clinicData?.id;

  const breadcrumbItems = [
    { label: "Trang chủ", to: "/home" },
    { label: "Gói khám", to: "/package" },
    { label: packageInfo?.name || "Chi tiết gói khám" },
  ];

  if (loading) {
    return (
      <>
        <HomeHeader isShowBanner={false} />
        <div className="booking-container">
          <div className="detail-package-state">Đang tải thông tin gói khám...</div>
        </div>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <HomeHeader isShowBanner={false} />
        <div className="booking-container">
          <div className="detail-package-state">Không tìm thấy gói khám.</div>
        </div>
      </>
    );
  }

  return (
    <div className="detail-package-wrapper">
      <HomeHeader isShowBanner={false} />
      <Breadcrumb items={breadcrumbItems} containerClassName="booking-container" />

      <div className="booking-container">
        <section className="package-hero">
          <div className="package-hero-image">
            <img src={imageUrl} alt={packageInfo?.name || "Gói khám"} />
          </div>
          <div className="package-hero-info">
            <div className="package-type-label">{getPackageTypeName(packageInfo)}</div>
            <h1>{packageInfo?.name}</h1>
            <div className="package-meta">
              <div>
                <i className="fas fa-clinic-medical" />
                <span>{getClinicName(packageInfo)}</span>
              </div>
              {getClinicAddress(packageInfo) && (
                <div>
                  <i className="fas fa-map-marker-alt" />
                  <span>{getClinicAddress(packageInfo)}</span>
                </div>
              )}
            </div>
            <div className="package-price">{formatPrice(packageInfo?.price)}</div>
            {packageInfo?.note && <p className="package-note">{packageInfo.note}</p>}
            <div className="package-actions">
              <button
                type="button"
                onClick={() => alert("Chức năng đặt gói khám sẽ được bổ sung ở bước tiếp theo.")}
              >
                Đặt gói khám
              </button>
              {clinicId && (
                <Link to={`/clinic/detail-clinic/${clinicId}`}>Xem phòng khám</Link>
              )}
            </div>
          </div>
        </section>

        <div className="package-detail-layout">
          <aside className="package-toc">
            <a href="#overview">Tổng quan</a>
            <a href="#services">Danh mục dịch vụ</a>
            <a href="#clinic">Phòng khám</a>
            {packageInfo?.note && <a href="#note">Lưu ý</a>}
          </aside>

          <main className="package-detail-content">
            <section id="overview" className="package-section">
              <h2>Tổng quan gói khám</h2>
              {packageInfo?.descriptionHTML ? (
                <div
                  className="package-html-content"
                  dangerouslySetInnerHTML={{ __html: packageInfo.descriptionHTML }}
                />
              ) : (
                <p>Gói khám chưa có mô tả chi tiết.</p>
              )}
            </section>

            <section id="services" className="package-section">
              <h2>Danh mục dịch vụ</h2>
              {serviceGroups.length === 0 ? (
                <div className="package-empty-box">Chưa có danh mục dịch vụ.</div>
              ) : (
                <div className="package-service-groups">
                  {serviceGroups.map((group) => (
                    <div className="service-group" key={group.groupName}>
                      <h3>{group.groupName}</h3>
                      {group.items.map((service, index) => (
                        <div className="service-item" key={`${group.groupName}-${index}`}>
                          <div className="service-name">{service.serviceName}</div>
                          {service.description && (
                            <div className="service-description">{service.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section id="clinic" className="package-section">
              <h2>Thông tin phòng khám</h2>
              <div className="package-clinic-box">
                <div>
                  <strong>{getClinicName(packageInfo)}</strong>
                  {getClinicAddress(packageInfo) && <p>{getClinicAddress(packageInfo)}</p>}
                </div>
                {clinicId && <Link to={`/clinic/detail-clinic/${clinicId}`}>Xem chi tiết</Link>}
              </div>
            </section>

            {packageInfo?.note && (
              <section id="note" className="package-section">
                <h2>Lưu ý</h2>
                <div className="package-note-box">{packageInfo.note}</div>
              </section>
            )}
          </main>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
};

export default DetailPackage;
