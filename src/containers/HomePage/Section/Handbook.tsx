import React, { useCallback } from 'react';
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import SectionItem from "./SectionItem";
import { FormattedMessage } from "react-intl";
import SpecialtyImg from "../../../assets/handbook/handbook-1.jpg";

interface IHandbookItem {
  id: number;
  name: string;
  image: string;
}

interface IHandbookProps {
  settings: any;
}

const dataHandbooks: IHandbookItem[] = [
  { id: 1, name: "Cẩm nang Cơ xương khớp", image: SpecialtyImg },
  { id: 2, name: "Cẩm nang Thần kinh", image: SpecialtyImg },
  { id: 3, name: "Cẩm nang Tiêu hóa", image: SpecialtyImg },
  { id: 4, name: "Cẩm nang Tim mạch", image: SpecialtyImg },
  { id: 5, name: "Cẩm nang Tai Mũi Họng", image: SpecialtyImg },
  { id: 6, name: "Cẩm nang Cột sống", image: SpecialtyImg },
];

// Handbook chuyển sang Function Component + Hooks
const Handbook: React.FC<IHandbookProps> = ({ settings }) => {
  const navigate = useNavigate();

  const handleViewDetailHandbook = useCallback((item: any) => {
    navigate(`/detail-handbook/${item.id}`);
  }, [navigate]);

  return (
    <div className="section-share section-handbook">
      <div className="booking-container">
        <div className="section-container">
          <div className="section-header">
            <span className="title-section">
              <FormattedMessage id="home-header.handbook" />
            </span>
            <button className="btn-section">
              <FormattedMessage id="home-header.all-article" />
            </button>
          </div>
          <div className="section-body">
            <Slider {...settings}>
              {dataHandbooks.map((item, index) => (
                <SectionItem
                  key={index}
                  item={item}
                  isCircular={false}
                  onClick={handleViewDetailHandbook}
                />
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Handbook;
