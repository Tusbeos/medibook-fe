import React from "react";
import { Link } from "react-router-dom";
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
            <Link to="/specialty">Khám chuyên khoa</Link>
            <Link to="/top-doctor">Tìm bác sĩ</Link>
            <Link to="/clinic">Bệnh viện và phòng khám</Link>
            <Link to="/articles">Cẩm nang sức khỏe</Link>
          </div>

          <div className="footer-links">
            <h4>Dành cho bác sĩ</h4>
            <Link to="/doctor/join">Tham gia MediBook</Link>
            <Link to="/login">Cổng bác sĩ</Link>
            <Link to="/doctor/manage-schedule">Quản lý lịch khám</Link>
            <Link to="/support">Trung tâm hỗ trợ</Link>
          </div>

          <div className="footer-subscribe">
            <h4>Cập nhật thông tin</h4>
            <p>Nhận thông tin y tế và cập nhật từ các cơ sở khám chữa bệnh.</p>
            <p className="subscribe-unavailable" role="status">
              Chức năng đăng ký nhận tin đang được cập nhật.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 MediBook Healthcare Solutions. Đã đăng ký bản quyền.
          </span>
          <div>
            <Link to="/privacy-policy">Chính sách bảo mật</Link>
            <Link to="/terms-of-use">Điều khoản sử dụng</Link>
            <Link to="/data-safety">An toàn dữ liệu</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
