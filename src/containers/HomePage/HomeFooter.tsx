import React from 'react';
import "./HomeFooter.scss";
import imgHome from "assets/footer/home.png";
import imgBer from "assets/footer/bernard.png";
import imgDoc from "assets/footer/doctor-check.png";

// HomeFooter chuyển sang Function Component (Presentational - không cần Redux)
const HomeFooter: React.FC = () => {
    return (
      <div className="home-footer">
        <div className="footer-content-container">
          <div className="footer-top-section row">
            <div className="col-md-5 col-sm-12 footer-col">
              <div className="company-info">
                <small>Công ty Cổ phần Công nghệ MediBook</small>
                <div className="info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>
                    Lô B4/D21, Khu đô thị mới Cầu Giấy, Phường Dịch Vọng Hậu,
                    Quận Cầu Giấy, Thành phố Hà Nội, Việt Nam
                  </span>
                </div>
                <div className="info-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>
                    ĐKKD số: 0106790291. Sở KHĐT Hà Nội cấp ngày 16/03/2015
                  </span>
                </div>
                <div className="info-item">
                  <i className="fas fa-phone-alt"></i>
                  <span>024-7301-2468 (7h30 - 18h)</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-envelope"></i>
                  <span>support@medibook.vn (7h30 - 18h)</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>
                    <strong>Văn phòng tại TP Hồ Chí Minh</strong>
                    <br />
                    Tòa nhà H3 Building, số 384 Hoàng Diệu, phường Khánh Hội, Tp
                    Hồ Chí Minh
                  </span>
                </div>

                {/* Ảnh bộ công thương - Bạn thay src bằng ảnh thật của bạn */}
                <div className="bct-badges">
                  <img
                    src="https://medibook.vn/assets/icon/bo-cong-thuong.svg"
                    alt="Da dang ky"
                    width="100"
                  />
                  <img
                    src="https://medibook.vn/assets/icon/bo-cong-thuong.svg"
                    alt="Da thong bao"
                    width="100"
                    className="ml-2"
                  />
                </div>
              </div>
            </div>

            {/* Cột 2: Logo & Links */}
            <div className="col-md-3 col-sm-12 footer-col">
              <div className="MediBook-links">
                {/* Logo MediBook */}
                <div className="footer-logo mb-3">
                  <strong style={{ color: "#45c3d2", fontSize: "20px" }}>
                    MediBook
                  </strong>
                </div>
                <ul>
                  <li>
                    <button type="button" className="footer-link-btn">
                      Liên hệ hợp tác
                    </button>
                  </li>
                  <li>
                    <button type="button" className="footer-link-btn">
                      Chuyển đổi số
                    </button>
                  </li>
                  <li>
                    <button type="button" className="footer-link-btn">
                      Chính sách bảo mật
                    </button>
                  </li>
                  <li>
                    <button type="button" className="footer-link-btn">
                      Quy chế hoạt động
                    </button>
                  </li>
                  <li>
                    <button type="button" className="footer-link-btn">
                      Tuyển dụng
                    </button>
                  </li>
                  <li>
                    <button type="button" className="footer-link-btn">
                      Điều khoản sử dụng
                    </button>
                  </li>
                  <li>
                    <button type="button" className="footer-link-btn">
                      Câu hỏi thường gặp
                    </button>
                  </li>
                  <li>
                    <button type="button" className="footer-link-btn">
                      Sức khỏe doanh nghiệp
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-md-4 col-sm-12 footer-col">
              <div className="partner-section">
                <strong>Đối tác bảo trợ nội dung</strong>
                <div className="partner-item">
                  <div className="partner-logo">
                    <img src={imgHome} alt="Hello Doctor" />
                  </div>
                  <div className="partner-text">
                    <strong>Hello Doctor</strong>
                    <span>
                      Bảo trợ chuyên mục nội dung "Sức khỏe tinh thần"
                    </span>
                  </div>
                </div>
                <div className="partner-item">
                  <div className="partner-logo">
                    <img src={imgBer} alt="Bernard" />
                  </div>
                  <div className="partner-text">
                    <strong>Hệ thống y khoa chuyên sâu quốc tế Bernard</strong>
                    <span>Bảo trợ chuyên mục nội dung "Y khoa chuyên sâu"</span>
                  </div>
                </div>
                <div className="partner-item">
                  <div className="partner-logo">
                    <img src={imgDoc} alt="Doctor Check" />
                  </div>
                  <div className="partner-text">
                    <strong>
                      Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn
                    </strong>
                    <span>
                      Bảo trợ chuyên mục nội dung "Sức khỏe tổng quát"
                    </span>
                  </div>
                </div>
              </div>

              <div className="app-download mt-3">
                <i className="fas fa-mobile-alt mr-2"></i>
                <span>
                  Tải ứng dụng MediBook cho điện thoại hoặc máy tính bảng:{" "}
                </span>
                <a
                  href="https://play.google.com/store/apps/details?id=vn.medibook.MediBook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-btn"
                >
                  Android
                </a>{" "}
                -
                <a
                  href="https://apps.apple.com/vn/app/medibook/id1347700144"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-btn"
                >
                  iPhone/iPad
                </a>{" "}
                -
                <a
                  href="https://medibook.vn/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-btn"
                >
                  Khác
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container d-flex justify-content-between align-items-center h-100">
            <div className="copyright">&copy; 2026 MediBook.</div>
            <div className="social-icons">
              <button type="button" className="footer-link-btn">
                <i className="fab fa-tiktok"></i>
              </button>
              <button type="button" className="footer-link-btn">
                <i className="fab fa-facebook-square"></i>
              </button>
              <button type="button" className="footer-link-btn">
                <i className="fab fa-youtube"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default HomeFooter;
