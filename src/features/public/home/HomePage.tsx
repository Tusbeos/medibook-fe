import React from "react";
import HomeHeader from "layout/HomeHeader";
import Specialty from "./sections/Specialty";
import OutStandingDoctor from "./sections/OutStandingDoctor";
import About from "./sections/About";
import MedicalFacility from "./sections/MedicalFacility";
import HomeFooter from "layout/HomeFooter";
import "./HomePage.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <HomeHeader isShowBanner={true} />
      <Specialty />
      <MedicalFacility />
      <OutStandingDoctor />
      <About />
      <HomeFooter />
    </div>
  );
};

export default HomePage;
