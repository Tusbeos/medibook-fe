import React, { useCallback, useMemo } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import SectionItem from "./SectionItem";
import { useGetPackagesQuery } from "../../../store/api/publicApi";

interface IPackageSectionProps {
  settings: any;
}

const PackageSection: React.FC<IPackageSectionProps> = ({ settings }) => {
  const navigate = useNavigate();
  const { data: packagesResponse } = useGetPackagesQuery(6);
  const packages = useMemo(() => {
    const data = Array.isArray(packagesResponse?.data) ? packagesResponse.data : [];
    return data.filter((item: any) => !item?.statusId || item.statusId === "SD2");
  }, [packagesResponse]);

  const handleViewDetailPackage = useCallback(
    (item: any) => {
      navigate(`/package/detail-package/${item.id}`);
    },
    [navigate],
  );

  const handleViewAllPackages = useCallback(() => {
    navigate("/package");
  }, [navigate]);

  if (!packages.length) return null;

  return (
    <div className="section-share section-package">
      <div className="booking-container">
        <div className="section-container">
          <div className="section-header">
            <span className="title-section">Gói khám nổi bật</span>
            <button className="btn-section" onClick={handleViewAllPackages}>
              Xem thêm
            </button>
          </div>
          <div className="section-body">
            <Slider {...settings}>
              {packages.map((item, index) => (
                <SectionItem
                  key={item.id || index}
                  item={item}
                  isCircular={false}
                  onClick={handleViewDetailPackage}
                />
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageSection;
