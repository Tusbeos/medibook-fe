import React from "react";
import { Link, useLocation } from "react-router-dom";

import HomeFooter from "layout/HomeFooter";
import HomeHeader from "layout/HomeHeader";
import "./PublicInformationPage.scss";

type InformationPage = {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: Array<{ title: string; content: string }>;
  contact?: boolean;
};

const INFORMATION_PAGES: Record<string, InformationPage> = {
  "/doctor/join": {
    eyebrow: "Dành cho bác sĩ",
    title: "Tham gia MediBook",
    introduction:
      "MediBook cấp tài khoản bác sĩ theo quy trình xác minh nội bộ để bảo đảm thông tin chuyên môn được quản lý chính xác.",
    sections: [
      {
        title: "Quy trình tham gia",
        content:
          "Gửi yêu cầu tham gia cùng thông tin liên hệ và cơ sở công tác. Quản trị viên sẽ xác minh thông tin, tạo tài khoản phù hợp và hướng dẫn đăng nhập cổng bác sĩ.",
      },
      {
        title: "Sau khi được cấp tài khoản",
        content:
          "Bác sĩ có thể quản lý lịch khám, danh sách bệnh nhân và hồ sơ khám trong phạm vi quyền được phân công.",
      },
    ],
    contact: true,
  },
  "/support": {
    eyebrow: "Hỗ trợ MediBook",
    title: "Trung tâm hỗ trợ",
    introduction:
      "Liên hệ đội ngũ MediBook khi cần hỗ trợ về tài khoản, đặt lịch hoặc sử dụng cổng quản trị.",
    sections: [
      {
        title: "Hỗ trợ người bệnh",
        content:
          "Cung cấp họ tên, email đã dùng để đặt lịch và mã lịch hẹn (nếu có) để đội ngũ hỗ trợ kiểm tra nhanh hơn.",
      },
      {
        title: "Hỗ trợ tài khoản nội bộ",
        content:
          "Tài khoản bác sĩ, quản lý phòng khám và người viết bài được cấp nội bộ. Không gửi mật khẩu hoặc token đăng nhập qua email.",
      },
    ],
    contact: true,
  },
  "/privacy-policy": {
    eyebrow: "Thông tin pháp lý",
    title: "Chính sách bảo mật",
    introduction:
      "MediBook chỉ sử dụng dữ liệu cần thiết để vận hành tài khoản, đặt lịch khám và hỗ trợ người dùng theo các quyền được cấp.",
    sections: [
      {
        title: "Dữ liệu được xử lý",
        content:
          "Thông tin tài khoản, thông tin liên hệ, hồ sơ bệnh nhân và dữ liệu lịch hẹn được dùng để xác thực, tạo và quản lý lịch khám.",
      },
      {
        title: "Kiểm soát truy cập",
        content:
          "Dữ liệu được giới hạn theo vai trò. Người dùng chỉ được truy cập thông tin cần thiết cho chức năng của mình.",
      },
    ],
  },
  "/terms-of-use": {
    eyebrow: "Thông tin pháp lý",
    title: "Điều khoản sử dụng",
    introduction:
      "Khi sử dụng MediBook, người dùng cần cung cấp thông tin chính xác và bảo vệ thông tin đăng nhập của mình.",
    sections: [
      {
        title: "Trách nhiệm người dùng",
        content:
          "Không chia sẻ mật khẩu, token hoặc sử dụng tài khoản của người khác. Thông tin đặt lịch cần phản ánh đúng người được khám.",
      },
      {
        title: "Phạm vi dịch vụ",
        content:
          "MediBook hỗ trợ kết nối, đặt và quản lý lịch khám. Việc thăm khám và kết luận chuyên môn do cơ sở y tế, bác sĩ phụ trách.",
      },
    ],
  },
  "/data-safety": {
    eyebrow: "Thông tin pháp lý",
    title: "An toàn dữ liệu",
    introduction:
      "MediBook áp dụng các biện pháp xác thực và phân quyền để giảm rủi ro truy cập dữ liệu không phù hợp.",
    sections: [
      {
        title: "Bảo vệ tài khoản",
        content:
          "Sử dụng mật khẩu mạnh, đăng xuất trên thiết bị dùng chung và thông báo ngay cho đội ngũ hỗ trợ nếu phát hiện truy cập bất thường.",
      },
      {
        title: "Bảo vệ thông tin khám bệnh",
        content:
          "Chỉ chia sẻ thông tin cần thiết trong biểu mẫu đặt lịch. Không gửi ảnh giấy tờ, mật khẩu hoặc token qua các kênh không được xác minh.",
      },
    ],
  },
};

const SUPPORT_EMAIL = "support@emedical.com";

const PublicInformationPage: React.FC = () => {
  const { pathname } = useLocation();
  const page = INFORMATION_PAGES[pathname] ?? INFORMATION_PAGES["/support"];

  return (
    <div className="public-information-page">
      <HomeHeader isShowBanner={false} />
      <main className="information-content">
        <section className="information-hero">
          <span>{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.introduction}</p>
        </section>

        <section className="information-sections" aria-label={page.title}>
          {page.sections.map((section) => (
            <article key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.content}</p>
            </article>
          ))}
        </section>

        {page.contact && (
          <section className="information-contact">
            <h2>Cần hỗ trợ thêm?</h2>
            <p>Gửi yêu cầu đến đội ngũ MediBook để được hướng dẫn.</p>
            <a href={`mailto:${SUPPORT_EMAIL}`}>Liên hệ hỗ trợ</a>
          </section>
        )}

        <Link className="information-back-link" to="/home">
          Quay về trang chủ
        </Link>
      </main>
      <HomeFooter />
    </div>
  );
};

export default PublicInformationPage;
