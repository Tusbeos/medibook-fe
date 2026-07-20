import React from "react";
import "./HomeFooter.scss";
import headerLogo from "assets/Header Logo 1.png";

const HomeFooter: React.FC = () => {
  return (
    <footer className="home-footer">
      <div className="footer-content-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={headerLogo} alt="MediBook" />
            </div>
            <p>
              MediBook kết nối người bệnh với bác sĩ, chuyên khoa và cơ sở y tế
              phù hợp trên một nền tảng đặt lịch thuận tiện.
            </p>
          </div>

          <div className="footer-links">
            <h4>Dành cho bệnh nhân</h4>
            <button type="button">Khám chuyên khoa</button>
            <button type="button">Tìm bác sĩ</button>
            <button type="button">Bệnh viện và phòng khám</button>
            <button type="button">Cẩm nang sức khỏe</button>
          </div>

          <div className="footer-links">
            <h4>Dành cho bác sĩ</h4>
            <button type="button">Tham gia MediBook</button>
            <button type="button">Cổng bác sĩ</button>
            <button type="button">Quản lý lịch khám</button>
            <button type="button">Trung tâm hỗ trợ</button>
          </div>

          <div className="footer-subscribe">
            <h4>Cập nhật thông tin</h4>
            <p>Nhận thông tin y tế và cập nhật từ các cơ sở khám chữa bệnh.</p>
            <div className="subscribe-form">
              <input type="email" placeholder="Địa chỉ email" />
              <button type="button">Đăng ký</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 MediBook Healthcare Solutions. Đã đăng ký bản quyền.
          </span>
          <div>
            <button type="button">Chính sách bảo mật</button>
            <button type="button">Điều khoản sử dụng</button>
            <button type="button">An toàn dữ liệu</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
