import React from "react";

const About: React.FC = () => {
  return (
    <section className="section-share section-about">
      <div className="section-container future-section">
        <div className="future-copy">
          <h2>Đặt lịch khám dễ dàng và minh bạch</h2>
          <p>
            MediBook giúp bạn tìm đúng chuyên khoa, chọn bác sĩ phù hợp và đặt
            lịch khám nhanh chóng với thông tin rõ ràng, bảo mật.
          </p>

          <div className="future-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">
                <i className="fas fa-shield-alt" />
              </span>
              <div className="benefit-text">
                <strong>Bác sĩ xác thực</strong>
                <span>
                  Thông tin chuyên môn được kiểm tra trước khi hiển thị.
                </span>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">
                <i className="fas fa-lock" />
              </span>
              <div className="benefit-text">
                <strong>Bảo mật dữ liệu</strong>
                <span>Thông tin cá nhân và hồ sơ đặt lịch được bảo vệ.</span>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">
                <i className="fas fa-check-circle" />
              </span>
              <div className="benefit-text">
                <strong>Xác nhận nhanh</strong>
                <span>Đặt lịch trực tiếp theo khung giờ còn trống.</span>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">
                <i className="fas fa-headset" />
              </span>
              <div className="benefit-text">
                <strong>Hỗ trợ 24/7</strong>
                <span>Đội ngũ hỗ trợ luôn sẵn sàng khi bạn cần.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="how-card">
          <h3>Quy trình đặt lịch</h3>
          <div className="step">
            <span className="step-index active">1</span>
            <div className="step-text">
              <strong>Tìm chuyên khoa</strong>
              <span>Tìm theo chuyên khoa, tên bác sĩ hoặc triệu chứng.</span>
            </div>
          </div>
          <div className="step">
            <span className="step-index">2</span>
            <div className="step-text">
              <strong>Chọn thời gian</strong>
              <span>Chọn khung giờ phù hợp với lịch cá nhân.</span>
            </div>
          </div>
          <div className="step">
            <span className="step-index">3</span>
            <div className="step-text">
              <strong>Xác nhận và đi khám</strong>
              <span>Nhận xác nhận lịch hẹn và đến cơ sở y tế.</span>
            </div>
          </div>
          <button className="journey-btn" type="button">
            Bắt đầu đặt lịch
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
