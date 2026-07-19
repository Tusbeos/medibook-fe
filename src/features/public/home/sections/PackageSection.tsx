import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { DataState } from "components/System/SystemShared";
import { useGetPackagesQuery } from "store/api/publicApi";
import { normalizeImageSrc } from "utils";

const formatPrice = (price: unknown) => {
  const value = Number(price || 0);
  return value > 0 ? `${value.toLocaleString("vi-VN")}đ` : "Liên hệ";
};

const PackageSection: React.FC = () => {
  const packagesQuery = useGetPackagesQuery(6);
  const packages = useMemo(() => {
    const data = Array.isArray(packagesQuery.data?.data)
      ? packagesQuery.data.data
      : [];
    return data.filter((item: any) => !item?.statusId || item.statusId === "SD2");
  }, [packagesQuery.data]);

  return (
    <section className="section-share section-package" aria-labelledby="home-packages-title">
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="title-section" id="home-packages-title">
              Gói khám nổi bật
            </h2>
            <div className="section-subtitle">
              Chọn gói phù hợp và gửi yêu cầu đến phòng khám nhanh chóng.
            </div>
          </div>
          <Link className="btn-section" to="/package">
            Xem tất cả <i className="fas fa-arrow-right" />
          </Link>
        </div>

        {packagesQuery.isLoading ? (
          <DataState variant="loading" text="Đang tải gói khám..." />
        ) : packagesQuery.isError && packages.length === 0 ? (
          <DataState
            variant="error"
            text="Không thể tải gói khám nổi bật."
            onRetry={packagesQuery.refetch}
          />
        ) : packages.length === 0 ? (
          <DataState variant="empty" text="Hiện chưa có gói khám nổi bật." />
        ) : (
          <div className="package-grid">
            {packages.map((item: any, index: number) => {
              const image = normalizeImageSrc(item.image);
              const clinicName =
                item.clinicName || item.clinicData?.name || "Phòng khám MediBook";
              return (
                <Link
                  className="package-home-card"
                  key={item.id || index}
                  to={`/package/detail-package/${item.id}`}
                >
                  <div className="package-home-image">
                    {image ? (
                      <img src={image} alt={item.name || "Gói khám"} />
                    ) : (
                      <i className="fas fa-kit-medical" aria-hidden="true" />
                    )}
                  </div>
                  <div className="package-home-body">
                    <span className="package-home-clinic">{clinicName}</span>
                    <h3>{item.name || "Gói khám MediBook"}</h3>
                    <div className="package-home-footer">
                      <strong>{formatPrice(item.price)}</strong>
                      <span>
                        Xem chi tiết <i className="fas fa-arrow-right" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PackageSection;
