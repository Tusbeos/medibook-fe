import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "layout/HomeHeader";
import HomeFooter from "layout/HomeFooter";
import Breadcrumb from "components/Breadcrumb";
import { normalizeImageSrc } from "../../../utils";
import "./PackageList.scss";
import { useGetPackagesQuery } from "../../../store/api/publicApi";

const getPackageTypeName = (item: any) => {
  return item?.typeData?.valueVi || item?.typeData?.valueEn || item?.typeCode || "";
};

const getClinicName = (item: any) => {
  return item?.clinicData?.name || item?.clinicName || "";
};

const formatPrice = (price: any) => {
  const value = Number(price || 0);
  if (!value) return "Liên hệ";
  return value.toLocaleString("vi-VN") + "đ";
};

const PackageList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedClinic, setSelectedClinic] = useState("ALL");
  const { data: packagesResponse, isLoading: loading } = useGetPackagesQuery();
  const packages = useMemo(() => {
    const data = Array.isArray(packagesResponse?.data) ? packagesResponse.data : [];
    return data.filter((item: any) => !item?.statusId || item.statusId === "SD2");
  }, [packagesResponse]);

  const typeOptions = useMemo(() => {
    const map = new Map<string, string>();
    packages.forEach((item) => {
      const code = item?.typeCode || getPackageTypeName(item);
      const label = getPackageTypeName(item);
      if (code && label) map.set(code, label);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [packages]);

  const clinicOptions = useMemo(() => {
    const map = new Map<string, string>();
    packages.forEach((item) => {
      const value = String(item?.clinicId || item?.clinicData?.id || "");
      const label = getClinicName(item);
      if (value && label) map.set(value, label);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [packages]);

  const filteredPackages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return packages.filter((item) => {
      const matchesSearch =
        !term ||
        (item?.name || "").toLowerCase().includes(term) ||
        getClinicName(item).toLowerCase().includes(term) ||
        getPackageTypeName(item).toLowerCase().includes(term);

      const matchesType =
        selectedType === "ALL" ||
        item?.typeCode === selectedType ||
        getPackageTypeName(item) === selectedType;

      const clinicValue = String(item?.clinicId || item?.clinicData?.id || "");
      const matchesClinic = selectedClinic === "ALL" || clinicValue === selectedClinic;

      return matchesSearch && matchesType && matchesClinic;
    });
  }, [packages, searchTerm, selectedType, selectedClinic]);

  const handleViewDetail = useCallback(
    (id: number | string) => {
      navigate(`/package/detail-package/${id}`);
    },
    [navigate],
  );

  const breadcrumbItems = [
    { label: "Trang chủ", to: "/home" },
    { label: "Gói khám" },
  ];

  return (
    <>
      <HomeHeader isShowBanner={false} />
      <Breadcrumb items={breadcrumbItems} containerClassName="booking-container" />
      <div className="booking-container">
        <div className="package-list-container">
          <div className="package-list-header">
            <div>
              <h1>Gói khám dành cho bạn</h1>
              <p>Chọn gói khám phù hợp theo nhu cầu, phòng khám và ngân sách.</p>
            </div>
          </div>

          <div className="package-filter-bar">
            <div className="package-search-box">
              <i className="fas fa-search" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm theo tên gói, loại gói, phòng khám..."
              />
            </div>
            <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
              <option value="ALL">Tất cả loại gói</option>
              {typeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={selectedClinic}
              onChange={(event) => setSelectedClinic(event.target.value)}
            >
              <option value="ALL">Tất cả phòng khám</option>
              {clinicOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="package-state">Đang tải danh sách gói khám...</div>
          ) : filteredPackages.length === 0 ? (
            <div className="package-state">Chưa có gói khám phù hợp.</div>
          ) : (
            <div className="package-grid">
              {filteredPackages.map((item) => {
                const imageUrl =
                  normalizeImageSrc(item?.image) ||
                  "https://via.placeholder.com/360x220?text=Goi+kham";
                return (
                  <article
                    className="package-card"
                    key={item.id || item.name}
                    onClick={() => handleViewDetail(item.id)}
                  >
                    <div className="package-card-image">
                      <img src={imageUrl} alt={item?.name || "Gói khám"} />
                    </div>
                    <div className="package-card-body">
                      <div className="package-type">{getPackageTypeName(item) || "Gói khám"}</div>
                      <h2>{item?.name}</h2>
                      <div className="package-clinic">
                        <i className="fas fa-clinic-medical" />
                        <span>{getClinicName(item) || "Phòng khám"}</span>
                      </div>
                      <div className="package-card-footer">
                        <span>{formatPrice(item?.price)}</span>
                        <button type="button">Xem chi tiết</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <HomeFooter />
    </>
  );
};

export default PackageList;
