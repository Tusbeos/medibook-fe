import React from 'react';
import HomeHeader from "./HomeHeader";
import Specialty from "./Section/Specialty";
import OutStandingDoctor from "./Section/OutStandingDoctor";
// import Handbook from "./Section/Handbook";
import About from "./Section/About";
import MedicalFacility from "./Section/MedicalFacility";
import PackageSection from "./Section/PackageSection";
import HomeFooter from "./HomeFooter";
import "./HomePage.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface IArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const PrevArrow = (props: IArrowProps) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} sp-arrow sp-prev`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    >
      <span style={{ fontSize: "20px", fontWeight: "bold" }}>&#10094;</span>
    </div>
  );
};

const NextArrow = (props: IArrowProps) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} sp-arrow sp-next`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    >
      <span style={{ fontSize: "20px", fontWeight: "bold" }}>&#10095;</span>
    </div>
  );
};

// HomePage chuyển sang Function Component
const HomePage: React.FC = () => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, slidesToScroll: 3, infinite: false },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2, slidesToScroll: 2, arrows: false },
      },
    ],
  };

  return (
    <div className="hide-caret">
      <HomeHeader isShowBanner={true} />
      <Specialty settings={settings} />
      <MedicalFacility settings={settings} />
      <PackageSection settings={settings} />
      <OutStandingDoctor settings={settings} />
      {/* <Handbook settings={settings} /> */}

      <About />
      <HomeFooter />
    </div>
  );
};

export default HomePage;
