import React from 'react';
import { getBase64FromBuffer } from "utils/CommonUtils";
import { useSelector } from "react-redux";
import { LANGUAGES } from "utils/constant";
import { IRootState } from "types";

interface ISectionItemProps {
  item: any;
  onClick: (item: any) => void;
  isCircular?: boolean;
  subTitle?: string;
}

// SectionItem chuyển sang Function Component + useSelector
const SectionItem: React.FC<ISectionItemProps> = ({ item, onClick, isCircular, subTitle }) => {
  const language = useSelector((state: IRootState) => state.app.language);

  let imageBase64 =
    getBase64FromBuffer(item.image) ||
    "https://via.placeholder.com/60?text=No+Img";

  let name = item.name;
  if (item.lastName && item.firstName) {
    let positionVi = item.positionData ? item.positionData.valueVi : "";
    let positionEn = item.positionData ? item.positionData.valueEn : "";
    if (language === LANGUAGES.VI) {
      name = `${positionVi}, ${item.lastName} ${item.firstName}`;
    } else {
      name = `${positionEn}, ${item.firstName} ${item.lastName}`;
    }
  }
  return (
    <div className="section-customize" onClick={() => onClick(item)}>
      <div
        className={`img-customize ${
          isCircular ? "img-circle" : "img-square"
        }`}
        style={{
          backgroundColor: "#eee",
          backgroundImage: `url(${imageBase64})`,
        }}
      />
      <div className="bg-text-name-section">
        <div className="name-section">{name}</div>
        {subTitle && <div className="position-section">{subTitle}</div>}
      </div>
    </div>
  );
};

export default SectionItem;
