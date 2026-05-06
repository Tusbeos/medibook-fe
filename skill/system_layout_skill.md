# 🎨 Skill: Hướng Dẫn Code Giao Diện Các Màn Hình System (Vùng Màu Vàng)

Tài liệu này là **nguyên tắc bắt buộc** khi thiết kế và code giao diện cho các trang quản trị (Admin/Doctor) trong hệ thống E-Medical Booking.

## 1. Kiến Trúc Layout Tổng Thể
Màn hình hệ thống được chia làm 3 khối cố định (như trong bản vẽ thiết kế):
- 🟩 **Vùng Xanh lá (Sidebar - MenuApp)**: Khối điều hướng bên trái. (Cố định)
- 🟥 **Vùng Đỏ (Header)**: Khối tiêu đề, thanh tìm kiếm và thông tin user ở trên cùng. (Cố định)
- 🟨 **Vùng Vàng (Main Content / Page)**: Khu vực nội dung thay đổi theo từng chức năng.

> [!WARNING]
> **QUY TẮC BẤT DI BẤT DỊCH**: Khi code một trang chức năng mới (VD: Quản lý bác sĩ, Quản lý phòng khám,...), **TUYỆT ĐỐI KHÔNG** đụng chạm, sửa đổi hay thêm bớt code vào 2 khối `Header.tsx` và `Sidebar.tsx`. Chỉ tập trung xử lý phần giao diện nằm trọn trong **Vùng Màu Vàng**.

---

## 2. Cách Layout Đã Được Cấu Hình Sẵn
Layout tổng đã được bọc sẵn ở component cha (`System.tsx` hoặc `Doctor.tsx`). Khung sườn thực tế trông như sau:

```tsx
// KHÔNG CẦN VIẾT LẠI ĐOẠN NÀY, NÓ ĐÃ CÓ SẴN Ở COMPONENT CHA
<div className="admin-layout">
  <Sidebar /> {/* 🟩 VÙNG XANH: Cố định bên trái */}
  <div className="admin-main">
    <Header /> {/* 🟥 VÙNG ĐỎ: Cố định bên trên */}
    
    {/* 🟨 VÙNG VÀNG: Nơi các component của bạn được render ra */}
    <div className="system-container">
      <Routes>
        <Route path="manage-doctor" element={<ManageDoctor />} />
        {/* Component của bạn sẽ nằm ở đây */}
      </Routes>
    </div>

  </div>
</div>
```

---

## 3. Template Khi Tạo Màn Hình Mới (Áp dụng cho Vùng Vàng)
Khi tạo một component chức năng mới (ví dụ: `ManagePackage.tsx`), bạn chỉ cần code như một trang độc lập bình thường. Khối bọc ngoài cùng nên là một `div` mang tên class riêng của chức năng đó.

**✅ Chuẩn Cấu Trúc React Component:**
```tsx
import React, { useState, useEffect } from 'react';
import './ManagePackage.scss';

const ManagePackage: React.FC = () => {
  return (
    // Toàn bộ phần này sẽ tự động lọt thỏm vào Vùng Màu Vàng
    <div className="manage-package-container">
      {/* 1. Tiêu đề nhỏ hoặc Breadcrumb của phần nội dung (tuỳ chọn) */}
      <div className="title-section">
        <h3>Quản lý gói khám</h3>
      </div>
      
      {/* 2. Khu vực Thống kê / Thẻ thông tin (Cards) */}
      <div className="dashboard-cards">
        {/* Code các thẻ thống kê tại đây */}
      </div>

      {/* 3. Khu vực Bộ lọc (Filters) & Thanh công cụ (Toolbar) */}
      <div className="toolbar-section">
        {/* Nút Thêm mới, Dropdown lọc trạng thái... */}
      </div>

      {/* 4. Khu vực Bảng dữ liệu chính (Data Table) */}
      <div className="table-section">
        {/* Code danh sách dạng Grid/Table tại đây */}
      </div>
    </div>
  );
};

export default ManagePackage;
```

**✅ Chuẩn Cấu Trúc CSS/SCSS (ManagePackage.scss):**
```scss
// Chỉ CSS các class nằm gọn trong container của bạn, KHÔNG CSS đè ra body hay .admin-layout
.manage-package-container {
  padding: 24px;
  width: 100%;
  height: 100%;
  
  .title-section {
    margin-bottom: 20px;
    // ...
  }
  
  // Các thẻ thống kê trắng tinh, bo góc, có bóng mờ nhẹ
  .dashboard-cards {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
    
    .card-item {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      padding: 16px;
      // ...
    }
  }
}
```

---

## 4. Những Điều Cần Tránh ❌
1. ❌ **KHÔNG import `Header` hay `Sidebar`** vào trong component của màn hình chức năng.
2. ❌ **KHÔNG dùng `position: fixed`** hay `absolute` so với toàn màn hình cho các layout chính của bạn (nếu có dùng absolute thì chỉ dùng trong phạm vi relative của vùng vàng để làm các dropdown, tooltip, modal).
3. ❌ **KHÔNG ghi đè CSS hệ thống**: Không viết CSS trực tiếp cho các thẻ `html`, `body` hay các class chung như `.header-topbar`, `.admin-layout` từ file scss của chức năng.
4. ❌ **KHÔNG cuộn toàn trang (Body Scroll)**: Vùng màu vàng đã được thiết lập `CustomScrollbars` hoặc cuộn độc lập (`overflow-y: auto`), hãy để nội dung bên trong vùng vàng tự cuộn, không ép chiều cao khiến header/sidebar bị trôi đi.

Chỉ cần tuân thủ cấu trúc trên, bạn có thể tự do sáng tạo, thêm bảng biểu, biểu đồ, thẻ card trong vùng giới hạn màu vàng một cách an toàn mà không sợ làm hỏng cấu trúc hệ thống.
