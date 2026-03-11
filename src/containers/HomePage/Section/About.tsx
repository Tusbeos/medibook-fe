import React from 'react';
import { FormattedMessage } from "react-intl";
import logo1 from "../../../assets/about/110757-dantrilogo.png";
import logo2 from "../../../assets/about/142415-logo-vnnet.png";
import logo3 from "../../../assets/about/vnexpress.png";
import logo4 from "../../../assets/about/vtv1.png";
import logo5 from "../../../assets/about/suckhoedoisong.png";
import logo6 from "../../../assets/about/165432-vtcnewslogosvg.png";

interface IMediaLogo {
  src: string;
  alt: string;
}

const mediaLogos: IMediaLogo[] = [
  { src: logo1, alt: "Dân trí" },
  { src: logo2, alt: "VietnamNet" },
  { src: logo3, alt: "VnExpress" },
  { src: logo4, alt: "VTV1" },
  { src: logo5, alt: "Sức khỏe đời sống" },
  { src: logo6, alt: "VTC News" },
];

// About chuyển sang Function Component
const About: React.FC = () => {
  return (
    <div className="section-share section-about">
      <div className="booking-container">
        <div className="section-about-header">
          <FormattedMessage id="home-header.about-us" />
        </div>

        <div className="section-about-content">
          <div className="content-left">
            <div className="video-container">
              <iframe
                width="100%"
                height="320px"
                src="https://www.youtube.com/embed/FyDQljKtWnI"
                title="MediBook Media"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="content-right">
            {mediaLogos.map((item, index) => (
              <div className="img-logo-container" key={index}>
                <img src={item.src} alt={item.alt} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;